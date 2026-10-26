'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Compass,
  Check,
  ArrowRight,
} from 'lucide-react';

export interface TourStep {
  targetSelector: string;
  route: string;
  title: string;
  badge: string;
  description: string;
  actionText?: string;
  placement?: 'bottom' | 'top' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    targetSelector: '#tour-stat-cards',
    route: '/dashboard',
    title: '1. Real-Time Stock Health KPIs',
    badge: 'Dashboard Overview',
    description:
      'Monitor your entire store inventory at a glance: active catalog items, low-stock warnings, out-of-stock shortages, and total stock valuation live.',
    actionText: 'Next: AI Advisor →',
    placement: 'bottom',
  },
  {
    targetSelector: '#tour-ai-advisor',
    route: '/dashboard',
    title: '2. Autonomous AI Business Advisor',
    badge: 'Google Gemini AI',
    description:
      'Powered by Google Gemini and deterministic safety rules. The advisor forecasts stockouts, suggests restock quantities, and generates 3 distinct retail marketing campaigns every 15 minutes.',
    actionText: 'Next: Navigation →',
    placement: 'bottom',
  },
  {
    targetSelector: '#tour-sidebar-nav',
    route: '/dashboard',
    title: '3. Core System Navigation',
    badge: 'App Hubs',
    description:
      'Effortlessly move across your store hubs: Inventory Catalogue, Suppliers Directory, automated Telegram Bot alerts, and Store Settings.',
    actionText: 'Go to Inventory →',
    placement: 'right',
  },
  {
    targetSelector: '#tour-search-bar',
    route: '/inventory',
    title: '4. Instant Search & Safety Filters',
    badge: 'Product Catalogue',
    description:
      "Press '/' from anywhere to jump right to this search bar. Filter by status (Low Stock, Expiring Soon, Out of Stock) or Category in one click.",
    actionText: 'Next: Bulk Actions →',
    placement: 'bottom',
  },
  {
    targetSelector: '#tour-import-btn',
    route: '/inventory',
    title: '5. Excel (.xlsx) Import & Item Creation',
    badge: 'Catalog Actions',
    description:
      'Add items with custom retail prices or import hundreds of products in seconds using our formatted Excel (.xlsx) and CSV spreadsheet templates.',
    actionText: 'Finish Tour 🎉',
    placement: 'bottom',
  },
];

export function InteractiveTour() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = React.useState(false);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [targetRect, setTargetRect] = React.useState<DOMRect | null>(null);
  const [isNavigating, setIsNavigating] = React.useState(false);

  const step = TOUR_STEPS[currentStepIndex];

  // Listen for open event
  React.useEffect(() => {
    const handleOpen = () => {
      setCurrentStepIndex(0);
      setIsOpen(true);
    };

    window.addEventListener('open-system-tour', handleOpen);

    // Auto-launch via ?tour=true
    if (typeof window !== 'undefined' && window.location.search.includes('tour=true')) {
      handleOpen();
    }

    return () => {
      window.removeEventListener('open-system-tour', handleOpen);
    };
  }, []);

  // Update target rectangle and scroll element into view
  const updateRect = React.useCallback(() => {
    if (!isOpen || !step) return;

    const el = document.querySelector(step.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, step]);

  // Handle route change and element location
  React.useEffect(() => {
    if (!isOpen || !step) return;

    // If step belongs to another page, navigate there
    if (pathname !== step.route) {
      setIsNavigating(true);
      router.push(step.route);
      return;
    }

    setIsNavigating(false);

    // Poll until element exists in DOM
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const el = document.querySelector(step.targetSelector);
      if (el) {
        clearInterval(interval);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(updateRect, 300);
      } else if (attempts > 30) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, currentStepIndex, pathname, step, router, updateRect]);

  // Handle window resize and scroll
  React.useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => updateRect();
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [isOpen, updateRect]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsOpen(false);
      try {
        localStorage.setItem('has_seen_interactive_tour', 'true');
      } catch {}
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
    try {
      localStorage.setItem('has_seen_interactive_tour', 'true');
    } catch {}
  };

  if (!isOpen) return null;

  // Calculate tooltip popover positioning
  let tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
  };

  const tooltipWidth = 360;
  const padding = 16;

  if (targetRect) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    if (isMobile) {
      // Bottom sheet style on mobile
      tooltipStyle = {
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        right: '16px',
        zIndex: 9999,
      };
    } else {
      // Desktop positioned relative to rect
      const spaceBelow = window.innerHeight - targetRect.bottom;
      const spaceAbove = targetRect.top;

      let top = targetRect.bottom + 12;
      if (spaceBelow < 240 && spaceAbove > spaceBelow) {
        top = Math.max(padding, targetRect.top - 220);
      }

      // Horizontal clamp
      let left = targetRect.left;
      if (left + tooltipWidth > window.innerWidth - padding) {
        left = window.innerWidth - tooltipWidth - padding;
      }
      left = Math.max(padding, left);

      tooltipStyle = {
        position: 'fixed',
        top: `${Math.round(top)}px`,
        left: `${Math.round(left)}px`,
        width: `${tooltipWidth}px`,
        zIndex: 9999,
      };
    }
  } else {
    // Center fallback if target rect not found yet
    tooltipStyle = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: `${tooltipWidth}px`,
      zIndex: 9999,
    };
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto">
      {/* SVG Backdrop Cutout Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto transition-opacity duration-300">
        <defs>
          <mask id="tour-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - 6}
                y={targetRect.top - 6}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx={10}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#tour-spotlight-mask)"
          onClick={handleSkip}
        />
      </svg>

      {/* Pulsing Outline around Spotlighted Target */}
      {targetRect && (
        <div
          className="fixed pointer-events-none rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-background transition-all duration-300 animate-pulse z-50"
          style={{
            top: `${targetRect.top - 6}px`,
            left: `${targetRect.left - 6}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
        />
      )}

      {/* Floating Guided Popover */}
      <div
        style={tooltipStyle}
        className="rounded-xl border border-border/80 bg-card p-5 text-card-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Step indicator header */}
        <div className="flex items-center justify-between pb-2 border-b border-border/40">
          <Badge variant="outline" className="text-[10px] font-semibold border-primary/40 text-primary bg-primary/5">
            {step?.badge || 'Tour'}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted-foreground">
              {currentStepIndex + 1} of {TOUR_STEPS.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
              title="Close tour"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="py-3 space-y-1.5">
          <h4 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-primary shrink-0" />
            <span>{step?.title}</span>
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isNavigating ? 'Navigating to page...' : step?.description}
          </p>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-xs text-muted-foreground hover:text-foreground h-8 px-2"
          >
            Skip
          </Button>

          <div className="flex items-center gap-1.5">
            {currentStepIndex > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="text-xs h-8 px-2.5 gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={handleNext}
              className="text-xs h-8 px-3 gap-1 font-medium bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <span>{step?.actionText || 'Next'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
