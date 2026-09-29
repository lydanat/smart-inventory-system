import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { ItemFormInput, ItemQueryInput } from '@/lib/validation/item';
import { AppError } from '@/lib/errors';

export async function getInventoryItems(
  businessId: string,
  query: ItemQueryInput
) {
  const supabase = await createClient();
  const { page, pageSize, search, category, status, sortBy, sortOrder } = query;

  let queryBuilder = supabase
    .from('items')
    .select('*, suppliers(id, name)', { count: 'exact' })
    .eq('business_id', businessId)
    .is('archived_at', null);

  // Status Filter
  const today = new Date().toISOString().split('T')[0];
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  if (status === 'out') {
    queryBuilder = queryBuilder.eq('quantity', 0);
  } else if (status === 'low') {
    // 0 < quantity <= low_stock_threshold
    // PostgREST doesn't support column-to-column comparison directly without RPC or filter
    // So we use raw filter or item_low_idx condition
    queryBuilder = queryBuilder.gt('quantity', 0).filter('quantity', 'lte', 'items.low_stock_threshold');
  } else if (status === 'expiring') {
    queryBuilder = queryBuilder
      .gt('quantity', 0)
      .not('expiry_date', 'is', null)
      .gte('expiry_date', today)
      .lte('expiry_date', in7Days);
  } else if (status === 'expired') {
    queryBuilder = queryBuilder
      .gt('quantity', 0)
      .not('expiry_date', 'is', null)
      .lt('expiry_date', today);
  }

  // Category Filter
  if (category && category !== 'all') {
    queryBuilder = queryBuilder.eq('category', category);
  }

  // Search Filter (name or sku with escaped % and _)
  if (search && search.trim()) {
    const escaped = search.trim().replace(/[%_]/g, '\\$&');
    queryBuilder = queryBuilder.or(`name.ilike.%${escaped}%,sku.ilike.%${escaped}%`);
  }

  // Sorting
  const ascending = sortOrder === 'asc';
  queryBuilder = queryBuilder.order(sortBy, { ascending });

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  queryBuilder = queryBuilder.range(from, to);

  const { data, count, error } = await queryBuilder;

  if (error) {
    throw error;
  }

  return {
    items: data || [],
    totalCount: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getItemById(businessId: string, itemId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('items')
    .select('*, suppliers(id, name, phone, email, contact_name)')
    .eq('id', itemId)
    .eq('business_id', businessId)
    .is('archived_at', null)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function getItemMovements(businessId: string, itemId: string, limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('stock_movements')
    .select('*')
    .eq('item_id', itemId)
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getCategories(businessId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('items')
    .select('category')
    .eq('business_id', businessId)
    .is('archived_at', null);

  if (!data) return [];
  const unique = Array.from(new Set(data.map((i) => i.category))).filter(Boolean);
  return unique.sort();
}

export async function createItem(businessId: string, userId: string, input: ItemFormInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('items')
    .insert({
      business_id: businessId,
      name: input.name,
      sku: input.sku || null,
      category: input.category,
      unit: input.unit,
      quantity: input.quantity,
      low_stock_threshold: input.lowStockThreshold,
      cost_price: input.costPrice,
      price: input.price,
      expiry_date: input.expiryDate,
      supplier_id: input.supplierId,
      notes: input.notes,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  // If initial quantity > 0, log initial stock movement
  if (input.quantity > 0) {
    await supabase.from('stock_movements').insert({
      business_id: businessId,
      item_id: data.id,
      delta: input.quantity,
      reason: 'initial',
      note: 'Initial stock on item creation',
      created_by: userId,
    });
  }

  return data;
}

export async function updateItem(
  businessId: string,
  itemId: string,
  input: ItemFormInput
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('items')
    .update({
      name: input.name,
      sku: input.sku || null,
      category: input.category,
      unit: input.unit,
      low_stock_threshold: input.lowStockThreshold,
      cost_price: input.costPrice,
      price: input.price,
      expiry_date: input.expiryDate,
      supplier_id: input.supplierId,
      notes: input.notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .eq('business_id', businessId)
    .is('archived_at', null)
    .select()
    .single();

  if (error || !data) {
    throw error || new AppError('Item not found', 'NOT_FOUND', 404);
  }

  return data;
}

export async function archiveItem(businessId: string, itemId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('items')
    .update({
      archived_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .eq('business_id', businessId)
    .is('archived_at', null)
    .select()
    .single();

  if (error || !data) {
    throw error || new AppError('Item not found', 'NOT_FOUND', 404);
  }

  return data;
}

export async function restoreItem(businessId: string, itemId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('items')
    .update({
      archived_at: null,
    })
    .eq('id', itemId)
    .eq('business_id', businessId)
    .not('archived_at', 'is', null)
    .select()
    .single();

  if (error || !data) {
    throw error || new AppError('Item not found for restore', 'NOT_FOUND', 404);
  }

  return data;
}
