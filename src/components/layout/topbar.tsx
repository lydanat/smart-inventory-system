'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { UserMenu } from '@/components/layout/user-menu';
import { MobileNavDrawer } from '@/components/layout/app-sidebar';

interface TopbarProps {
  businessName: string;
  email: string;
  role: string;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard Overview',
  '/inventory': 'Inventory Catalogue',
  '/suppliers': 'Suppliers Directory',
  '/alerts': 'Telegram Alerts & Settings',
  '/settings': 'Store Settings',
};

export function Topbar({ businessName, email, role }: TopbarProps) {
  const pathname = usePathname();
  
  // Find matching title or default
  let currentTitle = 'Smart Inventory';
  for (const [route, title] of Object.entries(pageTitles)) {
    if (pathname === route || (route !== '/dashboard' && pathname.startsWith(route))) {
      currentTitle = title;
      break;
    }
  }

  return (
    <header className="h-16 border-b border-border/80 bg-background/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu drawer trigger */}
        <div className="lg:hidden">
          <MobileNavDrawer businessName={businessName} />
        </div>
        <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground truncate">
          {currentTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <UserMenu businessName={businessName} email={email} role={role} />
      </div>
    </header>
  );
}
