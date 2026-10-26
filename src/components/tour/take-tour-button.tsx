'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

interface TakeTourButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export function TakeTourButton({
  className,
  variant = 'outline',
  size = 'sm',
  children,
}: TakeTourButtonProps) {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('open-system-tour'));
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className || 'gap-1.5 font-medium border-primary/30 text-primary hover:bg-primary/10 shadow-xs'}
      title="Start Interactive Guided Tour"
    >
      <Compass className="w-4 h-4 text-primary shrink-0" />
      <span>{children || 'Take a Tour'}</span>
    </Button>
  );
}
