import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendTelegramMessage } from '@/lib/telegram/client';
import { logger } from '@/lib/logger';
import { formatDate } from '@/lib/utils';

function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization') || '';
  const expectedToken = process.env.CRON_SECRET || '';

  if (!expectedToken || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7).trim();
  try {
    const bufA = Buffer.from(token);
    const bufB = Buffer.from(expectedToken);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    logger.warn('Unauthorized expiry cron attempt rejected');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { data: businesses, error: busError } = await supabaseAdmin
      .from('businesses')
      .select('id, name, telegram_chat_id')
      .eq('alerts_enabled', true)
      .not('telegram_chat_id', 'is', null);

    if (busError || !businesses || businesses.length === 0) {
      return NextResponse.json({ ok: true, alertsSent: 0, message: 'No active alert subscribers' });
    }

    let totalAlertsSent = 0;
    const today = new Date().toISOString().split('T')[0];

    // Define target warning intervals in days
    const in7Days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    for (const b of businesses) {
      if (!b.telegram_chat_id) continue;

      // Fetch items expiring on or before in7Days with quantity > 0
      const { data: items } = await supabaseAdmin
        .from('items')
        .select('id, name, category, quantity, unit, expiry_date')
        .eq('business_id', b.id)
        .is('archived_at', null)
        .gt('quantity', 0)
        .not('expiry_date', 'is', null)
        .lte('expiry_date', in7Days);

      if (!items || items.length === 0) continue;

      // Check daily idempotency per item via dedupe_day in alert_events
      const itemsToAlert = [];
      for (const item of items) {
        if (!item.expiry_date) continue;

        const { count } = await supabaseAdmin
          .from('alert_events')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', b.id)
          .eq('item_id', item.id)
          .in('kind', ['expiring_soon', 'expired'])
          .eq('dedupe_day', today);

        if (!count || count === 0) {
          const isExpired = item.expiry_date < today;
          itemsToAlert.push({
            ...item,
            isExpired,
          });
        }
      }

      if (itemsToAlert.length === 0) continue;

      let msg = `⏳ <b>Product Expiration Notice: ${b.name}</b>\n\n`;
      msg += `The following <b>${itemsToAlert.length}</b> product(s) are expired or expiring soon:\n\n`;

      for (const item of itemsToAlert) {
        const icon = item.isExpired ? '🔴' : '🟠';
        const label = item.isExpired ? 'EXPIRED' : 'EXPIRING SOON';
        msg += `${icon} <b>${item.name}</b> (${item.category})\n`;
        msg += `   Remaining: <b>${item.quantity} ${item.unit}</b>\n`;
        msg += `   Expiry Date: <b>${formatDate(item.expiry_date!)}</b> (${label})\n\n`;
      }

      msg += `<i>Check your store catalog to apply markdowns or retire expired stock.</i>`;

      const sendResult = await sendTelegramMessage(b.telegram_chat_id.toString(), msg);

      if (sendResult.ok) {
        totalAlertsSent += itemsToAlert.length;

        const eventsToInsert = itemsToAlert.map((item) => ({
          business_id: b.id,
          item_id: item.id,
          kind: item.isExpired ? 'expired' : 'expiring_soon',
          detail: `${item.name}: ${item.quantity} ${item.unit} expiring on ${item.expiry_date}`,
          dedupe_day: today,
          status: 'sent',
        }));

        await supabaseAdmin.from('alert_events').insert(eventsToInsert);
      }
    }

    return NextResponse.json({
      ok: true,
      alertsSent: totalAlertsSent,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorObj = err as { message?: string };
    logger.error('Error executing expiry cron', { error: errorObj?.message });
    return NextResponse.json({ ok: false, error: 'Internal cron error' }, { status: 500 });
  }
}
