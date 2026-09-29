'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { StatusBadge } from '@/components/inventory/status-badge';
import { StockAdjustDialog } from '@/components/inventory/stock-adjust-dialog';
import { ItemSheet } from '@/components/inventory/item-sheet';
import { archiveItemAction, restoreItemAction } from '@/actions/items';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  MoreHorizontal,
  PlusCircle,
  Archive,
  Edit,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';

interface Item {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  unit: string;
  quantity: number;
  low_stock_threshold: number;
  price: number;
  cost_price: number | null;
  expiry_date: string | null;
  supplier_id: string | null;
  suppliers?: { id: string; name: string } | null;
}

interface ItemsTableProps {
  items: Item[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  categories: string[];
  suppliers: { id: string; name: string }[];
}

export function ItemsTable({
  items,
  totalCount,
  page,
  totalPages,
  categories,
  suppliers,
}: ItemsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get('search') || '');
  const [selectedStatus, setSelectedStatus] = React.useState(searchParams.get('status') || 'all');
  const [selectedCategory, setSelectedCategory] = React.useState(searchParams.get('category') || 'all');

  // Sheet & Dialog state
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<Item | null>(null);

  const [adjustDialogOpen, setAdjustDialogOpen] = React.useState(false);
  const [adjustingItem, setAdjustingItem] = React.useState<Item | null>(null);
  const [adjustDelta, setAdjustDelta] = React.useState<number>(1);
  const [adjustReason, setAdjustReason] = React.useState<'sale' | 'restock' | 'adjustment'>('restock');

  // Keyboard shortcut: '/' focuses search input
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !sheetOpen && !adjustDialogOpen) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sheetOpen, adjustDialogOpen]);

  const updateFilters = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === '' || (key === 'status' && value === 'all') || (key === 'category' && value === 'all')) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    }
    newParams.set('page', '1'); // reset page on filter change
    router.push(`/inventory?${newParams.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm });
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', newPage.toString());
    router.push(`/inventory?${newParams.toString()}`);
  };

  const handleArchive = async (item: Item) => {
    const res = await archiveItemAction({ id: item.id });
    if (!res.ok) {
      toast.error(res.error.message);
    } else {
      toast(`Archived "${item.name}"`, {
        action: {
          label: 'Undo',
          onClick: async () => {
            const restoreRes = await restoreItemAction({ id: item.id });
            if (!restoreRes.ok) {
              toast.error(restoreRes.error.message);
            } else {
              toast.success(`Restored "${item.name}"`);
            }
          },
        },
      });
    }
  };

  const openAdjust = (item: Item, delta: number, reason: 'sale' | 'restock') => {
    setAdjustingItem(item);
    setAdjustDelta(delta);
    setAdjustReason(reason);
    setAdjustDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search items or SKU... (Press '/' to focus)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-14 h-9"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            /
          </kbd>
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onValueChange={(val) => {
              setSelectedStatus(val);
              updateFilters({ status: val });
            }}
          >
            <SelectTrigger className="h-9 w-[130px] sm:w-[135px] text-xs font-medium" aria-label="Filter by status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
              <SelectItem value="expiring">Expiring Soon (7d)</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select
            value={selectedCategory}
            onValueChange={(val) => {
              setSelectedCategory(val);
              updateFilters({ category: val });
            }}
          >
            <SelectTrigger className="h-9 w-[130px] sm:w-[145px] text-xs font-medium" aria-label="Filter by category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Add Item Button */}
          <Button
            onClick={() => {
              setEditingItem(null);
              setSheetOpen(true);
            }}
            size="sm"
            className="gap-1.5 h-9 font-semibold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Item</span>
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="rounded-xl border bg-card shadow-xs">
          <CardContent className="h-44 flex flex-col items-center justify-center text-muted-foreground space-y-2 p-6 text-center">
            <p className="text-base font-medium">No items found matching your filters</p>
            <p className="text-xs">Try clearing filters or adding a new product.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Main Table for Desktop (>640px) */}
          <div className="hidden sm:block rounded-xl border bg-card shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[30%]">Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <Link
                          href={`/inventory/${item.id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors truncate max-w-[240px]"
                        >
                          {item.name}
                        </Link>
                        {item.sku && (
                          <span className="text-[11px] font-mono text-muted-foreground">
                            SKU: {item.sku}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {item.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {item.quantity} <span className="text-xs text-muted-foreground font-normal">{item.unit}</span>
                        </span>
                        {/* Inline quick adjust +/- buttons */}
                        <div className="inline-flex rounded-md shadow-xs -space-x-px">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-r-none text-muted-foreground hover:text-foreground"
                            title="Record 1 unit sold"
                            disabled={item.quantity <= 0}
                            onClick={() => openAdjust(item, -1, 'sale')}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-l-none text-muted-foreground hover:text-foreground"
                            title="Restock 5 units"
                            onClick={() => openAdjust(item, 5, 'restock')}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{formatCurrency(item.price)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {item.expiry_date ? formatDate(item.expiry_date) : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        quantity={item.quantity}
                        lowStockThreshold={item.low_stock_threshold}
                        expiryDate={item.expiry_date}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Item Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/inventory/${item.id}`} className="cursor-pointer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openAdjust(item, 10, 'restock')}
                            className="cursor-pointer"
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            <span>Quick Restock</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingItem(item);
                              setSheetOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleArchive(item)}
                            className="text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Archive className="mr-2 h-4 w-4" />
                            <span>Archive Item</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Stacked Cards for Mobile (<640px) */}
          <div className="sm:hidden space-y-3">
            {items.map((item) => (
            <Card key={item.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/inventory/${item.id}`}
                    className="font-semibold text-foreground hover:underline block truncate text-base"
                  >
                    {item.name}
                  </Link>
                  {item.sku && (
                    <span className="text-xs text-muted-foreground font-mono">
                      SKU: {item.sku}
                    </span>
                  )}
                </div>
                <StatusBadge
                  quantity={item.quantity}
                  lowStockThreshold={item.low_stock_threshold}
                  expiryDate={item.expiry_date}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-y py-2.5">
                <div>
                  <span className="text-muted-foreground">Category:</span>{' '}
                  <span className="font-medium text-foreground">{item.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Price:</span>{' '}
                  <span className="font-semibold text-foreground">
                    {formatCurrency(item.price)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Stock:</span>{' '}
                  <span className="font-bold text-foreground">
                    {item.quantity} {item.unit}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Expiry:</span>{' '}
                  <span className="font-medium text-foreground">
                    {item.expiry_date ? formatDate(item.expiry_date) : '-'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 text-xs"
                    disabled={item.quantity <= 0}
                    onClick={() => openAdjust(item, -1, 'sale')}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Sale (-1)</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 text-xs"
                    onClick={() => openAdjust(item, 5, 'restock')}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Restock (+5)</span>
                  </Button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/inventory/${item.id}`}>View Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingItem(item);
                        setSheetOpen(true);
                      }}
                    >
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleArchive(item)}
                      className="text-destructive"
                    >
                      Archive Item
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      </>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium text-foreground">{items.length}</span> of{' '}
            <span className="font-medium text-foreground">{totalCount}</span> items
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>
            <span className="text-xs text-muted-foreground font-medium">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>
        </div>
      )}

      {/* Item Form Sheet (Add / Edit) */}
      <ItemSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        item={editingItem}
        suppliers={suppliers}
        onSuccess={() => router.refresh()}
      />

      {/* Stock Adjust Dialog */}
      <StockAdjustDialog
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
        item={adjustingItem}
        defaultDelta={adjustDelta}
        defaultReason={adjustReason}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
