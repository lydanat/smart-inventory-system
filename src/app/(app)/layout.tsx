import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Topbar } from '@/components/layout/topbar';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense-in-depth: Route guard in Server Component layout
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Fetch active business and role
  const { data: member, error: memberError } = await supabase
    .from('business_members')
    .select('role, businesses(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (memberError || !member) {
    // If user exists without a membership (e.g. edge case), redirect to login
    redirect('/login');
  }

  const businessObj = member.businesses as unknown as { name: string } | null;
  const businessName = businessObj?.name || 'My Store';
  const role = member.role || 'staff';
  const email = user.email || '';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <AppSidebar businessName={businessName} />

      {/* Main app viewport */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Topbar businessName={businessName} email={email} role={role} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
