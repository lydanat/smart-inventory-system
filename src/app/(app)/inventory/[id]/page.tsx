import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getItemById, getItemMovements } from '@/lib/services/inventory';
import { StatusBadge } from '@/components/inventory/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import {
  ArrowLeft,
  Package,
  Truck,
  Calendar,
  DollarSign,
  TrendingDown,
  TrendingUp,
  History,
  Sparkles,
} from 'lucide-react';

interface ItemDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Resolve businessId
  const { data: member } = await supabase
    .from('business_members')
    .select('business_id')
    .single();

  if (!member?.business_id) {
    notFound();
  }

  // IDOR safe: getItemById queries by id AND business_id. Returns null if belongs to another business!
  const item = await getItemById(member.business_id, id);
  if (!item) {
    notFound();
  }

  const movements = await getItemMovements(member.business_id, id, 50);

  // Check if item is flagged in cached recommendations (no extra AI call)
  const { data: rec } = await supabase
    .from('ai_recommendations')
    .select('payload')
    .eq('business_id', member.business_id)
    .gt('expires_at', new Date().toISOString())
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const restockTip = (rec?.payload as { restock?: Array<{ itemName: string; why: string; urgency: string; suggestedQuantity?: number }> })?.restock?.find(
    (r) => r.itemName.trim().toLowerCase() === item.name.trim().toLowerCase()
  );

  const profitMargin =
    item.cost_price && item.price > 0
      ? (((item.price - Number(item.cost_price)) / item.price) * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild className="h-9 w-9 shrink-0">
            <Link href="/inventory">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to inventory</span>
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">{item.name}</h2>
              <StatusBadge
                quantity={item.quantity}
                lowStockThreshold={item.low_stock_threshold}
                expiryDate={item.expiry_date}
              />
            </div>
            {item.sku && (
              <p className="text-xs font-mono text-muted-foreground mt-0.5">SKU: {item.sku}</p>
            )}
          </div>
        </div>
      </div>

      {/* Flagged Item AI Recommendation Banner */}
      {restockTip && (
        <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-50/60 dark:bg-blue-950/20 flex items-start gap-3 shadow-xs">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
              Advisor Insight: Restock Action ({restockTip.urgency})
            </h4>
            <p className="text-xs text-blue-800/90 dark:text-blue-300/80 leading-relaxed">
              {restockTip.why}{' '}
              {restockTip.suggestedQuantity && (
                <span>
                  Suggested reorder: <strong>+{restockTip.suggestedQuantity} {item.unit}</strong>.
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Grid Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stock Level Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Stock</CardTitle>
            <Package className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">
              {item.quantity}{' '}
              <span className="text-sm font-normal text-muted-foreground">{item.unit}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Reorder threshold: <span className="font-semibold">{item.low_stock_threshold} {item.unit}</span>
            </p>
          </CardContent>
        </Card>

        {/* Pricing Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Retail & Cost</CardTitle>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-foreground">
              {formatCurrency(item.price)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cost:{' '}
              <span className="font-medium">
                {item.cost_price ? formatCurrency(Number(item.cost_price)) : 'Not set'}
              </span>
              {profitMargin && (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold ml-1.5">
                  ({profitMargin}% margin)
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Expiry & Supplier Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Supplier & Expiry</CardTitle>
            <Truck className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-base font-bold text-foreground truncate">
              {item.suppliers ? item.suppliers.name : 'No linked supplier'}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Expiry: {item.expiry_date ? formatDate(item.expiry_date) : 'No date set'}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Item Notes */}
      {item.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Notes & Handling</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Movement History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <CardTitle className="text-lg font-bold">Stock Movement Log</CardTitle>
          </div>
          <CardDescription>
            Audit trail of all quantity adjustments, sales, restocks, and damages for this product.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-b-xl overflow-hidden border-t">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-28 text-center text-muted-foreground text-sm">
                      No stock movements recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map((m) => {
                    const isPositive = m.delta > 0;
                    return (
                      <TableRow key={m.id} className="hover:bg-muted/30">
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {formatDateTime(m.created_at)}
                        </TableCell>
                        <TableCell>
                          <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                            {m.reason}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-bold text-sm">
                            {isPositive ? (
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                            )}
                            <span
                              className={
                                isPositive
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-destructive'
                              }
                            >
                              {isPositive ? `+${m.delta}` : m.delta} {item.unit}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {m.note || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
