import 'server-only';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';

export interface TelegramLinkResult {
  code: string;
  deepLink: string;
  expiresAt: string;
}

/**
 * Generates a high-entropy 6-character alphanumeric code for linking Telegram.
 * Stores the SHA-256 hash in telegram_link_codes with a 15-minute expiry.
 */
export async function createTelegramLinkCode(
  businessId: string,
  userId: string
): Promise<TelegramLinkResult> {
  // Generate random 6-character code (uppercase letters and digits, excluding ambiguous chars like 0/O, 1/I)
  const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const randomBytes = crypto.randomBytes(6);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += charset[randomBytes[i] % charset.length];
  }

  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  // Invalidate any existing unused codes for this business
  await supabaseAdmin
    .from('telegram_link_codes')
    .delete()
    .eq('business_id', businessId)
    .is('used_at', null);

  // Insert hashed code
  const { error } = await supabaseAdmin.from('telegram_link_codes').insert({
    code_hash: codeHash,
    business_id: businessId,
    created_by: userId,
    expires_at: expiresAt,
  });

  if (error) {
    logger.error('Failed to store telegram link code', { error: error.message, businessId });
    throw new Error('Failed to generate connection code');
  }

  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'AIinventorysystemBOT';
  const deepLink = `https://t.me/${botUsername}?start=${code}`;

  return {
    code,
    deepLink,
    expiresAt,
  };
}

/**
 * Verifies a 6-character link code received by the Telegram webhook.
 * If valid, links the chat_id to the business, enables alerts, and marks the code as used.
 */
export async function verifyAndConsumeTelegramCode(
  code: string,
  chatId: string
): Promise<{ success: boolean; businessName?: string; error?: string }> {
  const codeHash = crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
  const now = new Date().toISOString();

  // Find valid unexpired, unused code
  const { data: linkRecord, error: findError } = await supabaseAdmin
    .from('telegram_link_codes')
    .select('code_hash, business_id, expires_at, used_at, businesses(id, name)')
    .eq('code_hash', codeHash)
    .is('used_at', null)
    .gt('expires_at', now)
    .maybeSingle();

  if (findError || !linkRecord) {
    logger.warn('Invalid or expired Telegram link code attempted', { codeHashPrefix: codeHash.substring(0, 8) });
    return {
      success: false,
      error: 'Invalid or expired connection code. Please generate a new code from the web dashboard.',
    };
  }

  const business = linkRecord.businesses as unknown as { id: string; name: string } | null;
  const businessId = linkRecord.business_id;

  // Mark code as used
  await supabaseAdmin
    .from('telegram_link_codes')
    .update({ used_at: now })
    .eq('code_hash', codeHash);

  // Link chat_id to business and enable alerts
  const parsedChatId = parseInt(chatId, 10);
  const { error: updateError } = await supabaseAdmin
    .from('businesses')
    .update({
      telegram_chat_id: isNaN(parsedChatId) ? null : parsedChatId,
      telegram_linked_at: now,
      alerts_enabled: true,
    })
    .eq('id', businessId);

  if (updateError) {
    logger.error('Failed to link business to Telegram chat', {
      error: updateError.message,
      businessId,
    });
    return {
      success: false,
      error: 'Failed to update store settings. Please try again.',
    };
  }

  logger.info('Telegram chat successfully linked to business', {
    businessId,
    chatId,
  });

  return {
    success: true,
    businessName: business?.name || 'Your Store',
  };
}
