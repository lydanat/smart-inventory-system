import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendTelegramMessage } from '@/lib/telegram/client';
import { verifyAndConsumeTelegramCode } from '@/lib/telegram/link';
import { logger } from '@/lib/logger';
import { formatCurrency } from '@/lib/utils';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: {
      id: number;
      is_bot: boolean;
      first_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
      title?: string;
    };
    date: number;
    text?: string;
  };
}

/**
 * Timing-safe string comparison to prevent timing attacks on webhook secrets
 */
function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // 1. Verify Secret Token header
  const secretHeader = request.headers.get('x-telegram-bot-api-secret-token') || '';
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET || '';

  if (!expectedSecret || !safeCompare(secretHeader, expectedSecret)) {
    logger.warn('Unauthorized webhook request rejected');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const update: TelegramUpdate = await request.json();
    const message = update.message;

    if (!message || !message.text) {
      // Non-message update (e.g., inline query, reaction, edit); acknowledge safely
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id.toString();
    const text = message.text.trim();

    const numericChatId = parseInt(chatId, 10);

    // 2. Route commands
    if (text.startsWith('/start')) {
      const parts = text.split(/\s+/);
      const code = parts[1];

      if (code) {
        // Link business via code
        const result = await verifyAndConsumeTelegramCode(code, chatId);
        if (result.success) {
          await sendTelegramMessage(
            chatId,
            `🎉 <b>Connected to ${result.businessName}!</b>\n\n` +
              `You will now receive automated low stock alerts and expiration reminders for your store.\n\n` +
              `Available commands:\n` +
              `• /status — Instant inventory overview\n` +
              `• /low — View all low stock items\n` +
              `• /stop — Unlink and disable alerts\n` +
              `• /help — Show command list`
          );
        } else {
          await sendTelegramMessage(
            chatId,
            `⚠️ <b>Connection Failed</b>\n\n${result.error}`
          );
        }
      } else {
        // Generic /start without code
        await sendTelegramMessage(
          chatId,
          `👋 <b>Welcome to Smart Inventory AI!</b>\n\n` +
            `To connect your store and receive real-time inventory alerts:\n` +
            `1. Open your web app and go to <b>Alerts & Settings</b>\n` +
            `2. Click <b>Connect Telegram</b> to get a 6-character link code\n` +
            `3. Type <code>/start CODE</code> here or tap the deep link on your dashboard.`
        );
      }
    } else if (text === '/status') {
      // Find business linked to this chat_id
      const { data: business } = await supabaseAdmin
        .from('businesses')
        .select('id, name')
        .eq('telegram_chat_id', isNaN(numericChatId) ? 0 : numericChatId)
        .maybeSingle();

      if (!business) {
        await sendTelegramMessage(
          chatId,
          `ℹ️ This Telegram chat is not currently connected to any store.\n\n` +
            `Please connect via the web dashboard.`
        );
      } else {
        const { data: summary } = await supabaseAdmin.rpc('dashboard_summary', {
          _business_id: business.id,
        });

        const raw = (summary || {}) as Record<string, unknown>;
        const totalItems = Number(raw.total_items) || 0;
        const lowStock = Number(raw.low_stock_count) || 0;
        const outOfStock = Number(raw.out_of_stock_count) || 0;
        const expiringSoon = Number(raw.expiring_soon_count) || 0;
        const stockValue = formatCurrency(Number(raw.total_stock_value) || 0);

        await sendTelegramMessage(
          chatId,
          `📊 <b>Inventory Status: ${business.name}</b>\n\n` +
            `• <b>Total SKUs:</b> ${totalItems}\n` +
            `• <b>Low Stock Items:</b> ${lowStock}\n` +
            `• <b>Out of Stock:</b> ${outOfStock}\n` +
            `• <b>Expiring Soon (7d):</b> ${expiringSoon}\n` +
            `• <b>Total Stock Value:</b> ${stockValue}\n\n` +
            `Type /low to see items that need restock.`
        );
      }
    } else if (text === '/low') {
      const { data: business } = await supabaseAdmin
        .from('businesses')
        .select('id, name')
        .eq('telegram_chat_id', isNaN(numericChatId) ? 0 : numericChatId)
        .maybeSingle();

      if (!business) {
        await sendTelegramMessage(
          chatId,
          `ℹ️ This Telegram chat is not connected to a store. Please connect via your web dashboard.`
        );
      } else {
        const { data: lowItems } = await supabaseAdmin
          .from('items')
          .select('name, category, quantity, unit, low_stock_threshold')
          .eq('business_id', business.id)
          .is('archived_at', null)
          .order('quantity', { ascending: true })
          .limit(20);

        const filtered = (lowItems || []).filter(
          (item) => item.quantity <= item.low_stock_threshold
        );

        if (filtered.length === 0) {
          await sendTelegramMessage(
            chatId,
            `✅ <b>All items healthy!</b>\n\nNo items are currently below their reorder threshold in <b>${business.name}</b>.`
          );
        } else {
          let msg = `⚠️ <b>Low Stock Items (${filtered.length}): ${business.name}</b>\n\n`;
          for (const item of filtered) {
            const status = item.quantity === 0 ? '❌ OUT OF STOCK' : '⚠️ LOW';
            msg += `• <b>${item.name}</b> (${item.category})\n  Current: <b>${item.quantity} ${item.unit}</b> (Min: ${item.low_stock_threshold})\n  Status: ${status}\n\n`;
          }
          await sendTelegramMessage(chatId, msg);
        }
      }
    } else if (text === '/stop') {
      const { data: business } = await supabaseAdmin
        .from('businesses')
        .select('id, name')
        .eq('telegram_chat_id', isNaN(numericChatId) ? 0 : numericChatId)
        .maybeSingle();

      if (business) {
        await supabaseAdmin
          .from('businesses')
          .update({
            telegram_chat_id: null,
            telegram_linked_at: null,
            alerts_enabled: false,
          })
          .eq('id', business.id);

        await sendTelegramMessage(
          chatId,
          `🔕 <b>Disconnected</b>\n\n` +
            `This chat has been disconnected from <b>${business.name}</b>. You will no longer receive alerts.`
        );
      } else {
        await sendTelegramMessage(chatId, `ℹ️ No active store was connected to this chat.`);
      }
    } else if (text === '/help') {
      await sendTelegramMessage(
        chatId,
        `🤖 <b>Smart Inventory Bot Commands:</b>\n\n` +
          `• <b>/status</b> — Summary of active store inventory\n` +
          `• <b>/low</b> — List all low stock or stockout items\n` +
          `• <b>/stop</b> — Disconnect this chat from your store\n` +
          `• <b>/help</b> — Show this command reference`
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const errorObj = err as { message?: string };
    logger.error('Error handling Telegram webhook', { error: errorObj?.message });
    // Always return HTTP 200 to Telegram so it does not endlessly retry delivery
    return NextResponse.json({ ok: true });
  }
}
