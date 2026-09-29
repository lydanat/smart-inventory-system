import { createClient } from '@/lib/supabase/server';
import { AlertsView } from '@/components/alerts/alerts-view';

type AlertRecord = {
  id: number;
  kind: string;
  detail: string | null;
  status: string;
  dedupe_day: string;
  created_at: string;
};

export default async function AlertsPage() {
  const supabase = await createClient();

  // 1. Resolve business
  const { data: member } = await supabase
    .from('business_members')
    .select('business_id, businesses(id, name, telegram_chat_id, alerts_enabled)')
    .single();

  const business = member?.businesses as unknown as {
    id: string;
    name: string;
    telegram_chat_id: number | null;
    alerts_enabled: boolean;
  } | null;

  const businessName = business?.name || 'My Store';
  const telegramChatId = business?.telegram_chat_id ? String(business.telegram_chat_id) : null;
  const telegramAlertsEnabled = Boolean(business?.alerts_enabled);

  // 2. Fetch recent alert events for this business
  let recentEvents: AlertRecord[] = [];
  if (member?.business_id) {
    const { data: events } = await supabase
      .from('alert_events')
      .select('id, kind, detail, status, dedupe_day, created_at')
      .eq('business_id', member.business_id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (events) {
      recentEvents = events as unknown as AlertRecord[];
    }
  }

  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'AIinventorysystemBOT';

  return (
    <AlertsView
      businessName={businessName}
      telegramChatId={telegramChatId}
      telegramAlertsEnabled={telegramAlertsEnabled}
      recentEvents={recentEvents}
      botUsername={botUsername}
    />
  );
}
