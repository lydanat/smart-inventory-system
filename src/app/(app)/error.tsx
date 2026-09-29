'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function AppErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log non-sensitive client error to console
    console.error('App runtime error caught by boundary:', error.message);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="max-w-md w-full border border-destructive/20 shadow-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-bold">Something Went Wrong</CardTitle>
          <CardDescription className="text-sm">
            We encountered an unexpected error while loading this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-xs text-muted-foreground">
          {error.digest ? (
            <p className="font-mono bg-muted/40 p-2 rounded">
              Error ID: {error.digest}
            </p>
          ) : (
            <p>Please try refreshing the page or navigating back to your dashboard.</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => reset()} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/dashboard">
              <Home className="w-3.5 h-3.5" />
              Dashboard
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
