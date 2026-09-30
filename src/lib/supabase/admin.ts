import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error('Missing Supabase admin environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set');
  }

  _supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _supabaseAdmin;
}

/**
 * Admin client with service_role privileges (bypasses RLS).
 * CRITICAL SECURITY RULE:
 * This client is strictly server-only and allowed only in:
 * 1. Telegram webhook
 * 2. Cron route handlers (/api/cron/*)
 * 3. check_rate_limit implementation
 * 4. Telegram link code creation/redemption
 * NEVER use this client for normal authenticated user CRUD!
 */
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    // @ts-expect-error proxy access
    const val = client[prop];
    if (typeof val === 'function') {
      return val.bind(client);
    }
    return val;
  },
});
