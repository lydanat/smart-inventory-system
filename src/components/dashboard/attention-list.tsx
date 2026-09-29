'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StockAdjustDialog } from '@/components/inventory/stock-adjust-dialog';
import type { AttentionItem } from '@/lib/services/dashboard';
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';

interface AttentionListProps {
  items: AttentionItem[];
}

export function AttentionList({ items }: AttentionListProps) {
  const router = useRouter();
  const [adjustItem, setAdjustItem] = React.useState<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
  } | null>(null);
  const [adjustOpen, setAdjustOpen] = React.useState(false);

  const handleOpenRestock = (item: AttentionItem) => {
    setAdjustItem({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
    });
    setAdjustOpen(true);
  };

  const getUrgencyBadge = (urgency: AttentionItem['urgency']) => {
    switch (urgency) {
      case 'expired':
        return (
          <Badge variant="destructive" className="gap-1 font-semibold text-[10px]">
            <AlertCircle className="w-3 h-3" />
            Expired
          </Badge>
        );
      case 'out_of_stock':
        return (
          <Badge variant="destructive" className="bg-destructive/90 gap-1 font-semibold text-[10px]">
            <AlertTriangle className="w-3 h-3" />
            Out of Stock
          </Badge>
        );
      case 'expiring_soon':
        return (
          <Badge variant="outline" className="border-orange-500/40 text-orange-600 dark:text-orange-400 bg-orange-500/10 gap-1 font-semibold text-[10px]">
            <Clock className="w-3 h-3" />
            Expiring Soon
          </Badge>
        );
      case 'low_stock':
        return (
          <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 gap-1 font-semibold text-[10px]">
            <AlertTriangle className="w-3 h-3" />
            Low Stock
          </Badge>
        );
    }
  };

  return (
    <Card className="shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Immediate Attention Needed</CardTitle>
            {items.length > 0 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs mt-0.5">
            Low stock, stockouts, and impending product expiration flagged by safety rules.
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
          <Link href="/inventory">
            <span>View All</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center border-t">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">All inventory healthy</h4>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              No items are currently out of stock, below reorder threshold, or nearing expiration.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border border-t">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 sm:px-6 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/inventory/${item.id}`}
                        className="font-medium text-sm text-foreground hover:text-primary transition-colors truncate max-w-[200px] sm:max-w-xs"
                      >
                        {item.name}
                      </Link>
                      {getUrgencyBadge(item.urgency)}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span className="font-medium text-foreground">{item.reason}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 text-xs font-medium"
                    onClick={() => handleOpenRestock(item)}
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-primary" />
                    <span>Quick Restock</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Inline Stock Adjustment Dialog */}
      <StockAdjustDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        item={adjustItem}
        defaultDelta={10}
        defaultReason="restock"
        onSuccess={() => {
          router.refresh();
        }}
      />
    </Card>
  );
}
