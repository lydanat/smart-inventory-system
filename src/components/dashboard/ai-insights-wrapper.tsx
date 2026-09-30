import { createClient } from '@/lib/supabase/server';
import { getOrGenerateRecommendations } from '@/lib/services/ai';
import { AIInsightsCard } from '@/components/dashboard/ai-insights-card';
import { Skeleton } from '@/components/ui/skeleton';

interface AIInsightsWrapperProps {
  businessId: string;
}

export async function AIInsightsWrapper({ businessId }: AIInsightsWrapperProps) {
  const supabase = await createClient();

  // Fetch recommendations and catalog items for quick restock lookup
  const [recommendations, itemsRes] = await Promise.all([
    getOrGenerateRecommendations(businessId).catch(() => null),
    supabase
      .from('items')
      .select('id, name, quantity, unit')
      .eq('business_id', businessId),
  ]);

  const itemsCatalog: Record<string, { id: string; name: string; quantity: number; unit: string }> = {};
  for (const item of itemsRes.data || []) {
    itemsCatalog[item.name.trim().toLowerCase()] = {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
    };
  }

  return <AIInsightsCard initialData={recommendations} itemsCatalog={itemsCatalog} />;
}

export function AIInsightsSkeleton() {
  return (
    <div className="rounded-lg border border-border/70 p-6 space-y-4 bg-card/60 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded" />
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
      </div>
    </div>
  );
}
