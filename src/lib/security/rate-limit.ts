import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';

/**
 * Checks if an operation violates rate limits using the database RPC check_rate_limit.
 * Returns true if allowed, false if rate limited.
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowDuration: string // Postgres interval string, e.g. '1 minute', '1 hour', '24 hours'
): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
      _key: key,
      _max: maxRequests,
      _window: windowDuration,
    });

    if (error) {
      logger.error('Rate limit RPC error', { error: error.message, key });
      // Fail closed or open? Under database disruption, allow writes but log error
      return true;
    }

    return Boolean(data);
  } catch (err: unknown) {
    const errorObj = err as { message?: string };
    logger.error('Rate limit exception', { error: errorObj?.message, key });
    return true;
  }
}
