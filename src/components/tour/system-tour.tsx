'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Compass,
  Sparkles,
  Package,
  FileSpreadsheet,
  Tag,
  Truck,
  Send,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export interface TourStep {
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  description: string;
  keyFeatures: string[];
  tip?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to Smart Inventory AI',
    badge: 'System Overview',
    badgeColor: 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40',
    icon: Compass,
    description:
      'Smart Inventory is your all-in-one store operations platform, combining real-time stock control, multi-tenant row security, and autonomous AI recommendations.',
    keyFeatures: [
      'Real-time inventory levels with instant status tracking',
      'Automated low-stock and expiry warnings before shortages happen',
      'Multi-currency and timezone support customized for your store',
    ],
    tip: 'Everything updates live across desktop, tablet, and mobile browsers.',
  },
  {
    title: 'AI Business Advisor (Gemini 3.8 Flash)',
    badge: 'AI Intelligence',
    badgeColor: 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40',
    icon: Sparkles,
    description:
      'Powered by Google Gemini 3.8 Flash and our deterministic rule engine, the AI advisor analyzes your sales velocity and inventory levels every hour.',
    keyFeatures: [
      'Prioritized restock recommendations with suggested reorder quantities',
      '2 to 3 targeted marketing clearance campaigns with ready-to-copy promo copy',
      'Supplier negotiation tactics and bulk order advice',
      'Deterministic fallback ensures 100% uptime even if offline',
    ],
    tip: 'Click "AI Workflow" on the advisor card anytime to see the full pipeline.',
  },
  {
    title: 'Catalog & Quick Stock Adjustments',
    badge: 'Inventory Management',
    badgeColor: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
    icon: Package,
    description:
      'Manage products effortlessly with SKU tracking, unit measurements, low-stock alert thresholds, and expiry dates.',
    keyFeatures: [
      'Inline quick +/- buttons to log sales and deliveries in one tap',
      'Press "/" anywhere to instantly search across names and SKUs',
      'Audit log tracks who changed stock and the exact reason',
    ],
    tip: 'Dynamic badges update in real-time: In Stock, Low Stock, Expiring, or Out of Stock.',
  },
  {
    title: 'Excel (.xlsx) & CSV Bulk Product Import',
    badge: 'Spreadsheet Upload',
    badgeColor: 'border-teal-500/30 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40',
    icon: FileSpreadsheet,
    description:
      'Already have an existing catalog? Import hundreds of products in seconds from Microsoft Excel (.xlsx) or CSV files.',
    keyFeatures: [
      'One-click template downloads in both CSV and formatted Excel (.xlsx)',
      'Intelligent column auto-detection and data sanitization',
      'Visual preview highlights valid rows vs any invalid items before saving',
    ],
    tip: 'Click the "Import" button with the spreadsheet icon on the inventory page.',
  },
  {
    title: 'Product Category Creation & Filtering',
    badge: 'Categories',
    badgeColor: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
    icon: Tag,
    description:
      'Organize your store catalog into logical categories for rapid filtering and restock grouping.',
    keyFeatures: [
      'Create custom categories on the fly or pick from common retail presets',
      'Add new categories directly inside the product dialog without leaving your workflow',
      'Filter catalog views by category with one click',
    ],
    tip: 'Click the "Categories" button next to "Add Item" to manage your category list.',
  },
  {
    title: 'Suppliers Directory & Lead Times',
    badge: 'Procurement',
    badgeColor: 'border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40',
    icon: Truck,
    description:
      'Keep all vendor contacts, phone numbers, emails, and notes in a centralized directory.',
    keyFeatures: [
      'Link products directly to preferred suppliers',
      'AI Advisor matches low-stock items with vendor contact details',
      'Fast access to supplier contact info for phone calls or reorder emails',
    ],
    tip: 'Visit the "Suppliers" tab in the sidebar to add and manage vendors.',
  },
  {
    title: 'Instant Telegram Bot Notifications',
    badge: 'Automated Alerts',
    badgeColor: 'border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40',
    icon: Send,
    description:
      'Connect your store to our automated Telegram bot (@AIinventorysystemBOT) to receive critical alerts directly on your phone.',
    keyFeatures: [
      'Instant low stock alerts when any item drops below threshold',
      'Expiry warning alerts 7 days before perishable products expire',
      'Daily scheduled morning summaries sent to your group or personal chat',
    ],
    tip: 'Visit "Telegram Alerts" in the sidebar to link your chat in under 30 seconds.',
  },
];

interface SystemTourProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SystemTour({ open, onOpenChange }: SystemTourProps) {
  const [currentStep, setCurrentStep] = React.useState(0);

  const step = TOUR_STEPS[currentStep];
  const IconComponent = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;
  const progressPercent = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  const handleNext = () => {
    if (isLast) {
      onOpenChange(false);
      setCurrentStep(0);
      try {
        localStorage.setItem('has_seen_tour', 'true');
      } catch {}
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    setCurrentStep(0);
    try {
      localStorage.setItem('has_seen_tour', 'true');
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden border border-border/80 shadow-2xl rounded-xl">
        {/* Progress Bar */}
        <div className="w-full bg-muted h-1.5">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-6 space-y-5">
          {/* Header with Step Counter and Badge */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`text-xs font-medium ${step.badgeColor}`}>
              {step.badge}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          {/* Visual Showcase Icon & Title */}
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 shrink-0">
              <IconComponent className="w-6 h-6" />
            </div>
            <div className="space-y-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground tracking-tight leading-snug">
                {step.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          {/* Key Features Bullet Points */}
          <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span>Key Capabilities</span>
            </span>
            <ul className="space-y-1.5 text-xs text-foreground">
              {step.keyFeatures.map((feat, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tip Box */}
          {step.tip && (
            <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-[11px] text-muted-foreground flex items-center gap-2">
              <span className="text-primary font-semibold shrink-0">💡 Pro Tip:</span>
              <span className="leading-relaxed">{step.tip}</span>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground h-9"
            >
              Skip Tour
            </Button>

            <div className="flex items-center gap-2">
              {!isFirst && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  className="text-xs h-9 gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Button>
              )}

              <Button
                size="sm"
                onClick={handleNext}
                className="text-xs h-9 gap-1.5 font-medium"
              >
                {isLast ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Get Started</span>
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
