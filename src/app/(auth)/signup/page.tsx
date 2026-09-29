'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@/lib/validation/auth';
import { signUpAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Boxes, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-lg border-border/80">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1">
            <Boxes className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create your store</CardTitle>
          <CardDescription className="text-sm">
            Set up your isolated tenant inventory with automated AI insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <Alert variant="destructive" className="py-2.5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm font-medium">{serverError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="businessName">Store / Business Name</Label>
              <Input
                id="businessName"
                placeholder="e.g. Riverside Mart"
                disabled={isPending}
                {...register('businessName')}
              />
              {errors.businessName && (
                <p className="text-xs text-destructive font-medium">{errors.businessName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="owner@yourstore.com"
                autoComplete="email"
                disabled={isPending}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isPending}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
              )}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${
                    hasMinLength ? 'text-emerald-500' : 'text-muted-foreground/40'
                  }`}
                />
                <span>Must be at least 8 characters</span>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2 font-semibold" disabled={isPending}>
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
        </CardContent>
        <CardFooter className="flex justify-center border-t py-4 text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline ml-1">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
