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

    // 2. Rate limiting for signups (10 per hour per IP)
    const headerList = await headers();
    const clientIp = headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-ip';
    const allowed = await checkRateLimit(`signup:${clientIp}`, 10, '1 hour');
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
          fieldErrors: parsed.error.flatten().fieldErrors,
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

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
