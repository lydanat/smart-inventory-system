'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validation/auth';
import { loginAction, getGoogleOAuthUrlAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const oauthError = searchParams.get('error');

  const [rememberMe, setRememberMe] = React.useState(true);
  const [serverError, setServerError] = React.useState<string | null>(
    oauthError ? 'Authentication session failed. Please try again.' : null
  );
  const [isPending, startTransition] = React.useTransition();

  // Auto-exchange auth code if landed on /login with code parameter from OAuth
  React.useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      window.location.href = `/auth/callback?code=${encodeURIComponent(codeParam)}`;
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmitPassword = (data: LoginInput) => {
    setServerError(null);
    startTransition(async () => {
      const res = await loginAction(data, next);
      if (!res.ok) {
        setServerError(res.error.message);
        toast.error(res.error.message);
      } else {
        toast.success('Signed in successfully');
        router.push(res.data.redirect);
        router.refresh();
      }
    });
  };

  const handleGoogleSignIn = () => {
    setServerError(null);
    startTransition(async () => {
      const res = await getGoogleOAuthUrlAction(next);
      if (!res.ok) {
        setServerError(res.error.message);
        toast.error(res.error.message);
      } else {
        window.location.href = res.data.url;
      }
    });
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-zinc-950 p-0 m-0">
      {/* Left Column: Visual Showcase (Almost full image with rounded-lg on white background) */}
      <div className="hidden lg:flex flex-col h-full min-h-screen p-2.5 lg:p-3 select-none bg-white dark:bg-zinc-950">
        <div className="relative w-full h-full min-h-[calc(100vh-1.25rem)] lg:min-h-[calc(100vh-1.5rem)] rounded-lg overflow-hidden flex flex-col justify-end p-8 sm:p-10">
          <Image
            src="/images/smart-inventory-hero.jpg"
            alt="Smart Inventory Warehouse"
            fill
            priority
            sizes="50vw"
            className="object-cover rounded-lg"
          />
          {/* Bottom subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none rounded-lg" />

          {/* Overlaid Headline & Subtitle */}
          <div className="relative z-10 space-y-2 text-white">
            <h2 className="text-2xl xl:text-3xl font-bold tracking-tight leading-tight">
              Autonomous Inventory
            </h2>
            <p className="text-xs sm:text-sm text-white/80 font-normal max-w-md leading-relaxed">
              Real-time robotics dispatch, stock forecasting, and automated replenishment.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Authentication Panel */}
      <div className="w-full min-h-screen flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-12 bg-white dark:bg-zinc-950">
        <div className="w-full max-w-[400px] space-y-6 mx-auto">
          {/* Brand Logo & Heading */}
          <div className="text-center space-y-3">
            <BrandLogo className="w-12 h-12 mx-auto" />
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-zinc-950 dark:text-white">
                Welcome to Smart Inventory
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Log in with
              </p>
            </div>
          </div>

          {/* Social Provider: Google */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isPending}
            className="w-full h-11 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-900 dark:text-zinc-100 gap-2.5 text-xs sm:text-sm font-medium shadow-xs active:scale-[0.99] transition-all"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-white dark:bg-zinc-950 px-3 text-zinc-400 dark:text-zinc-500 font-medium">
                Or continue with email
              </span>
            </div>
          </div>

          {serverError && (
            <Alert variant="destructive" className="py-2.5 text-xs rounded-lg animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <AlertDescription className="text-xs leading-relaxed">{serverError}</AlertDescription>
            </Alert>
          )}

          {/* Email & Password Form */}
          <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-3.5 animate-fade-in">
            <div className="space-y-1">
              <Label htmlFor="email" className="sr-only">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                disabled={isPending}
                className="h-11 text-xs sm:text-sm rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 border-slate-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-200"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-[11px] text-destructive font-medium pl-0.5">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="sr-only">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isPending}
                className="h-11 text-xs sm:text-sm rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 border-slate-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-200"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-[11px] text-destructive font-medium pl-0.5">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => toast.info('Please contact your store administrator to reset your password.')}
                className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Forgot Password
              </button>
            </div>

            {/* Primary Action Button */}
            <Button
              type="submit"
              className="w-full h-11 rounded-lg font-medium text-xs sm:text-sm bg-zinc-950 hover:bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 shadow-sm active:scale-[0.99] transition-all"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>

          {/* Footer Navigation */}
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 pt-1">
            Don&apos;t you have an account?{' '}
            <Link href="/signup" className="text-zinc-950 dark:text-white font-semibold hover:underline">
              Sign up
            </Link>
          </p>

          {/* Security / Compliance Badge (Matching Magnific reCAPTCHA position) */}
          <div className="pt-2 text-center flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Protected by Supabase Auth & Multi-Tenant RLS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="w-full min-h-screen bg-white dark:bg-zinc-950 animate-pulse" />}>
      <LoginForm />
    </React.Suspense>
  );
}

