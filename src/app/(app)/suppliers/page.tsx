import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getSuppliers } from '@/lib/services/suppliers';
import { SuppliersView } from '@/components/suppliers/suppliers-view';
import { redirect } from 'next/navigation';

export default async function SuppliersPage() {
  const supabase = await createClient();

  const { data: member } = await supabase
    .from('business_members')
    .select('business_id')
    .single();

  const businessId = member?.business_id;
  if (!businessId) {
    redirect('/auth/signin');
  }

  const suppliers = await getSuppliers(businessId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Supplier Directory</h2>
        <p className="text-sm text-muted-foreground">
          Manage your vendor relationships, order contacts, and supply channels.
        </p>
      </div>

      <Suspense fallback={<div className="h-96 rounded-xl border bg-card animate-pulse" />}>
        <SuppliersView suppliers={suppliers} />
      </Suspense>
    </div>
  );
}
