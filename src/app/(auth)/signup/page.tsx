'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@/lib/validation/auth';
import { signUpAction, getGoogleOAuthUrlAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
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

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      businessName: '',
      email: '',
      password: '',
    },
  });

  const passwordValue = watch('password', '');
  const hasMinLength = passwordValue.length >= 8;

  const onSubmit = (data: SignupInput) => {
    setServerError(null);
    startTransition(async () => {
      const res = await signUpAction(data);
      if (!res.ok) {
        setServerError(res.error.message);
        toast.error(res.error.message);
      } else {
        toast.success('Account created successfully! Welcome.');
        router.push('/dashboard');
        router.refresh();
      }
    });
  };

  const handleGoogleSignUp = () => {
    setServerError(null);
    startTransition(async () => {
      const res = await getGoogleOAuthUrlAction('/dashboard');
      if (!res.ok) {
        setServerError(res.error.message);
        toast.error(res.error.message);
      } else {
        window.location.href = res.data.url;
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-100/90 dark:bg-zinc-950">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-lg border border-slate-200/90 dark:border-zinc-800 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden p-3.5 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center animate-scale-in">
        {/* Left Column: Visual Showcase */}
        <div className="hidden md:flex relative rounded-lg overflow-hidden min-h-[580px] h-full flex-col justify-end p-8 select-none bg-slate-950">
          <Image
            src="/images/smart-inventory-hero.jpg"
            alt="Automated Smart Inventory Warehouse"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

          {/* Headline */}
          <div className="relative z-10 space-y-1 text-white">
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-[1.05] uppercase drop-shadow-md">
              START.
              <br />
              CONNECT.
              <br />
              SCALE.
            </h2>
            <p className="text-xs text-white/80 font-normal pt-2 drop-shadow-sm">
              Next-generation inventory control, multi-tenant analytics & automation.
            </p>
          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div className="flex flex-col justify-center px-2 sm:px-6 md:px-4 lg:px-8 py-4 sm:py-6 space-y-4">
          {/* Brand Header */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white uppercase">
              Create your store
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Set up your isolated tenant inventory with automated reorder intelligence
            </p>
          </div>

          {serverError && (
            <Alert variant="destructive" className="py-2.5 text-xs rounded-lg animate-fade-in">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 animate-fade-in">
            <div className="space-y-1.5">
              <Label htmlFor="businessName" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Store / Business Name
              </Label>
              <Input
                id="businessName"
                placeholder="e.g. Riverside Mart"
                disabled={isPending}
                className="h-11 text-xs rounded-lg bg-slate-50/90 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 border-slate-200 dark:border-zinc-700"
                {...register('businessName')}
              />
              {errors.businessName && (
                <p className="text-[11px] text-destructive font-medium">{errors.businessName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="owner@yourstore.com"
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
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isPending}
                className="h-11 text-xs rounded-lg bg-slate-50/90 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 border-slate-200 dark:border-zinc-700"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-[11px] text-destructive font-medium">{errors.password.message}</p>
              )}
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 pt-0.5">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${
                    hasMinLength ? 'text-emerald-500' : 'text-zinc-400 dark:text-zinc-600'
                  }`}
                />
                <span>Must be at least 8 characters</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-lg font-semibold text-xs bg-zinc-950 hover:bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 shadow-md active:scale-[0.99] transition-transform"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating store...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          {/* Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignUp}
            disabled={isPending}
            className="w-full h-11 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white hover:bg-slate-50 dark:bg-zinc-800/80 dark:hover:bg-zinc-750 text-zinc-900 dark:text-zinc-100 gap-2.5 text-xs font-medium shadow-xs active:scale-[0.99] transition-all"
          >
            <GoogleIcon />
            <span>Sign up with Google</span>
          </Button>

          {/* Footer */}
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 pt-1">
            Already have an account?{' '}
            <Link href="/login" className="text-zinc-950 dark:text-white font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
