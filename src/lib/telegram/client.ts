import 'server-only';
import { logger } from '@/lib/logger';

const TELEGRAM_API_BASE = 'https://api.telegram.org';

interface SendMessageOptions {
  parse_mode?: 'HTML' | 'MarkdownV2';
  reply_markup?: unknown;
  disable_web_page_preview?: boolean;
}

/**
 * Sends a message to a Telegram chat using the bot token.
 * Automatically splits messages exceeding Telegram's 4096 character limit.
 * Handles rate limits (HTTP 429) gracefully.
 */
export async function sendTelegramMessage(
  chatId: string,
  text: string,
  options: SendMessageOptions = { parse_mode: 'HTML' }
): Promise<{ ok: boolean; messageId?: number; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    logger.error('TELEGRAM_BOT_TOKEN is not configured');
    return { ok: false, error: 'Telegram bot token is missing' };
  }

  // Telegram character limit is 4096 characters per message
  const MAX_LENGTH = 4000;
  if (text.length > MAX_LENGTH) {
    // Split message into chunks by newlines if possible
    const chunks = splitTextIntoChunks(text, MAX_LENGTH);
    let lastResult = { ok: true };
    for (const chunk of chunks) {
      lastResult = await sendSingleTelegramMessage(token, chatId, chunk, options);
      if (!lastResult.ok) break;
    }
    return lastResult;
  }

  return sendSingleTelegramMessage(token, chatId, text, options);
}

async function sendSingleTelegramMessage(
  token: string,
  chatId: string,
  text: string,
  options: SendMessageOptions
): Promise<{ ok: boolean; messageId?: number; error?: string }> {
  const url = `${TELEGRAM_API_BASE}/bot${token}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options.parse_mode,
        reply_markup: options.reply_markup,
        disable_web_page_preview: options.disable_web_page_preview ?? true,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      // Handle rate limits: HTTP 429
      if (res.status === 429 && data.parameters?.retry_after) {
        logger.warn('Telegram rate limited', {
          retryAfter: data.parameters.retry_after,
          chatId,
        });
        return {
          ok: false,
          error: `Telegram rate limited. Retry after ${data.parameters.retry_after}s`,
        };
      }

      logger.error('Telegram sendMessage failed', {
        status: res.status,
        description: data.description,
      });
      return {
        ok: false,
        error: data.description || 'Failed to deliver Telegram message',
      };
    }

    return {
      ok: true,
      messageId: data.result?.message_id,
    };
  } catch (err: unknown) {
    const errorObj = err as { message?: string };
    logger.error('Telegram network error', { error: errorObj?.message });
    return { ok: false, error: 'Network failure communicating with Telegram' };
  }
}

function splitTextIntoChunks(text: string, maxLen: number): string[] {
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }

    // Try splitting at nearest newline within limit
    let splitIdx = remaining.lastIndexOf('\n', maxLen);
    if (splitIdx === -1 || splitIdx < maxLen * 0.5) {
      // Fallback to nearest space
      splitIdx = remaining.lastIndexOf(' ', maxLen);
      if (splitIdx === -1) {
        splitIdx = maxLen;
      }
    }

    chunks.push(remaining.substring(0, splitIdx));
    remaining = remaining.substring(splitIdx).trimStart();
  }

  return chunks;
}
