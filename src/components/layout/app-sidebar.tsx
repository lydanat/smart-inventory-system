'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Boxes,
  Truck,
  Bell,
  Settings,
  Sparkles,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface SidebarProps {
  businessName: string;
}

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Boxes,
  },
  {
    title: 'Suppliers',
    href: '/suppliers',
    icon: Truck,
  },
  {
    title: 'Alerts',
    href: '/alerts',
    icon: Bell,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function SidebarNavContent({
  businessName,
  onItemClick,
}: {
  businessName: string;
  onItemClick?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-border/80 gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-sm">
          <Boxes className="w-5 h-5" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="font-bold text-sm tracking-tight text-foreground truncate">
            Smart Inventory
          </span>
          <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            AI Powered
          </span>
        </div>
      </div>

      {/* Tenant Indicator */}
      <div className="px-4 py-3 border-b border-border/40 bg-muted/20">
        <p className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider mb-0.5">
          Active Store
        </p>
        <p className="text-xs font-semibold text-foreground truncate">{businessName}</p>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-border/80 text-[11px] text-muted-foreground">
        <p className="font-medium text-foreground">Free Tier</p>
        <p>Isolated Tenant Storage</p>
      </div>
    </div>
  );
}

/**
 * Desktop Sidebar (visible on lg screens >= 1024px)
 */
export function AppSidebar({ businessName }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card shrink-0 select-none">
      <SidebarNavContent businessName={businessName} />
    </aside>
  );
}

/**
 * Mobile Navigation Drawer (trigger button + Sheet drawer)
 */
export function MobileNavDrawer({ businessName }: SidebarProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <SidebarNavContent
          businessName={businessName}
          onItemClick={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
