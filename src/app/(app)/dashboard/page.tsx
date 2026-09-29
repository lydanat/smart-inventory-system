import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, Clock, DollarSign } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: member } = await supabase
    .from('business_members')
    .select('business_id, businesses(name)')
    .single();

  const businessObj = member?.businesses as unknown as { name: string } | null;
  const businessName = businessObj?.name || 'My Store';

  // Read summary from database RPC
  let summary = {
    total_items: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
    expiring_soon_count: 0,
    expired_count: 0,
    total_stock_value: 0,
  };

  if (member?.business_id) {
    const { data } = await supabase.rpc('dashboard_summary', {
      _business_id: member.business_id,
    });
    if (data) {
      summary = data as typeof summary;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome to {businessName}</h2>
        <p className="text-sm text-muted-foreground">
          Real-time stock monitoring and automated AI recommendations.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
            <Package className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_items}</div>
            <p className="text-xs text-muted-foreground mt-1">Active inventory SKUs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {summary.low_stock_count}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Below reorder threshold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
            <Clock className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {summary.expiring_soon_count}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Within the next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Stock Value</CardTitle>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Number(summary.total_stock_value).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Estimated inventory value</p>
          </CardContent>
        </Card>
      </div>

      {summary.total_items === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg text-foreground">Your inventory is empty</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
              Get started by adding your first product to track stock levels, expiry dates, and AI recommendations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
