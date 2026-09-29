import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { DashboardSummary } from '@/lib/services/dashboard';
import {
  Package,
  DollarSign,
  AlertTriangle,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';

interface StatCardsProps {
  summary: DashboardSummary;
}

export function StatCards({ summary }: StatCardsProps) {
  const lowStockTotal = summary.low_stock_count + summary.out_of_stock_count;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total SKUs */}
      <Link href="/inventory" className="group block focus:outline-none">
        <Card className="hover:border-primary/50 transition-all hover:shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Total SKUs
            </CardTitle>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {summary.total_items}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">Active catalog products</span>
              <span className="text-xs text-primary flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                View all <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* 2. Inventory Value */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div className="flex items-center gap-1.5">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inventory Value
            </CardTitle>
            <div
              className="text-muted-foreground/60 hover:text-muted-foreground cursor-help"
              title="Calculated as sum(quantity * selling price) across all active inventory."
            >
              <Info className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {formatCurrency(summary.total_stock_value)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Valuation at retail selling price
          </p>
        </CardContent>
      </Card>

      {/* 3. Low Stock Items */}
      <Link
        href={lowStockTotal > 0 ? '/inventory?status=low_stock' : '/inventory'}
        className="group block focus:outline-none"
      >
        <Card
          className={`hover:border-amber-500/50 transition-all hover:shadow-xs ${
            lowStockTotal > 0 ? 'border-amber-500/30 bg-amber-500/[0.02]' : ''
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Low Stock Items
            </CardTitle>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                lowStockTotal > 0
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div
                className={`text-2xl font-bold tracking-tight ${
                  lowStockTotal > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-foreground'
                }`}
              >
                {lowStockTotal}
              </div>
              {lowStockTotal > 0 ? (
                <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 text-[10px] font-semibold">
                  Action Needed
                </Badge>
              ) : (
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px]">
                  Healthy
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {summary.out_of_stock_count > 0
                  ? `${summary.out_of_stock_count} completely out of stock`
                  : 'At or below reorder threshold'}
              </span>
              {lowStockTotal > 0 && (
                <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  Filter <ArrowRight className="w-3 h-3" />
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* 4. Expiring Soon */}
      <Link
        href={summary.expiring_soon_count > 0 ? '/inventory?status=expiring_soon' : '/inventory'}
        className="group block focus:outline-none"
      >
        <Card
          className={`hover:border-orange-500/50 transition-all hover:shadow-xs ${
            summary.expiring_soon_count > 0
              ? 'border-orange-500/30 bg-orange-500/[0.02]'
              : ''
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Expiring Soon
            </CardTitle>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                summary.expiring_soon_count > 0
                  ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div
                className={`text-2xl font-bold tracking-tight ${
                  summary.expiring_soon_count > 0
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-foreground'
                }`}
              >
                {summary.expiring_soon_count}
              </div>
              {summary.expired_count > 0 ? (
                <Badge variant="destructive" className="text-[10px] font-semibold">
                  {summary.expired_count} Expired
                </Badge>
              ) : summary.expiring_soon_count > 0 ? (
                <Badge variant="outline" className="border-orange-500/30 text-orange-600 dark:text-orange-400 bg-orange-500/10 text-[10px] font-semibold">
                  Next 7 Days
                </Badge>
              ) : (
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px]">
                  All Fresh
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {summary.expired_count > 0
                  ? `${summary.expired_count} items already expired`
                  : 'Within the next 7 days'}
              </span>
              {summary.expiring_soon_count > 0 && (
                <span className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  Review <ArrowRight className="w-3 h-3" />
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
