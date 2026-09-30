'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export function ClientAuthRedirect() {
  const router = useRouter();

  React.useEffect(() => {
    // Check if URL has hash with access_token (from email Magic Link redirect)
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      const supabase = createClient();
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          router.replace('/dashboard');
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100/90 dark:bg-zinc-950">
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin text-foreground" />
        <span>Authenticating session...</span>
      </div>
    </div>
  );
}
