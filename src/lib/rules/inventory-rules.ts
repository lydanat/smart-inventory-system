export type FlagKind =
  | 'out_of_stock'
  | 'low_stock'
  | 'expired'
  | 'expiring_soon'
  | 'overstock'
  | 'slow_moving'
  | 'fast_mover';

export type FlagSeverity = 'critical' | 'warning' | 'info';

export interface RuleItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  low_stock_threshold: number;
  expiry_date: string | null;
  price: number;
  cost_price?: number | null;
  supplier_id?: string | null;
  supplier_name?: string | null;
  created_at?: string;
}

export interface RuleStockMovement {
  item_id: string;
  delta: number;
  created_at: string;
  reason?: string;
}

export interface RuleFlag {
  itemId: string;
  name: string;
  itemName: string; // compatibility alias for name
  category: string;
  flag: FlagKind;
  flagType: FlagKind; // compatibility alias for flag
  severity: FlagSeverity;
  quantity: number;
  threshold: number;
  daysToExpiry?: number;
  daysSinceLastSale?: number;
  avgDailySales30d?: number;
  suggestedReorderQty?: number;
  suggestedQuantity?: number; // compatibility alias
  supplierId?: string;
  supplierName?: string;
  message: string;
  suggestedAction: 'reorder' | 'discount' | 'retire' | 'promote' | 'monitor';
}

/**
 * Deterministic reorder quantity formula from Section 10.1:
 * suggestedReorderQty = max(round(avgDailySales30d * 14) - quantity, threshold * 2 - quantity, 1)
 */
export function calculateSuggestedReorderQty(
  quantity: number,
  threshold: number,
  avgDailySales30d: number = 0
): number {
  const demandBased = Math.round(avgDailySales30d * 14) - quantity;
  const thresholdBased = threshold * 2 - quantity;
  return Math.max(demandBased, thresholdBased, 1);
}

/**
 * 1. Check if item has 0 stock remaining
 */
export function checkOutOfStock(
  item: RuleItem,
  avgDailySales30d: number = 0
): RuleFlag | null {
  if (item.quantity === 0) {
    const reorderQty = calculateSuggestedReorderQty(item.quantity, item.low_stock_threshold, avgDailySales30d);
    return {
      itemId: item.id,
      name: item.name,
      itemName: item.name,
      category: item.category,
      flag: 'out_of_stock',
      flagType: 'out_of_stock',
      severity: 'critical',
      quantity: item.quantity,
      threshold: item.low_stock_threshold,
      avgDailySales30d,
      suggestedReorderQty: reorderQty,
      suggestedQuantity: reorderQty,
      supplierId: item.supplier_id || undefined,
      supplierName: item.supplier_name || undefined,
      message: `${item.name} is completely out of stock. Customers cannot purchase this item.`,
      suggestedAction: 'reorder',
    };
  }
  return null;
}

/**
 * 2. Check if item is below or at reorder threshold
 */
export function checkLowStock(
  item: RuleItem,
  avgDailySales30d: number = 0
): RuleFlag | null {
  if (item.quantity > 0 && item.quantity <= item.low_stock_threshold) {
    const reorderQty = calculateSuggestedReorderQty(item.quantity, item.low_stock_threshold, avgDailySales30d);
    return {
      itemId: item.id,
      name: item.name,
      itemName: item.name,
      category: item.category,
      flag: 'low_stock',
      flagType: 'low_stock',
      severity: 'warning',
      quantity: item.quantity,
      threshold: item.low_stock_threshold,
      avgDailySales30d,
      suggestedReorderQty: reorderQty,
      suggestedQuantity: reorderQty,
      supplierId: item.supplier_id || undefined,
      supplierName: item.supplier_name || undefined,
      message: `${item.name} has only ${item.quantity} ${item.unit} remaining (minimum threshold: ${item.low_stock_threshold}).`,
      suggestedAction: 'reorder',
    };
  }
  return null;
}

/**
 * 3. Check if item has passed its expiration date
 */
export function checkExpired(item: RuleItem, todayStr: string): RuleFlag | null {
  if (item.expiry_date && item.quantity > 0 && item.expiry_date < todayStr) {
    const today = new Date(`${todayStr}T00:00:00Z`);
    const expiry = new Date(`${item.expiry_date}T00:00:00Z`);
    const daysPast = Math.floor((today.getTime() - expiry.getTime()) / (1000 * 60 * 60 * 24));

    return {
      itemId: item.id,
      name: item.name,
      itemName: item.name,
      category: item.category,
      flag: 'expired',
      flagType: 'expired',
      severity: 'critical',
      quantity: item.quantity,
      threshold: item.low_stock_threshold,
      daysToExpiry: -daysPast,
      supplierId: item.supplier_id || undefined,
      supplierName: item.supplier_name || undefined,
      message: `${item.name} expired on ${item.expiry_date}. ${item.quantity} ${item.unit} must be removed from sale immediately.`,
      suggestedAction: 'retire',
      suggestedQuantity: item.quantity,
      suggestedReorderQty: item.quantity,
    };
  }
  return null;
}

/**
 * 4. Check if item expires within the next 7 days
 */
export function checkExpiringSoon(item: RuleItem, todayStr: string, windowDays = 7): RuleFlag | null {
  if (!item.expiry_date || item.quantity <= 0) return null;

  const today = new Date(`${todayStr}T00:00:00Z`);
  const expiry = new Date(`${item.expiry_date}T00:00:00Z`);
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays >= 0 && diffDays <= windowDays) {
    return {
      itemId: item.id,
      name: item.name,
      itemName: item.name,
      category: item.category,
      flag: 'expiring_soon',
      flagType: 'expiring_soon',
      severity: 'warning',
      quantity: item.quantity,
      threshold: item.low_stock_threshold,
      daysToExpiry: diffDays,
      supplierId: item.supplier_id || undefined,
      supplierName: item.supplier_name || undefined,
      message: `${item.name} (${item.quantity} ${item.unit}) will expire in ${diffDays} day${diffDays === 1 ? '' : 's'}. Consider running a discount or flash sale.`,
      suggestedAction: 'discount',
    };
  }
  return null;
}

/**
 * 5. Check if item is overstocked (quantity > max(4 * threshold, 3 * units sold in last 30 days))
 */
export function checkOverstock(
  item: RuleItem,
  movements30d: RuleStockMovement[]
): RuleFlag | null {
  if (item.quantity <= 0) return null;

  const itemSales = movements30d.filter((m) => m.item_id === item.id && m.delta < 0);
  const unitsSold30d = itemSales.reduce((sum, m) => sum + Math.abs(m.delta), 0);

  const overstockLimit = Math.max(item.low_stock_threshold * 4, unitsSold30d * 3);

  if (item.quantity > overstockLimit) {
    return {
      itemId: item.id,
      name: item.name,
      itemName: item.name,
      category: item.category,
      flag: 'overstock',
      flagType: 'overstock',
      severity: 'info',
      quantity: item.quantity,
      threshold: item.low_stock_threshold,
      avgDailySales30d: unitsSold30d / 30,
      supplierId: item.supplier_id || undefined,
      supplierName: item.supplier_name || undefined,
      message: `${item.name} has excess inventory (${item.quantity} ${item.unit}) with low turnover relative to stock (${unitsSold30d} sold in 30 days).`,
      suggestedAction: 'promote',
    };
  }
  return null;
}

/**
 * 6. Check if item is slow moving (zero sales in last 14-30 days and item older than 30 days)
 */
export function checkSlowMoving(
  item: RuleItem,
  movements30d: RuleStockMovement[]
): RuleFlag | null {
  if (item.quantity <= 0) return null;

  const sales = movements30d.filter((m) => m.item_id === item.id && m.delta < 0);
  if (sales.length === 0) {
    return {
      itemId: item.id,
      name: item.name,
      itemName: item.name,
      category: item.category,
      flag: 'slow_moving',
      flagType: 'slow_moving',
      severity: 'info',
      quantity: item.quantity,
      threshold: item.low_stock_threshold,
      avgDailySales30d: 0,
      supplierId: item.supplier_id || undefined,
      supplierName: item.supplier_name || undefined,
      message: `${item.name} has had zero sales recently with ${item.quantity} ${item.unit} remaining on shelves.`,
      suggestedAction: 'promote',
    };
  }
  return null;
}

/**
 * 7. Check if item is a fast mover (high sales velocity relative to stock)
 */
export function checkFastMover(
  item: RuleItem,
  movements7d: RuleStockMovement[]
): RuleFlag | null {
  const sales = movements7d.filter((m) => m.item_id === item.id && m.delta < 0);
  const unitsSold = sales.reduce((sum, m) => sum + Math.abs(m.delta), 0);

  if (unitsSold > 0 && unitsSold >= item.quantity) {
    const avgDaily = unitsSold / 7;
    const reorderQty = calculateSuggestedReorderQty(item.quantity, item.low_stock_threshold, avgDaily);

    return {
      itemId: item.id,
      name: item.name,
      itemName: item.name,
      category: item.category,
      flag: 'fast_mover',
      flagType: 'fast_mover',
      severity: 'warning',
      quantity: item.quantity,
      threshold: item.low_stock_threshold,
      avgDailySales30d: avgDaily,
      suggestedReorderQty: reorderQty,
      suggestedQuantity: reorderQty,
      supplierId: item.supplier_id || undefined,
      supplierName: item.supplier_name || undefined,
      message: `${item.name} has high velocity (${unitsSold} sold in last 7 days vs ${item.quantity} left). High risk of stockout.`,
      suggestedAction: 'reorder',
    };
  }
  return null;
}

/**
 * Runs all deterministic rules against a catalog and movement history
 */
export function runAllInventoryRules(
  items: RuleItem[],
  movements7d: RuleStockMovement[] = [],
  movements30d: RuleStockMovement[] = [],
  todayStr?: string
): RuleFlag[] {
  const today = todayStr || new Date().toISOString().split('T')[0];
  const flags: RuleFlag[] = [];

  for (const item of items) {
    // Calculate 30d average daily sales
    const itemSales30d = movements30d.filter((m) => m.item_id === item.id && m.delta < 0);
    const unitsSold30d = itemSales30d.reduce((sum, m) => sum + Math.abs(m.delta), 0);
    const avgDailySales30d = unitsSold30d > 0 ? unitsSold30d / 30 : 0;

    // 1. Critical stockout check
    const outFlag = checkOutOfStock(item, avgDailySales30d);
    if (outFlag) flags.push(outFlag);

    // 2. Low stock check (only if not completely out)
    if (!outFlag) {
      const lowFlag = checkLowStock(item, avgDailySales30d);
      if (lowFlag) flags.push(lowFlag);
    }

    // 3. Expiration checks
    const expiredFlag = checkExpired(item, today);
    if (expiredFlag) {
      flags.push(expiredFlag);
    } else {
      const expiringFlag = checkExpiringSoon(item, today);
      if (expiringFlag) flags.push(expiringFlag);
    }

    // 4. Movement velocity checks
    const fastFlag = checkFastMover(item, movements7d);
    if (fastFlag) flags.push(fastFlag);

    const overstockFlag = checkOverstock(item, movements30d.length > 0 ? movements30d : movements7d);
    if (overstockFlag) flags.push(overstockFlag);

    const slowFlag = checkSlowMoving(item, movements30d.length > 0 ? movements30d : movements7d);
    if (slowFlag) flags.push(slowFlag);
  }

  // Priority order per Section 10.1:
  // out_of_stock and expired first, then low_stock and expiring_soon, then overstock and slow_moving, fast_mover
  const flagRank: Record<FlagKind, number> = {
    out_of_stock: 0,
    expired: 1,
    low_stock: 2,
    expiring_soon: 3,
    fast_mover: 4,
    overstock: 5,
    slow_moving: 6,
  };

  flags.sort((a, b) => flagRank[a.flag] - flagRank[b.flag]);

  return flags;
}
