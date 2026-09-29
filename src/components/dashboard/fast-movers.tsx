import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { FastMovingItem } from '@/lib/services/dashboard';
import { TrendingDown, Flame, Package } from 'lucide-react';

interface FastMoversProps {
  items: FastMovingItem[];
}

export function FastMovers({ items }: FastMoversProps) {
  return (
    <Card className="shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Fast-Moving Items</CardTitle>
            <div className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Flame className="w-3 h-3" />
            </div>
          </div>
        </div>
        <CardDescription className="text-xs">
          Top sellers and highest stock velocity over the last 7 days.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center border-t text-muted-foreground">
            <TrendingDown className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm font-medium">No sales recorded this week</p>
            <p className="text-xs max-w-xs mt-0.5">
              Record sales or stock deductions to track your fastest selling products.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border border-t">
            {items.map((item, idx) => (
              <div
                key={item.itemId}
                className="flex items-center justify-between p-3.5 sm:px-6 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/inventory/${item.itemId}`}
                      className="font-medium text-sm text-foreground hover:text-primary transition-colors truncate block max-w-[180px] sm:max-w-xs"
                    >
                      {item.name}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      <span>{item.category}</span> • <span>{formatCurrency(item.price)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-foreground">
                    -{item.unitsSold} <span className="text-xs font-normal text-muted-foreground">{item.unit}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {item.currentStock} remaining
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
