import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsView } from '@/components/settings/settings-view';

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: member } = await supabase
    .from('business_members')
    .select('role, businesses(id, name, currency, timezone)')
    .eq('user_id', user.id)
    .single();

  const business = member?.businesses as unknown as {
    id: string;
    name: string;
    currency: string;
    timezone: string;
  } | null;

  if (!member || !business) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your retail business settings, default currency, and active user session.
        </p>
      </div>

      <SettingsView
        business={business}
        userRole={member.role}
        userEmail={user.email || ''}
      />
    </div>
  );
}
