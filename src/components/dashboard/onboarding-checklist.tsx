'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, X, ArrowRight, Compass, Cpu, Send } from 'lucide-react';

interface OnboardingChecklistProps {
  totalItems: number;
}

export function OnboardingChecklist({ totalItems }: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = React.useState<boolean>(true); // start hidden during SSR

  React.useEffect(() => {
    const isDismissed = localStorage.getItem('smart_inventory_onboarding_dismissed');
    if (!isDismissed) {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('smart_inventory_onboarding_dismissed', 'true');
    setDismissed(true);
  };

  // Only show if items < 3 and not dismissed
  if (dismissed || totalItems >= 3) {
    return null;
  }

  const itemsTarget = 3;
  const itemsProgress = Math.min(totalItems, itemsTarget);
  const itemsDone = totalItems >= itemsTarget;

  // Calculate overall steps completed out of 4
  const stepsDone = 1 + (itemsDone ? 1 : 0); // Step 1 is always completed (account created)
  const percentComplete = Math.round((stepsDone / 4) * 100);

  return (
    <Card className="border-primary/30 bg-primary/[0.03] shadow-xs relative overflow-hidden">
      <div className="absolute top-3 right-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={handleDismiss}
          title="Dismiss onboarding guide"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>

      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Getting Started Checklist</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Complete these steps to unlock automated AI stock analysis and real-time Telegram alerts.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">{percentComplete}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {/* Step 1: Create Account */}
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-background/60 border border-border/40">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground">1. Create Store</p>
              <p className="text-[11px] text-muted-foreground">Account and tenant ready</p>
            </div>
          </div>

          {/* Step 2: Add First 3 Items */}
          <Link
            href="/inventory"
            className="flex items-start gap-2.5 p-2 rounded-lg bg-background/60 border border-border/40 hover:border-primary/50 transition-colors group"
          >
            {itemsDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                2. Add 3 Items ({itemsProgress}/3)
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-[11px] text-muted-foreground">Stock, SKU, and threshold</p>
            </div>
          </Link>

          {/* Step 3: Connect Telegram */}
          <Link
            href="/alerts"
            className="flex items-start gap-2.5 p-2 rounded-lg bg-background/60 border border-border/40 hover:border-primary/50 transition-colors group"
          >
            <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                3. Connect Telegram
                <Send className="w-3 h-3 text-sky-500" />
              </p>
              <p className="text-[11px] text-muted-foreground">Instant low stock pings</p>
            </div>
          </Link>

          {/* Step 4: Run AI Insights */}
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-background/60 border border-border/40 opacity-80">
            <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                4. Automated Analysis
                <Cpu className="w-3 h-3 text-primary" />
              </p>
              <p className="text-[11px] text-muted-foreground">Generates reorder insights</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
