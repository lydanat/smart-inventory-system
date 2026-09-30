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
import { Loader2, AlertCircle } from 'lucide-react';
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
    <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-lg border border-slate-200/90 dark:border-zinc-800 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden p-3.5 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center animate-scale-in">
      {/* Left Column: Visual Showcase */}
      <div className="hidden md:flex relative rounded-lg overflow-hidden min-h-[560px] h-full flex-col justify-end p-8 select-none bg-slate-950">
        <Image
          src="/images/smart-inventory-hero.jpg"
          alt="Automated Smart Inventory Warehouse"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

        {/* High-impact 3-word headline */}
        <div className="relative z-10 space-y-1 text-white">
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-[1.05] uppercase drop-shadow-md">
            TRACK.
            <br />
            OPTIMIZE.
            <br />
            GROW.
          </h2>
          <p className="text-xs text-white/80 font-normal pt-2 drop-shadow-sm">
            Intelligent warehouse robotics, stock forecasting & automated reorders.
          </p>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="flex flex-col justify-center px-2 sm:px-6 md:px-4 lg:px-8 py-4 sm:py-6 space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white uppercase">
            Welcome Back
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Enter your email and password to access your account
          </p>
        </div>

        {serverError && (
          <Alert variant="destructive" className="py-2.5 text-xs rounded-lg animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <AlertDescription className="text-xs leading-relaxed">{serverError}</AlertDescription>
          </Alert>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4 animate-fade-in">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              disabled={isPending}
              className="h-11 text-xs rounded-lg bg-slate-50/90 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 border-slate-200 dark:border-zinc-700"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-[11px] text-destructive font-medium">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isPending}
              className="h-11 text-xs rounded-lg bg-slate-50/90 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 border-slate-200 dark:border-zinc-700"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-[11px] text-destructive font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div className="flex items-center justify-between text-xs pt-1">
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

          {/* Primary Sign In Button */}
          <Button
            type="submit"
            className="w-full h-11 rounded-lg font-semibold text-xs bg-zinc-950 hover:bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 shadow-md active:scale-[0.99] transition-transform"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-400 dark:text-zinc-500 font-semibold tracking-wider">
              OR
            </span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isPending}
          className="w-full h-11 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white hover:bg-slate-50 dark:bg-zinc-800/80 dark:hover:bg-zinc-750 text-zinc-900 dark:text-zinc-100 gap-2.5 text-xs font-medium shadow-xs active:scale-[0.99] transition-all"
        >
          <GoogleIcon />
          <span>Sign in with Google</span>
        </Button>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 pt-1">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-zinc-950 dark:text-white font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-100/90 dark:bg-zinc-950">
      <React.Suspense fallback={<div className="w-full max-w-4xl h-[560px] rounded-lg border bg-white dark:bg-zinc-900 animate-pulse" />}>
        <LoginForm />
      </React.Suspense>
    </div>
  );
}
