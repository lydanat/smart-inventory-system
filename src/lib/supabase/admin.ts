import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error('Missing Supabase admin environment variables');
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
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
