import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PackageX } from 'lucide-react';

export default function AppNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground mb-6">
        <PackageX className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">Item or Page Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-6 text-sm">
        The item or page you are looking for does not exist, has been archived, or belongs to another business.
      </p>
      <Button asChild>
        <Link href="/inventory">Back to Inventory</Link>
      </Button>
    </div>
  );
}
