import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  AlertOctagon,
} from 'lucide-react';

interface StatusBadgeProps {
  quantity: number;
  lowStockThreshold: number;
  expiryDate?: string | null;
}

export function StatusBadge({
  quantity,
  lowStockThreshold,
  expiryDate,
}: StatusBadgeProps) {
  const now = new Date();

  let daysToExpiry: number | null = null;
  if (expiryDate) {
    const exp = new Date(expiryDate);
    const diffTime = exp.getTime() - now.getTime();
    daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // 1. Out of stock
  if (quantity === 0) {
    return (
      <Badge variant="out" className="gap-1 px-2 py-0.5 whitespace-nowrap">
        <XCircle className="w-3.5 h-3.5 shrink-0" />
        <span>Out of Stock</span>
      </Badge>
    );
  }

  // 2. Expired
  if (daysToExpiry !== null && daysToExpiry < 0) {
    return (
      <Badge variant="expired" className="gap-1 px-2 py-0.5 whitespace-nowrap">
        <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
        <span>Expired</span>
      </Badge>
    );
  }

  // 3. Expiring soon (<= 7 days)
  if (daysToExpiry !== null && daysToExpiry <= 7) {
    return (
      <Badge variant="expiring" className="gap-1 px-2 py-0.5 whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span>Expiring ({daysToExpiry <= 0 ? 'Today' : `${daysToExpiry}d`})</span>
      </Badge>
    );
  }

  // 4. Low stock
  if (quantity <= lowStockThreshold) {
    return (
      <Badge variant="low" className="gap-1 px-2 py-0.5 whitespace-nowrap">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <span>Low ({quantity} left)</span>
      </Badge>
    );
  }

  // 5. In stock / Healthy
  return (
    <Badge variant="ok" className="gap-1 px-2 py-0.5 whitespace-nowrap">
      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
      <span>In Stock</span>
    </Badge>
  );
}
