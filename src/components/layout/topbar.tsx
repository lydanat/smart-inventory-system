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
    <header className="h-14 sm:h-16 border-b border-border/80 bg-background/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 w-full max-w-full overflow-hidden">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
        {/* Mobile menu drawer trigger */}
        <div className="lg:hidden shrink-0">
          <MobileNavDrawer businessName={businessName} />
        </div>
        <h1 className="text-sm sm:text-base lg:text-lg font-semibold tracking-tight text-foreground truncate min-w-0">
          {currentTitle}
        </h1>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <ThemeToggle />
        <UserMenu businessName={businessName} email={email} role={role} />
      </div>
    </header>
  );
}
