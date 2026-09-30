import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getInventoryItems, getCategories } from '@/lib/services/inventory';
import { getSuppliers } from '@/lib/services/suppliers';
import { ItemsTable } from '@/components/inventory/items-table';

interface InventoryPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: 'all' | 'low' | 'out' | 'expiring' | 'expired';
    page?: string;
    pageSize?: string;
    sortBy?: 'name' | 'quantity' | 'price' | 'expiry_date' | 'created_at';
    sortOrder?: 'asc' | 'desc';
  }>;
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Resolve businessId
  const { data: member } = await supabase
    .from('business_members')
    .select('business_id')
    .single();

  const businessId = member?.business_id;
  if (!businessId) {
    return <div>No active store found.</div>;
  }

  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 20;
  const search = params.search || '';
  const category = params.category || 'all';
  const status = params.status || 'all';
  const sortBy = params.sortBy || 'created_at';
  const sortOrder = params.sortOrder || 'desc';

  const [{ items, totalCount, totalPages }, categories, suppliers] =
    await Promise.all([
      getInventoryItems(businessId, {
        page,
        pageSize,
        search,
        category,
        status,
        sortBy,
        sortOrder,
      }),
      getCategories(businessId),
      getSuppliers(businessId),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Inventory Management</h2>
        <p className="text-sm text-muted-foreground">
          Track stock levels, record sales, receive restocks, and manage catalog items.
        </p>
      </div>

      <Suspense fallback={<div className="h-96 rounded-lg border bg-card animate-pulse" />}>
        <ItemsTable
          items={items}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          categories={categories}
          suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
        />
      </Suspense>
    </div>
  );
}
