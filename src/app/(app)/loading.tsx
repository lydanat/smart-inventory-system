import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Title & Tour Trigger skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 sm:w-72 rounded-lg" />
          <Skeleton className="h-4 w-72 sm:w-96 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* Stat Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-card p-5 space-y-3 shadow-xs">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-20 rounded" />
            <Skeleton className="h-3 w-36 rounded" />
          </div>
        ))}
      </div>

      {/* AI Business Advisor Card Skeleton */}
      <div className="rounded-xl border border-purple-500/20 bg-card p-6 space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <Skeleton className="h-14 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg border border-border/40 space-y-2.5">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-4/5 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Attention List & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border/60 bg-card p-6 h-80 space-y-4">
          <Skeleton className="h-5 w-44 rounded" />
          <Skeleton className="h-60 w-full rounded-lg" />
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-6 h-80 space-y-4">
          <Skeleton className="h-5 w-36 rounded" />
          <div className="space-y-3 pt-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-border/30">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
