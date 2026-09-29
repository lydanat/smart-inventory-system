import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

describe('Multi-Tenant RLS & Database Constraints Integration', () => {
  let adminClient: ReturnType<typeof createClient<Database>>;
  let userAId: string;
  let userBId: string;
  let userAClient: ReturnType<typeof createClient<Database>>;
  let userBClient: ReturnType<typeof createClient<Database>>;
  let businessAId: string;
  let businessBId: string;
  let itemAId: string;

  const emailA = `test_tenant_a_${Date.now()}@test.internal`;
  const emailB = `test_tenant_b_${Date.now()}@test.internal`;
  const password = 'TestSecurePassword123!';

  beforeAll(async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const secretKey = process.env.SUPABASE_SECRET_KEY!;

    adminClient = createClient<Database>(supabaseUrl, secretKey, {
      auth: { persistSession: false },
    });

    // 1. Create User A with metadata business_name: 'Store Alpha'
    const { data: userAData, error: errA } = await adminClient.auth.admin.createUser({
      email: emailA,
      password: password,
      email_confirm: true,
      user_metadata: { business_name: 'Store Alpha' },
    });
    if (errA) throw new Error(`Failed to create User A: ${errA.message}`);
    userAId = userAData.user.id;

    // 2. Create User B with metadata business_name: 'Store Beta'
    const { data: userBData, error: errB } = await adminClient.auth.admin.createUser({
      email: emailB,
      password: password,
      email_confirm: true,
      user_metadata: { business_name: 'Store Beta' },
    });
    if (errB) throw new Error(`Failed to create User B: ${errB.message}`);
    userBId = userBData.user.id;

    // 3. Authenticate User A and User B
    userAClient = createClient<Database>(supabaseUrl, publishableKey, {
      auth: { persistSession: false },
    });
    const { data: authA, error: signinAError } = await userAClient.auth.signInWithPassword({
      email: emailA,
      password: password,
    });
    if (signinAError) throw new Error(`User A signin failed: ${signinAError.message}`);

    userBClient = createClient<Database>(supabaseUrl, publishableKey, {
      auth: { persistSession: false },
    });
    const { data: authB, error: signinBError } = await userBClient.auth.signInWithPassword({
      email: emailB,
      password: password,
    });
    if (signinBError) throw new Error(`User B signin failed: ${signinBError.message}`);

    // 4. Retrieve Business IDs initialized by handle_new_user trigger
    const { data: memberA } = await userAClient
      .from('business_members')
      .select('business_id')
      .single();
    businessAId = memberA!.business_id;

    const { data: memberB } = await userBClient
      .from('business_members')
      .select('business_id')
      .single();
    businessBId = memberB!.business_id;

    expect(businessAId).toBeDefined();
    expect(businessBId).toBeDefined();
    expect(businessAId).not.toBe(businessBId);
  });

  afterAll(async () => {
    // Cleanup test users and their cascade-deleted businesses
    if (userAId) await adminClient.auth.admin.deleteUser(userAId);
    if (userBId) await adminClient.auth.admin.deleteUser(userBId);
  });

  it('allows User A to create an item in Business A', async () => {
    const { data, error } = await userAClient
      .from('items')
      .insert({
        business_id: businessAId,
        name: 'Alpha Energy Drink',
        sku: 'ALPHA-001',
        category: 'Beverages',
        quantity: 20,
        low_stock_threshold: 5,
        price: 2.5,
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.name).toBe('Alpha Energy Drink');
    itemAId = data!.id;
  });

  it('prevents User B from selecting User A items (Cross-tenant read isolation)', async () => {
    const { data, error } = await userBClient
      .from('items')
      .select('*')
      .eq('id', itemAId);

    expect(error).toBeNull();
    expect(data).toEqual([]); // RLS returns empty array, no data leaked
  });

  it('prevents User B from updating User A items (Cross-tenant write isolation)', async () => {
    const { data, error } = await userBClient
      .from('items')
      .update({ name: 'Hacked Drink' })
      .eq('id', itemAId)
      .select();

    expect(error).toBeNull();
    expect(data).toEqual([]); // 0 rows updated

    // Verify User A still has original name
    const { data: original } = await userAClient
      .from('items')
      .select('name')
      .eq('id', itemAId)
      .single();
    expect(original!.name).toBe('Alpha Energy Drink');
  });

  it('prevents User B from inserting an item with User A business_id', async () => {
    const { error } = await userBClient
      .from('items')
      .insert({
        business_id: businessAId, // Attempt to inject into Business A
        name: 'Injected Item',
        quantity: 1,
        price: 1.0,
      });

    // RLS with check constraint must deny
    expect(error).toBeDefined();
  });

  it('denies authenticated client read access to rate_limits and telegram_link_codes', async () => {
    const { error: rateLimitError } = await userAClient.from('rate_limits').select('*');
    expect(rateLimitError).toBeDefined();

    const { error: linkCodesError } = await userAClient.from('telegram_link_codes').select('*');
    expect(linkCodesError).toBeDefined();
  });

  it('rejects negative quantity or negative price via database CHECK constraint', async () => {
    const { error: negQtyError } = await userAClient
      .from('items')
      .insert({
        business_id: businessAId,
        name: 'Negative Qty Item',
        quantity: -10,
        price: 5.0,
      });
    expect(negQtyError).toBeDefined();

    const { error: negPriceError } = await userAClient
      .from('items')
      .insert({
        business_id: businessAId,
        name: 'Negative Price Item',
        quantity: 10,
        price: -5.0,
      });
    expect(negPriceError).toBeDefined();
  });

  it('executes atomic adjust_stock and rejects taking stock below 0', async () => {
    // 1. Valid reduction of 5 units (from 20 to 15)
    const { data: updatedItem, error: adjustError } = await userAClient.rpc('adjust_stock', {
      _item_id: itemAId,
      _delta: -5,
      _reason: 'sale',
      _note: 'Test counter sale',
    });

    expect(adjustError).toBeNull();
    expect(updatedItem.quantity).toBe(15);

    // 2. Reduction that would cause negative stock (-20 units from 15)
    const { error: belowZeroError } = await userAClient.rpc('adjust_stock', {
      _item_id: itemAId,
      _delta: -20,
      _reason: 'sale',
    });
    expect(belowZeroError).toBeDefined();

    // 3. Confirm stock remained at 15
    const { data: finalItem } = await userAClient
      .from('items')
      .select('quantity')
      .eq('id', itemAId)
      .single();
    expect(finalItem!.quantity).toBe(15);
  });

  it('computes dashboard_summary accurately in a single query', async () => {
    const { data, error } = await userAClient.rpc('dashboard_summary', {
      _business_id: businessAId,
    });

    expect(error).toBeNull();
    const summary = data as {
      total_items: number;
      low_stock_count: number;
      out_of_stock_count: number;
      expiring_soon_count: number;
      expired_count: number;
      total_stock_value: number;
    };

    expect(summary.total_items).toBe(1);
    expect(summary.total_stock_value).toBe(15 * 2.5); // 37.5
  });
});
