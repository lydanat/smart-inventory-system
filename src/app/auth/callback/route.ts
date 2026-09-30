import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const rawNext = searchParams.get('next');

  // Prevent redirect loops: only allow relative paths that do not point back to auth endpoints
  let destination = '/dashboard';
  if (
    rawNext &&
    rawNext.startsWith('/') &&
    !rawNext.startsWith('//') &&
    !rawNext.startsWith('/auth') &&
    !rawNext.startsWith('/login') &&
    !rawNext.startsWith('/signup')
  ) {
    destination = rawNext;
  }

  const supabase = await createClient();

  // 1. PKCE code exchange (Google OAuth or PKCE auth)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // 2. Email token_hash verification (Magic Link / OTP email link)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // Return user to login with error parameter if verification fails
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
