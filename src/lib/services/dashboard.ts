import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

export interface DashboardSummary {
  total_items: number;
  low_stock_count: number;
  out_of_stock_count: number;
  expiring_soon_count: number;
  expired_count: number;
  total_stock_value: number;
}

export interface AttentionItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  low_stock_threshold: number;
  expiry_date: string | null;
  price: number;
  urgency: 'expired' | 'out_of_stock' | 'expiring_soon' | 'low_stock';
  reason: string;
}

export interface FastMovingItem {
  itemId: string;
  name: string;
  category: string;
  unit: string;
  unitsSold: number;
  currentStock: number;
  price: number;
}

export interface CategoryStock {
  name: string;
  count: number;
  totalQuantity: number;
  totalValue: number;
}

export interface DailyMovement {
  date: string;
  incoming: number;
  outgoing: number;
}

/**
 * Fetch top-level dashboard metrics via the dashboard_summary RPC
 */
export async function getDashboardSummary(businessId: string): Promise<DashboardSummary> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('dashboard_summary', {
    _business_id: businessId,
  });

  if (error || !data) {
    return {
      total_items: 0,
      low_stock_count: 0,
      out_of_stock_count: 0,
      expiring_soon_count: 0,
      expired_count: 0,
      total_stock_value: 0,
    };
  }

  const raw = data as Record<string, unknown>;
  return {
    total_items: Number(raw.total_items) || 0,
    low_stock_count: Number(raw.low_stock_count) || 0,
    out_of_stock_count: Number(raw.out_of_stock_count) || 0,
    expiring_soon_count: Number(raw.expiring_soon_count) || 0,
    expired_count: Number(raw.expired_count) || 0,
    total_stock_value: Number(raw.total_stock_value) || 0,
  };
}

/**
 * Fetch top items needing immediate attention (out of stock, expired, expiring soon, low stock)
 */
export async function getAttentionNeededItems(
  businessId: string,
  limit = 8
): Promise<AttentionItem[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];
  const inSevenDays = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  // Fetch items that are active and meet at least one risk condition
  const { data: rawItems } = await supabase
    .from('items')
    .select('id, name, category, quantity, unit, low_stock_threshold, expiry_date, price')
    .eq('business_id', businessId)
    .is('archived_at', null)
    .order('quantity', { ascending: true })
    .limit(50);

  if (!rawItems || rawItems.length === 0) {
    return [];
  }

  const flagged: AttentionItem[] = [];

  for (const item of rawItems) {
    const isExpired = item.expiry_date && item.expiry_date < today && item.quantity > 0;
    const isOutOfStock = item.quantity === 0;
    const isExpiringSoon =
      item.expiry_date &&
      item.expiry_date >= today &&
      item.expiry_date <= inSevenDays &&
      item.quantity > 0;
    const isLowStock = item.quantity > 0 && item.quantity <= item.low_stock_threshold;

    if (isExpired) {
      flagged.push({
        ...item,
        urgency: 'expired',
        reason: `Expired on ${item.expiry_date}`,
      });
    } else if (isOutOfStock) {
      flagged.push({
        ...item,
        urgency: 'out_of_stock',
        reason: 'Zero stock remaining',
      });
    } else if (isExpiringSoon) {
      flagged.push({
        ...item,
        urgency: 'expiring_soon',
        reason: `Expires on ${item.expiry_date}`,
      });
    } else if (isLowStock) {
      flagged.push({
        ...item,
        urgency: 'low_stock',
        reason: `${item.quantity} ${item.unit} left (threshold: ${item.low_stock_threshold})`,
      });
    }
  }

  // Sort by urgency severity: expired (0) > out_of_stock (1) > expiring_soon (2) > low_stock (3)
  const urgencyWeight: Record<AttentionItem['urgency'], number> = {
    expired: 0,
    out_of_stock: 1,
    expiring_soon: 2,
    low_stock: 3,
  };

  flagged.sort((a, b) => urgencyWeight[a.urgency] - urgencyWeight[b.urgency]);
  return flagged.slice(0, limit);
}

/**
 * Fetch fast-moving items in the past 7 days based on negative stock movements
 */
export async function getFastMovingItems(businessId: string, limit = 5): Promise<FastMovingItem[]> {
  const supabase = await createClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  // Get negative movements from last 7 days
  const { data: movements } = await supabase
    .from('stock_movements')
    .select('item_id, delta, items!inner(name, category, unit, quantity, price, archived_at)')
    .eq('business_id', businessId)
    .lt('delta', 0)
    .gte('created_at', sevenDaysAgo);

  if (!movements || movements.length === 0) {
    return [];
  }

  // Aggregate by item_id
  const itemMap = new Map<
    string,
    {
      itemId: string;
      name: string;
      category: string;
      unit: string;
      unitsSold: number;
      currentStock: number;
      price: number;
    }
  >();

  for (const m of movements) {
    const item = m.items as unknown as {
      name: string;
      category: string;
      unit: string;
      quantity: number;
      price: number;
      archived_at: string | null;
    };
    if (item.archived_at) continue;

    const existing = itemMap.get(m.item_id) || {
      itemId: m.item_id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      unitsSold: 0,
      currentStock: item.quantity,
      price: Number(item.price),
    };

    existing.unitsSold += Math.abs(m.delta);
    itemMap.set(m.item_id, existing);
  }

  const result = Array.from(itemMap.values());
  result.sort((a, b) => b.unitsSold - a.unitsSold);
  return result.slice(0, limit);
}

/**
 * Fetch aggregated stock breakdown by category for pie/donut charts
 */
export async function getStockByCategory(businessId: string): Promise<CategoryStock[]> {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from('items')
    .select('category, quantity, price')
    .eq('business_id', businessId)
    .is('archived_at', null);

  if (!items || items.length === 0) {
    return [];
  }

  const catMap = new Map<string, { count: number; totalQuantity: number; totalValue: number }>();

  for (const item of items) {
    const cat = item.category || 'Uncategorized';
    const existing = catMap.get(cat) || { count: 0, totalQuantity: 0, totalValue: 0 };
    existing.count += 1;
    existing.totalQuantity += item.quantity;
    existing.totalValue += item.quantity * Number(item.price);
    catMap.set(cat, existing);
  }

  return Array.from(catMap.entries()).map(([name, val]) => ({
    name,
    count: val.count,
    totalQuantity: val.totalQuantity,
    totalValue: Math.round(val.totalValue * 100) / 100,
  }));
}

/**
 * Fetch daily stock movements for the last 14 days (in vs out)
 */
export async function getRecentMovementsChartData(
  businessId: string,
  days = 14
): Promise<DailyMovement[]> {
  const supabase = await createClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  const { data: movements } = await supabase
    .from('stock_movements')
    .select('delta, created_at')
    .eq('business_id', businessId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  // Map each day in the last `days` days
  const dailyMap = new Map<string, { incoming: number; outgoing: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
    dailyMap.set(key, { incoming: 0, outgoing: 0 });
  }

  if (movements) {
    for (const m of movements) {
      const dateKey = m.created_at.split('T')[0];
      const entry = dailyMap.get(dateKey);
      if (entry) {
        if (m.delta > 0) {
          entry.incoming += m.delta;
        } else {
          entry.outgoing += Math.abs(m.delta);
        }
      }
    }
  }

  return Array.from(dailyMap.entries()).map(([dateStr, counts]) => {
    const dateObj = new Date(dateStr + 'T00:00:00');
    const formatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      date: formatted,
      incoming: counts.incoming,
      outgoing: counts.outgoing,
    };
  });
}
