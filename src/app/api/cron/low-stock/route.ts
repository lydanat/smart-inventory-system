import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendTelegramMessage } from '@/lib/telegram/client';
import { logger } from '@/lib/logger';

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
    logger.warn('Unauthorized low-stock cron attempt rejected');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // 1. Fetch businesses with Telegram alerts enabled and a valid chat ID
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

    for (const b of businesses) {
      if (!b.telegram_chat_id) continue;

      // 2. Fetch all low stock items for this business
      const { data: items } = await supabaseAdmin
        .from('items')
        .select('id, name, category, quantity, unit, low_stock_threshold')
        .eq('business_id', b.id)
        .is('archived_at', null);

      if (!items) continue;

      const lowItems = items.filter((item) => item.quantity <= item.low_stock_threshold);
      if (lowItems.length === 0) continue;

      // 3. Filter by daily idempotency via dedupe_day in alert_events
      const itemsToAlert = [];
      for (const item of lowItems) {
        const { count } = await supabaseAdmin
          .from('alert_events')
          .select('id', { count: 'exact', head: true })
          .eq('business_id', b.id)
          .eq('item_id', item.id)
          .in('kind', ['low_stock', 'out_of_stock'])
          .eq('dedupe_day', today);

        if (!count || count === 0) {
          itemsToAlert.push(item);
        }
      }

      if (itemsToAlert.length === 0) continue;

      // 4. Construct and send notification message
      let msg = `🚨 <b>Low Stock Alert: ${b.name}</b>\n\n`;
      msg += `The following <b>${itemsToAlert.length}</b> item(s) require reordering:\n\n`;

      for (const item of itemsToAlert) {
        const isOut = item.quantity === 0;
        const icon = isOut ? '❌' : '⚠️';
        const label = isOut ? 'OUT OF STOCK' : 'LOW STOCK';
        msg += `${icon} <b>${item.name}</b> (${item.category})\n`;
        msg += `   Current: <b>${item.quantity} ${item.unit}</b> (Threshold: ${item.low_stock_threshold})\n`;
        msg += `   Status: <b>${label}</b>\n\n`;
      }

      msg += `<i>Open your web dashboard to record a restock.</i>`;

      const sendResult = await sendTelegramMessage(b.telegram_chat_id.toString(), msg);

      if (sendResult.ok) {
        totalAlertsSent += itemsToAlert.length;

        // 5. Record events in alert_events table for idempotency tracking
        const eventsToInsert = itemsToAlert.map((item) => ({
          business_id: b.id,
          item_id: item.id,
          kind: item.quantity === 0 ? 'out_of_stock' : 'low_stock',
          detail: `${item.name}: ${item.quantity} ${item.unit} remaining (threshold ${item.low_stock_threshold})`,
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
    logger.error('Error executing low-stock cron', { error: errorObj?.message });
    return NextResponse.json({ ok: false, error: 'Internal cron error' }, { status: 500 });
  }
}
