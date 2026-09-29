import { describe, it, expect, beforeAll } from 'vitest';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createTelegramLinkCode, verifyAndConsumeTelegramCode } from '@/lib/telegram/link';

describe('Telegram Integration & Security Tests', () => {
  let testBusinessId: string;
  let testUserId: string;

  beforeAll(async () => {
    // 1. Create a real auth user to satisfy foreign key constraint on auth.users(id)
    const testEmail = `tg_user_${Date.now()}@test.internal`;
    const { data: authData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'Password123!',
      email_confirm: true,
    });

    if (userError || !authData.user) {
      throw new Error(`Failed to create test user: ${userError?.message}`);
    }
    testUserId = authData.user.id;

    // 2. Create a temporary test business
    const { data: business, error: busError } = await supabaseAdmin
      .from('businesses')
      .insert({
        name: `Telegram Test Store ${Date.now()}`,
        currency: 'USD',
        timezone: 'UTC',
      })
      .select('id')
      .single();

    if (busError || !business) {
      throw new Error(`Failed to create test business: ${busError?.message}`);
    }
    testBusinessId = business.id;
  });

  it('generates a 6-character alphanumeric link code and stores only its SHA-256 hash', async () => {
    const result = await createTelegramLinkCode(testBusinessId, testUserId);

    expect(result.code).toBeDefined();
    expect(result.code.length).toBe(6);
    expect(result.deepLink).toContain(result.code);

    // Verify raw code is NOT stored anywhere in the database; only SHA-256 hash
    const expectedHash = crypto.createHash('sha256').update(result.code).digest('hex');

    const { data: record } = await supabaseAdmin
      .from('telegram_link_codes')
      .select('*')
      .eq('code_hash', expectedHash)
      .single();

    expect(record).toBeDefined();
    expect(record?.code_hash).toBe(expectedHash);
    expect(record?.business_id).toBe(testBusinessId);
    expect(record?.used_at).toBeNull();

    // Verify searching by plaintext code fails
    const { data: plaintextRecord } = await supabaseAdmin
      .from('telegram_link_codes')
      .select('*')
      .eq('code_hash', result.code);

    expect(plaintextRecord?.length).toBe(0);
  });

  it('links chat_id to business upon code verification and invalidates code atomically', async () => {
    const { code } = await createTelegramLinkCode(testBusinessId, testUserId);
    const mockChatId = Date.now();

    // Verify and consume code
    const result = await verifyAndConsumeTelegramCode(code, mockChatId.toString());

    expect(result.success).toBe(true);

    // Verify business has chat_id set and alerts_enabled = true
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('telegram_chat_id, alerts_enabled')
      .eq('id', testBusinessId)
      .single();

    expect(business?.telegram_chat_id).toBe(mockChatId);
    expect(business?.alerts_enabled).toBe(true);

    // Verify code is marked as used
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const { data: record } = await supabaseAdmin
      .from('telegram_link_codes')
      .select('used_at')
      .eq('code_hash', codeHash)
      .single();

    expect(record?.used_at).not.toBeNull();

    // Verify re-using the same code fails
    const secondAttempt = await verifyAndConsumeTelegramCode(code, mockChatId.toString());
    expect(secondAttempt.success).toBe(false);
  });

  it('rejects expired link codes', async () => {
    const expiredCode = 'EXP123';
    const expiredHash = crypto.createHash('sha256').update(expiredCode).digest('hex');
    const pastTime = new Date(Date.now() - 1000 * 60).toISOString(); // 1 minute ago

    await supabaseAdmin.from('telegram_link_codes').insert({
      code_hash: expiredHash,
      business_id: testBusinessId,
      created_by: testUserId,
      expires_at: pastTime,
    });

    const result = await verifyAndConsumeTelegramCode(expiredCode, 'chat_999');
    expect(result.success).toBe(false);
  });
});
