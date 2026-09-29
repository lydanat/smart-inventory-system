'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateStoreSettingsAction } from '@/actions/settings';
import { signOutAction } from '@/actions/auth';
import { toast } from 'sonner';
import {
  Store,
  Globe,
  Coins,
  ShieldAlert,
  LogOut,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

const formSchema = z.object({
  name: z.string().trim().min(2, 'Store name must be at least 2 characters').max(60),
  currency: z.string().min(1, 'Please select a currency'),
  timezone: z.string().min(1, 'Please select a timezone'),
});

type FormValues = z.infer<typeof formSchema>;

interface SettingsViewProps {
  business: {
    id: string;
    name: string;
    currency: string;
    timezone: string;
  };
  userRole: string;
  userEmail: string;
}

const CURRENCIES = [
  { code: 'USD', label: 'USD ($) - US Dollar' },
  { code: 'EUR', label: 'EUR (€) - Euro' },
  { code: 'GBP', label: 'GBP (£) - British Pound' },
  { code: 'KHR', label: 'KHR (៛) - Cambodian Riel' },
  { code: 'CAD', label: 'CAD ($) - Canadian Dollar' },
  { code: 'AUD', label: 'AUD ($) - Australian Dollar' },
  { code: 'SGD', label: 'SGD ($) - Singapore Dollar' },
  { code: 'JPY', label: 'JPY (¥) - Japanese Yen' },
];

const TIMEZONES = [
  { value: 'Asia/Phnom_Penh', label: 'Asia/Phnom Penh (UTC+7)' },
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok (UTC+7)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (UTC+9)' },
  { value: 'UTC', label: 'UTC (Universal Coordinated Time)' },
  { value: 'Europe/London', label: 'Europe/London (UTC+0 / BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (UTC+1 / CEST)' },
  { value: 'America/New_York', label: 'America/New York (Eastern Time)' },
  { value: 'America/Los_Angeles', label: 'America/Los Angeles (Pacific Time)' },
];

export function SettingsView({ business, userRole, userEmail }: SettingsViewProps) {
  const [isPending, startTransition] = React.useTransition();
  const [isSigningOut, startSignOut] = React.useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: business.name,
      currency: business.currency || 'USD',
      timezone: business.timezone || 'Asia/Phnom_Penh',
    },
  });

  const selectedCurrency = watch('currency');
  const selectedTimezone = watch('timezone');

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const res = await updateStoreSettingsAction(values);
      if (res.ok) {
        toast.success('Store preferences updated successfully');
      } else {
        toast.error(res.error.message || 'Failed to update settings');
      }
    });
  };

  const handleSignOutEverywhere = () => {
    startSignOut(async () => {
      await signOutAction();
      window.location.href = '/login';
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Store Configuration Card */}
      <Card className="border border-border/80 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Store Preferences</CardTitle>
            </div>
            <CardDescription>
              Configure your primary store name, currency, and local reporting timezone.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Business / Store Name</Label>
              <Input
                id="name"
                placeholder="e.g. Acme Organic Grocers"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="currency">Display Currency</Label>
                <Select
                  value={selectedCurrency}
                  onValueChange={(val) => setValue('currency', val, { shouldDirty: true })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="text-xs text-destructive">{errors.currency.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="timezone">Operational Timezone</Label>
                <Select
                  value={selectedTimezone}
                  onValueChange={(val) => setValue('timezone', val, { shouldDirty: true })}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.timezone && (
                  <p className="text-xs text-destructive">{errors.timezone.message}</p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-border/40 pt-4 bg-muted/10">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" />
              Applied across dashboard metrics, catalog pricing, and reports.
            </span>
            <Button type="submit" disabled={isPending || !isDirty} className="font-medium">
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Account & Security Card */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">Account & Security</CardTitle>
          </div>
          <CardDescription>
            Manage your session, view authorization level, and invalidate active sessions.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border border-border/60 bg-muted/20 gap-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Current User Session
              </p>
              <p className="text-sm font-medium text-foreground mt-0.5">{userEmail}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Assigned Role:</span>
              <Badge variant="outline" className="capitalize font-semibold text-xs border-primary/40 text-primary">
                {userRole}
              </Badge>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-border/40 pt-4 bg-muted/10">
          <span className="text-xs text-muted-foreground">
            Sign out will clear your session cookie securely.
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSignOutEverywhere}
            disabled={isSigningOut}
            className="gap-1.5 font-medium"
          >
            {isSigningOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
