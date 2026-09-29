'use client';

import * as React from 'react';
import { signOutAction } from '@/actions/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, LogOut, User as UserIcon } from 'lucide-react';

interface UserMenuProps {
  businessName: string;
  email: string;
  role: string;
}

export function UserMenu({ businessName, email, role }: UserMenuProps) {
  const [isPending, startTransition] = React.useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 sm:h-9 gap-1.5 sm:gap-2 px-2 sm:px-3 border-border/80 shrink-0">
          <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground shrink-0" />
          <span className="font-medium text-xs max-w-[70px] sm:max-w-[120px] truncate">{businessName}</span>
          <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] px-1 py-0 uppercase font-semibold">
            {role}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">{businessName}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/settings" className="cursor-pointer">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Store Settings</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isPending}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isPending ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
