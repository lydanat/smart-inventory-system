'use server';

import { z } from 'zod';
import { withAuth } from '@/lib/security/action-wrapper';
import { createTelegramLinkCode } from '@/lib/telegram/link';
import { sendTelegramMessage } from '@/lib/telegram/client';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

/**
 * Generates a temporary 15-minute 6-character code to link Telegram bot
 */
export const generateTelegramLinkCodeAction = withAuth(
  {
    requiredRole: ['owner', 'manager'],
  },
  async (_input, ctx) => {
    const result = await createTelegramLinkCode(ctx.businessId, ctx.userId);
    return result;
  }
);

/**
 * Sends a real-time test alert message to the connected Telegram chat
 */
export const sendTestAlertAction = withAuth(
  {
    requiredRole: ['owner', 'manager', 'staff'],
  },
  async (_input, ctx) => {
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('name, telegram_chat_id, alerts_enabled')
      .eq('id', ctx.businessId)
      .single();

    if (!business?.telegram_chat_id) {
      throw new Error('No Telegram chat is currently linked to this store.');
    }

    const testMessage =
      `🧪 <b>Test Notification from Smart Inventory AI</b>\n\n` +
      `Store: <b>${business.name}</b>\n` +
      `Status: <b>Active & Connected</b>\n\n` +
      `Your Telegram alert channel is successfully configured. You will receive notifications when items fall below reorder thresholds or approach expiration.`;

    const res = await sendTelegramMessage(business.telegram_chat_id.toString(), testMessage);

    if (!res.ok) {
      throw new Error(res.error || 'Failed to deliver test message to Telegram.');
    }

    // Record test in alert_events
    const today = new Date().toISOString().split('T')[0];
    await supabaseAdmin.from('alert_events').insert({
      business_id: ctx.businessId,
      kind: 'test_alert',
      detail: `Test notification sent by ${ctx.userEmail}`,
      dedupe_day: today,
      status: 'sent',
    });

    revalidatePath('/alerts');
    return { success: true };
  }
);

/**
 * Disconnects Telegram chat from the business
 */
export const disconnectTelegramAction = withAuth(
  {
    requiredRole: ['owner', 'manager'],
  },
  async (_input, ctx) => {
    const { error } = await supabaseAdmin
      .from('businesses')
      .update({
        telegram_chat_id: null,
        telegram_linked_at: null,
        alerts_enabled: false,
      })
      .eq('id', ctx.businessId);

    if (error) {
      throw new Error('Failed to disconnect Telegram.');
    }

    revalidatePath('/alerts');
    return { success: true };
  }
);

const toggleAlertsSchema = z.object({
  enabled: z.boolean(),
});

/**
 * Toggles Telegram alerts on or off
 */
export const toggleTelegramAlertsAction = withAuth(
  {
    schema: toggleAlertsSchema,
    requiredRole: ['owner', 'manager'],
  },
  async (input, ctx) => {
    const { enabled } = input;

    const { error } = await supabaseAdmin
      .from('businesses')
      .update({
        alerts_enabled: enabled,
      })
      .eq('id', ctx.businessId);

    if (error) {
      throw new Error('Failed to update alert settings.');
    }

    revalidatePath('/alerts');
    return { enabled };
  }
);
