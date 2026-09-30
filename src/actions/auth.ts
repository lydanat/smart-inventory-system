'use server';

import { createClient } from '@/lib/supabase/server';
import { signupSchema, loginSchema } from '@/lib/validation/auth';
import type { ActionResult } from '@/lib/security/action-wrapper';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signUpAction(rawInput: unknown): Promise<ActionResult<{ success: boolean; requiresEmailConfirmation: boolean }>> {
  try {
    // 1. Validate inputs
    const parsed = signupSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input fields',
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
      };
    }

    const { email, password, businessName } = parsed.data;

    // 2. Rate limiting for signups (10 per hour per IP in prod, 1000 in dev/test)
    const headerList = await headers();
    const clientIp = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-ip';
    const maxSignups = process.env.NODE_ENV !== 'production' ? 1000 : 10;
    const allowed = await checkRateLimit(`signup:${clientIp}`, maxSignups, '1 hour');
    if (!allowed) {
      return {
        ok: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many signup attempts. Please try again in an hour.',
        },
      };
    }

    // 3. Perform signup via user Supabase client
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          business_name: businessName,
        },
      },
    });

    if (error) {
      return {
        ok: false,
        error: {
          code: 'BAD_REQUEST',
          message: error.message || 'Failed to create account.',
        },
      };
    }

    const requiresEmailConfirmation = !data.session;
    return {
      ok: true,
      data: {
        success: true,
        requiresEmailConfirmation,
      },
    };
  } catch (err: unknown) {
    const errorObj = err as { message?: string };
    return {
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: errorObj?.message || 'An unexpected error occurred during signup.',
      },
    };
  }
}

export async function loginAction(
  rawInput: unknown,
  nextUrl?: string | null
): Promise<ActionResult<{ redirect: string }>> {
  try {
    const parsed = loginSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email or password format.',
        },
      };
    }

    const { email, password } = parsed.data;

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        ok: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Wrong email or password.',
        },
      };
    }

    // Validate nextUrl to prevent open redirects (must start with / and not //)
    let destination = '/dashboard';
    if (nextUrl && nextUrl.startsWith('/') && !nextUrl.startsWith('//')) {
      destination = nextUrl;
    }

    return {
      ok: true,
      data: {
        redirect: destination,
      },
    };
  } catch (err: unknown) {
    const errorObj = err as { message?: string };
    return {
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: errorObj?.message || 'Failed to sign in. Please try again.',
      },
    };
  }
}

export async function getGoogleOAuthUrlAction(
  nextUrl?: string | null
): Promise<ActionResult<{ url: string }>> {
  try {
    const supabase = await createClient();
    const headerList = await headers();
    const host = headerList.get('host') || 'localhost:3000';
    const protocol = headerList.get('x-forwarded-proto') || 'http';
    const origin = `${protocol}://${host}`;

    let destination = '/dashboard';
    if (nextUrl && nextUrl.startsWith('/') && !nextUrl.startsWith('//')) {
      destination = nextUrl;
    }

    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(destination)}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error || !data.url) {
      return {
        ok: false,
        error: {
          code: 'BAD_REQUEST',
          message: error?.message || 'Failed to initialize Google login. Ensure Google Provider is enabled in Supabase.',
        },
      };
    }

    // Pre-flight check if Google provider is actually enabled in Supabase project
    try {
      const preflight = await fetch(data.url, { method: 'GET', redirect: 'manual' });
      if (preflight.status === 400) {
        const preflightBody = await preflight.json().catch(() => null);
        if (preflightBody?.msg?.includes('Unsupported provider') || preflightBody?.error_code === 'validation_failed') {
          return {
            ok: false,
            error: {
              code: 'PROVIDER_DISABLED',
              message: 'Google Sign-In is not enabled in your Supabase project yet. Please enable Google in Supabase Dashboard → Authentication → Providers → Google.',
            },
          };
        }
      }
    } catch {
      // Ignore network errors in preflight check
    }

    return {
      ok: true,
      data: {
        url: data.url,
      },
    };
  } catch (err: unknown) {
    const errorObj = err as { message?: string };
    return {
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: errorObj?.message || 'Failed to start Google sign-in.',
      },
    };
  }
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
