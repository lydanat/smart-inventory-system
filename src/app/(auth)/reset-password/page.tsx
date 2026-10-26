'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validation/auth';
import { updatePasswordAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Loader2, AlertCircle, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const currentPassword = watch('password', '');
  const hasMinLength = currentPassword.length >= 8;

  const onSubmit = (data: ResetPasswordInput) => {
    setServerError(null);
    startTransition(async () => {
      const res = await updatePasswordAction(data);
      if (!res.ok) {
        setServerError(res.error.message);
        toast.error(res.error.message);
      } else {
        setIsSuccess(true);
        toast.success('Password updated successfully!');
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1500);
      }
    });
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-zinc-950 p-0 m-0">
      {/* Left Column: Visual Showcase */}
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none rounded-lg" />
          <div className="relative z-10 space-y-2 text-white">
            <h2 className="text-2xl xl:text-3xl font-bold tracking-tight leading-tight">
              Secure Account Access
            </h2>
            <p className="text-xs sm:text-sm text-white/80 font-normal max-w-md leading-relaxed">
              Create a strong password for direct email access alongside your Google Sign-In.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Reset Password Panel */}
      <div className="w-full min-h-screen flex flex-col justify-center items-center px-6 sm:px-12 lg:px-16 py-12 bg-white dark:bg-zinc-950">
        <div className="w-full max-w-[400px] space-y-6 mx-auto">
          {/* Brand Logo & Heading */}
          <div className="text-center space-y-3">
            <BrandLogo className="w-12 h-12 mx-auto" />
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-zinc-950 dark:text-white">
                Set New Password
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Enter your new password below to secure your store account.
              </p>
            </div>
          </div>

          {serverError && (
            <Alert variant="destructive" className="py-2.5 text-xs rounded-lg animate-fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <AlertDescription className="text-xs leading-relaxed">{serverError}</AlertDescription>
            </Alert>
          )}

          {isSuccess ? (
            <div className="p-6 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-center space-y-3 animate-fade-in">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="text-base font-semibold text-emerald-700 dark:text-emerald-300">
                Password Updated!
              </h3>
              <p className="text-xs text-muted-foreground">
                Redirecting you to your store dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 animate-fade-in">
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    disabled={isPending}
                    className="h-11 text-xs sm:text-sm rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 border-slate-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-200"
                    {...register('password')}
                  />
                  <KeyRound className="absolute right-3 top-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                </div>
                {errors.password && (
                  <p className="text-[11px] text-destructive font-medium pl-0.5">{errors.password.message}</p>
                )}
                {/* Visual strength indicator */}
                <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                  <div
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      hasMinLength ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-zinc-800'
                    }`}
                  />
                  <span className={`text-[10px] ${hasMinLength ? 'text-emerald-600 font-medium' : 'text-zinc-400'}`}>
                    8+ chars
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-xs font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  disabled={isPending}
                  className="h-11 text-xs sm:text-sm rounded-lg bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 border-slate-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-200"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-[11px] text-destructive font-medium pl-0.5">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-lg font-medium text-xs sm:text-sm bg-zinc-950 hover:bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 shadow-sm active:scale-[0.99] transition-all"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  'Update Password & Continue'
                )}
              </Button>
            </form>
          )}

          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 pt-1">
            Remember your credentials?{' '}
            <Link href="/login" className="text-zinc-950 dark:text-white font-semibold hover:underline">
              Back to login
            </Link>
          </p>

          <div className="pt-2 text-center flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted with SHA-256 and Argon2 password hashing</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="w-full min-h-screen bg-white dark:bg-zinc-950 animate-pulse" />}>
      <ResetPasswordForm />
    </React.Suspense>
  );
}
