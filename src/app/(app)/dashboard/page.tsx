import { createClient } from '@/lib/supabase/server';
import {
  getDashboardSummary,
  getAttentionNeededItems,
  getFastMovingItems,
  getStockByCategory,
  getRecentMovementsChartData,
} from '@/lib/services/dashboard';
import { StatCards } from '@/components/dashboard/stat-cards';
import { AttentionList } from '@/components/dashboard/attention-list';
import { FastMovers } from '@/components/dashboard/fast-movers';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import { Suspense } from 'react';
import { OnboardingChecklist } from '@/components/dashboard/onboarding-checklist';
import { AIInsightsWrapper, AIInsightsSkeleton } from '@/components/dashboard/ai-insights-wrapper';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Sparkles } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: member } = await supabase
    .from('business_members')
    .select('business_id, businesses(name)')
    .single();

  const businessObj = member?.businesses as unknown as { name: string } | null;
  const businessName = businessObj?.name || 'My Store';
  const businessId = member?.business_id;

  if (!businessId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h3 className="text-lg font-semibold">Store Setup Required</h3>
        <p className="text-sm text-muted-foreground mt-1">
          No business association found for this account.
        </p>
      </div>
    );
  }

  // Parallel server-side data fetching for optimal performance
  const [summary, attentionItems, fastMovers, categoryStock, dailyMovements] =
    await Promise.all([
      getDashboardSummary(businessId),
      getAttentionNeededItems(businessId, 8),
      getFastMovingItems(businessId, 5),
      getStockByCategory(businessId),
      getRecentMovementsChartData(businessId, 14),
    ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome to {businessName}
          </h2>
          <p className="text-sm text-muted-foreground">
            Real-time stock health, automated safety rules, and daily movement activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="gap-1.5 font-semibold">
            <Link href="/inventory">
              <PlusCircle className="w-4 h-4" />
              <span>Manage Inventory</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Onboarding Checklist for stores with < 3 items */}
      <OnboardingChecklist totalItems={summary.total_items} />

      {/* 4 Top KPI Stat Cards */}
      <StatCards summary={summary} />

      {/* AI Business Advisor Card (Streaming Suspense) */}
      <Suspense fallback={<AIInsightsSkeleton />}>
        <AIInsightsWrapper businessId={businessId} />
      </Suspense>

      {/* Charts Section: Donut + Bar */}
      <DashboardCharts categories={categoryStock} movements={dailyMovements} />

      {/* Bottom Grid: Immediate Attention List (2 cols) & Fast Movers (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttentionList items={attentionItems} />
        </div>
        <div className="lg:col-span-1">
          <FastMovers items={fastMovers} />
        </div>
      </div>
    </div>
  );
}
