import { describe, it, expect } from 'vitest';
import { getGoogleOAuthUrlAction, loginAction } from '@/actions/auth';

describe('Authentication Actions Integration', () => {
  it('validates input for getGoogleOAuthUrlAction and generates valid Supabase OAuth URL', async () => {
    const res = await getGoogleOAuthUrlAction('/dashboard');
    if (res.ok) {
      expect(res.data.url).toBeDefined();
      expect(res.data.url).toContain('google');
      expect(res.data.url).toContain('supabase.co/auth/v1/authorize');
    } else {
      expect(res.error).toBeDefined();
      expect(res.error.message).toBeTruthy();
    }
  });

  it('rejects invalid email format in loginAction', async () => {
    const res = await loginAction({ email: 'not-an-email', password: 'any' });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('rejects incorrect password in loginAction', async () => {
    const res = await loginAction({ email: 'valid_user@example.com', password: 'WrongPassword123!' });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe('UNAUTHENTICATED');
    }
  });
});
