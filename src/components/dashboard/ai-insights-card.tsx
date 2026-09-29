'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StockAdjustDialog } from '@/components/inventory/stock-adjust-dialog';
import { refreshRecommendationsAction, recordFeedbackAction } from '@/actions/ai';
import { toast } from 'sonner';
import {
  Cpu,
  RefreshCw,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  PackagePlus,
  Megaphone,
  Truck,
  ShieldCheck,
  Clock,
  ExternalLink,
} from 'lucide-react';
import type { AIRecommendationRecord } from '@/lib/services/ai';
import type {
  RecommendationPayload,
  MarketingItem,
  RestockItem,
  SupplierTip,
} from '@/lib/validation/ai';

interface CatalogItemMap {
  [nameLower: string]: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
  };
}

interface AIInsightsCardProps {
  initialData: AIRecommendationRecord | null;
  itemsCatalog?: CatalogItemMap;
}

export function AIInsightsCard({ initialData, itemsCatalog = {} }: AIInsightsCardProps) {
  const [data, setData] = React.useState<AIRecommendationRecord | null>(initialData);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
  const [votedItems, setVotedItems] = React.useState<Record<string, 'up' | 'down'>>({});

  // Restock dialog state
  const [restockItem, setRestockItem] = React.useState<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
  } | null>(null);
  const [defaultDelta, setDefaultDelta] = React.useState<number>(10);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const payload: RecommendationPayload | undefined = data?.payload;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await refreshRecommendationsAction({ forceRefresh: true });
      if (res.ok) {
        setData(res.data as AIRecommendationRecord);
        toast.success('Recommendations refreshed with latest inventory data');
      } else {
        toast.error(res.error.message || 'Failed to refresh recommendations');
      }
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.message || 'Refresh failed';
      toast.error(errorMsg);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyMessage = async (message: string, index: number) => {
    try {
      await navigator.clipboard.writeText(message);
      setCopiedIndex(index);
      toast.success('Promotion copied to clipboard');
      setTimeout(() => setCopiedIndex(null), 2500);
    } catch {
      toast.error('Unable to copy to clipboard');
    }
  };

  const handleVote = async (
    section: 'marketing' | 'restock' | 'suppliers',
    itemIndex: number,
    rating: 'up' | 'down'
  ) => {
    if (!data?.id) return;
    const voteKey = `${section}-${itemIndex}`;
    setVotedItems((prev) => ({ ...prev, [voteKey]: rating }));

    try {
      await recordFeedbackAction({
        recommendationId: data.id,
        section,
        itemIndex,
        rating,
      });
      toast.success('Feedback recorded. Thank you!');
    } catch {
      // Revert vote on network error
      setVotedItems((prev) => {
        const next = { ...prev };
        delete next[voteKey];
        return next;
      });
      toast.error('Could not save feedback');
    }
  };

  const handleOpenRestock = (itemName: string, suggestedQuantity?: number) => {
    const key = itemName.trim().toLowerCase();
    const item = itemsCatalog[key];
    if (item) {
      setRestockItem(item);
      setDefaultDelta(suggestedQuantity || 10);
      setDialogOpen(true);
    } else {
      // Catalog item lookup not found, redirect search in inventory
      window.location.href = `/inventory?search=${encodeURIComponent(itemName)}`;
    }
  };

  if (!data || !payload) {
    return (
      <Card className="border-dashed bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-3">
          <Cpu className="w-8 h-8 text-muted-foreground animate-pulse" />
          <div>
            <h4 className="text-base font-medium">No Recommendations Yet</h4>
            <p className="text-xs text-muted-foreground">
              Add catalog items and stock movements to generate smart inventory advice.
            </p>
          </div>
          <Button size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Generate Insights
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isAI = data.source === 'gemini';
  const generatedTimeAgo = data.generated_at
    ? new Date(data.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Recently';

  return (
    <Card className="border border-border/80 shadow-sm overflow-hidden bg-gradient-to-b from-card via-card to-card/90">
      {/* Header with Source Badge and Refresh Button */}
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg ${
                isAI
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20'
              }`}
            >
              {isAI ? <Cpu className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">AI Business Advisor</CardTitle>
                <Badge
                  variant="outline"
                  className={`text-[11px] font-medium ${
                    isAI
                      ? 'border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40'
                      : 'border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40'
                  }`}
                >
                  {isAI ? 'Gemini 3.8 Flash' : 'Deterministic Rules'}
                </Badge>
              </div>
              <CardDescription className="text-xs flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3 text-muted-foreground" />
                Updated at {generatedTimeAgo}
              </CardDescription>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs h-8 gap-1.5 shadow-xs hover:bg-accent"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Analyzing...' : 'Refresh'}</span>
          </Button>
        </div>

        {/* Executive Summary */}
        <div className="mt-3 p-3 rounded-lg bg-background/80 border border-border/60 text-xs sm:text-sm font-medium text-foreground leading-relaxed">
          {payload.summary}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Section 1: Restock Suggestions */}
        {payload.restock && payload.restock.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <PackagePlus className="w-3.5 h-3.5 text-blue-500" />
              <span>Suggested Restocks ({payload.restock.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {payload.restock.map((item: RestockItem, idx: number) => {
                const voteKey = `restock-${idx}`;
                const voted = votedItems[voteKey];

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-border/60 bg-card hover:border-blue-300 dark:hover:border-blue-900 transition-colors flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-semibold text-xs sm:text-sm text-foreground line-clamp-1">
                          {item.itemName}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] uppercase font-bold shrink-0 ${
                            item.urgency === 'today'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                          }`}
                        >
                          {item.urgency}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-snug line-clamp-2">
                        {item.why}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <Button
                        size="xs"
                        variant="default"
                        className="h-7 text-[11px] font-medium gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleOpenRestock(item.itemName, item.suggestedQuantity)}
                      >
                        <PackagePlus className="w-3 h-3" />
                        <span>Restock {item.suggestedQuantity ? `+${item.suggestedQuantity}` : ''}</span>
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`w-6 h-6 rounded ${
                            voted === 'up' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' : 'text-muted-foreground'
                          }`}
                          onClick={() => handleVote('restock', idx, 'up')}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`w-6 h-6 rounded ${
                            voted === 'down' ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' : 'text-muted-foreground'
                          }`}
                          onClick={() => handleVote('restock', idx, 'down')}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 2: Marketing Promotions */}
        {payload.marketing && payload.marketing.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Megaphone className="w-3.5 h-3.5 text-purple-500" />
              <span>Turnover & Clearance Ideas ({payload.marketing.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {payload.marketing.map((promo: MarketingItem, idx: number) => {
                const voteKey = `marketing-${idx}`;
                const voted = votedItems[voteKey];
                const isCopied = copiedIndex === idx;

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-border/60 bg-card hover:border-purple-300 dark:hover:border-purple-900 transition-colors flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-semibold text-xs sm:text-sm text-foreground line-clamp-1">
                          {promo.title}
                        </span>
                        <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                          {promo.channel}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug line-clamp-2">
                        {promo.idea}
                      </p>

                      <div className="mt-2.5 p-2 rounded bg-muted/40 border border-border/30 text-[11px] font-mono text-foreground/90 line-clamp-2">
                        &quot;{promo.sampleMessage}&quot;
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <Button
                        size="xs"
                        variant="outline"
                        className="h-7 text-[11px] font-medium gap-1"
                        onClick={() => handleCopyMessage(promo.sampleMessage, idx)}
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'Copied' : 'Copy Message'}</span>
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`w-6 h-6 rounded ${
                            voted === 'up' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' : 'text-muted-foreground'
                          }`}
                          onClick={() => handleVote('marketing', idx, 'up')}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`w-6 h-6 rounded ${
                            voted === 'down' ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' : 'text-muted-foreground'
                          }`}
                          onClick={() => handleVote('marketing', idx, 'down')}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 3: Supplier Tips */}
        {payload.suppliers && payload.suppliers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Truck className="w-3.5 h-3.5 text-amber-500" />
              <span>Supplier & Sourcing Tips ({payload.suppliers.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {payload.suppliers.map((tip: SupplierTip, idx: number) => {
                const voteKey = `suppliers-${idx}`;
                const voted = votedItems[voteKey];

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-border/60 bg-card hover:border-amber-300 dark:hover:border-amber-900 transition-colors flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-semibold text-xs sm:text-sm text-foreground line-clamp-1">
                          {tip.itemCategory}
                        </span>
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {tip.supplierType}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground/90 font-medium mt-1.5 leading-snug">
                        Ask: {tip.whatToAskFor}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">
                        💡 {tip.tip}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <Button
                        size="xs"
                        variant="ghost"
                        asChild
                        className="h-7 text-[11px] font-medium gap-1 text-muted-foreground hover:text-foreground"
                      >
                        <a href="/suppliers">
                          <span>Directory</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`w-6 h-6 rounded ${
                            voted === 'up' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' : 'text-muted-foreground'
                          }`}
                          onClick={() => handleVote('suppliers', idx, 'up')}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`w-6 h-6 rounded ${
                            voted === 'down' ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' : 'text-muted-foreground'
                          }`}
                          onClick={() => handleVote('suppliers', idx, 'down')}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>

      {/* Embedded Stock Adjust Dialog for One-Click Restock */}
      <StockAdjustDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={restockItem}
        defaultDelta={defaultDelta}
        defaultReason="restock"
        onSuccess={() => {
          setDialogOpen(false);
          toast.success(`Successfully recorded restock for ${restockItem?.name}`);
        }}
      />
    </Card>
  );
}
