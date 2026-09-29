import crypto from 'crypto';

/**
 * Constant-time string comparison to prevent timing attacks.
 * Used for Telegram webhook secret token and Cron bearer authorization.
 */
export function safeCompare(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    // Prevent timing discrepancy on length check by comparing bufA with itself
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}
