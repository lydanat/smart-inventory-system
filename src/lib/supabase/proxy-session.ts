import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do NOT use getSession() for authorization. getUser() securely validates the token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Unauthenticated user attempting to access protected application routes
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isApiRoute = pathname.startsWith('/api');
  const isPublicStatic = pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico') || pathname.includes('.');

  if (!user && !isAuthRoute && !isApiRoute && !isPublicStatic && pathname !== '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // Validate redirect URL to prevent open redirect
    if (pathname && !pathname.startsWith('//')) {
      url.searchParams.set('next', pathname);
    }
    return NextResponse.redirect(url);
  }

  // Authenticated user trying to access /login or /signup -> redirect to dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    const next = url.searchParams.get('next');
    if (next && next.startsWith('/') && !next.startsWith('//')) {
      url.pathname = next;
      url.searchParams.delete('next');
    } else {
      url.pathname = '/dashboard';
    }
    return NextResponse.redirect(url);
  }

  // Home route '/' -> redirect to /dashboard if logged in, or /login if not
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = user ? '/dashboard' : '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
