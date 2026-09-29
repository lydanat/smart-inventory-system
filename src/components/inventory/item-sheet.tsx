'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { itemFormSchema, type ItemFormInput } from '@/lib/validation/item';
import { createItemAction, updateItemAction } from '@/actions/items';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SupplierOption {
  id: string;
  name: string;
}

export interface ItemSheetItem {
  id?: string;
  name?: string;
  sku?: string | null;
  category?: string;
  unit?: string;
  quantity?: number;
  low_stock_threshold?: number;
  cost_price?: number | null;
  price?: number;
  expiry_date?: string | null;
  supplier_id?: string | null;
  notes?: string | null;
}

interface ItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ItemSheetItem | null;
  suppliers: SupplierOption[];
  onSuccess?: () => void;
}

export function ItemSheet({
  open,
  onOpenChange,
  item,
  suppliers,
  onSuccess,
}: ItemSheetProps) {
  const isEditing = Boolean(item?.id);
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: '',
      sku: '',
      category: 'Uncategorized',
      unit: 'pcs',
      quantity: 0,
      lowStockThreshold: 5,
      costPrice: null as number | null,
      price: 0,
      expiryDate: null as string | null,
      supplierId: null as string | null,
      notes: null as string | null,
    },
  });

  React.useEffect(() => {
    if (open) {
      if (item) {
        reset({
          name: item.name || '',
          sku: item.sku || '',
          category: item.category || 'Uncategorized',
          unit: item.unit || 'pcs',
          quantity: item.quantity ?? 0,
          lowStockThreshold: item.low_stock_threshold ?? 5,
          costPrice: item.cost_price ? Number(item.cost_price) : null,
          price: item.price ? Number(item.price) : 0,
          expiryDate: item.expiry_date || null,
          supplierId: item.supplier_id || null,
          notes: item.notes || null,
        });
      } else {
        reset({
          name: '',
          sku: '',
          category: 'Uncategorized',
          unit: 'pcs',
          quantity: 0,
          lowStockThreshold: 5,
          costPrice: null,
          price: 0,
          expiryDate: null,
          supplierId: null,
          notes: null,
        });
      }
    }
  }, [open, item, reset]);

  const onSubmit = (data: ItemFormInput) => {
    startTransition(async () => {
      if (isEditing && item?.id) {
        const res = await updateItemAction({ ...data, id: item.id });
        if (!res.ok) {
          toast.error(res.error.message);
        } else {
          toast.success(`Updated "${data.name}"`);
          onOpenChange(false);
          if (onSuccess) onSuccess();
        }
      } else {
        const res = await createItemAction(data);
        if (!res.ok) {
          toast.error(res.error.message);
        } else {
          toast.success(`Added "${data.name}" to inventory`);
          onOpenChange(false);
          if (onSuccess) onSuccess();
        }
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col h-full overflow-hidden p-0 sm:max-w-lg">
        <SheetHeader className="p-6 pb-4 border-b border-border/80">
          <SheetTitle className="text-xl font-bold">
            {isEditing ? 'Edit Item' : 'Add New Item'}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update product details and stock thresholds.'
              : 'Add a new product to your store inventory.'}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 flex flex-col justify-between overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Section 1: Basic Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
                Basic Information
              </h4>

              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Whole Grain Wheat Bread 500g"
                  disabled={isPending}
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sku">SKU / Barcode</Label>
                  <Input
                    id="sku"
                    placeholder="e.g. BRD-001"
                    disabled={isPending}
                    {...register('sku')}
                  />
                  {errors.sku && (
                    <p className="text-xs text-destructive font-medium">{errors.sku.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    placeholder="pcs, bottles, kg"
                    disabled={isPending}
                    {...register('unit')}
                  />
                  {errors.unit && (
                    <p className="text-xs text-destructive font-medium">{errors.unit.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g. Bakery, Beverages, Dairy"
                  disabled={isPending}
                  {...register('category')}
                />
                {errors.category && (
                  <p className="text-xs text-destructive font-medium">{errors.category.message}</p>
                )}
              </div>
            </div>

            {/* Section 2: Stock & Pricing */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
                Stock & Pricing
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="quantity">
                    {isEditing ? 'Current Quantity' : 'Starting Quantity'}{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={0}
                    disabled={isPending || isEditing}
                    {...register('quantity', { valueAsNumber: true })}
                  />
                  {isEditing && (
                    <p className="text-[11px] text-muted-foreground">
                      Use the quick adjust action to change stock.
                    </p>
                  )}
                  {errors.quantity && (
                    <p className="text-xs text-destructive font-medium">{errors.quantity.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lowStockThreshold">Low Stock Alert at</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    min={0}
                    disabled={isPending}
                    {...register('lowStockThreshold', { valueAsNumber: true })}
                  />
                  {errors.lowStockThreshold && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.lowStockThreshold.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="costPrice">Cost Price ($)</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0.00"
                    disabled={isPending}
                    {...register('costPrice', { valueAsNumber: true })}
                  />
                  {errors.costPrice && (
                    <p className="text-xs text-destructive font-medium">{errors.costPrice.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="price">
                    Selling Price ($) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="0.00"
                    disabled={isPending}
                    {...register('price', { valueAsNumber: true })}
                  />
                  {errors.price && (
                    <p className="text-xs text-destructive font-medium">{errors.price.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Expiry & Supplier */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
                Supplier & Expiry
              </h4>

              <div className="space-y-1.5">
                <Label htmlFor="supplierId">Linked Supplier</Label>
                <Select
                  defaultValue={item?.supplier_id || undefined}
                  onValueChange={(val) =>
                    setValue('supplierId', val === 'none' ? null : val, { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="supplierId">
                    <SelectValue placeholder="Select supplier (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None / No supplier</SelectItem>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  disabled={isPending}
                  {...register('expiryDate')}
                />
                {errors.expiryDate && (
                  <p className="text-xs text-destructive font-medium">{errors.expiryDate.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes / Storage Instructions</Label>
                <Textarea
                  id="notes"
                  placeholder="e.g. Keep refrigerated at 4°C. Aisle 3 Shelf B."
                  disabled={isPending}
                  rows={2}
                  {...register('notes')}
                />
                {errors.notes && (
                  <p className="text-xs text-destructive font-medium">{errors.notes.message}</p>
                )}
              </div>
            </div>
          </div>

          <SheetFooter className="p-4 border-t border-border/80 bg-background/95 backdrop-blur">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="font-semibold">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Add Item'
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
