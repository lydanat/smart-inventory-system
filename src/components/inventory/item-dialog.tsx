'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { itemFormSchema, type ItemFormInput } from '@/lib/validation/item';
import { createItemAction, updateItemAction } from '@/actions/items';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

export interface ItemDialogItem {
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

export interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ItemDialogItem | null;
  suppliers: SupplierOption[];
  onSuccess?: () => void;
}

export function ItemDialog({
  open,
  onOpenChange,
  item,
  suppliers,
  onSuccess,
}: ItemDialogProps) {
  const isEditing = Boolean(item?.id);
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(itemFormSchema) as any,
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
          costPrice: null as number | null,
          price: 0,
          expiryDate: null as string | null,
          supplierId: null as string | null,
          notes: null as string | null,
        });
      }
    }
  }, [open, item, reset]);

  const onSubmit = (data: any) => {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold">
              {isEditing ? 'Edit Item' : 'Add New Item'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isEditing
                ? 'Update product details and stock thresholds.'
                : 'Add a new product to your store inventory.'}
            </DialogDescription>
          </DialogHeader>

          {/* Hidden price inputs (per user instruction) */}
          <input type="hidden" {...register('price', { valueAsNumber: true })} />
          <input type="hidden" {...register('costPrice', { valueAsNumber: true })} />

          <div className="space-y-3.5 py-3">
            {/* Product Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Whole Grain Wheat Bread 500g"
                disabled={isPending}
                className="rounded-lg"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* SKU and Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="sku" className="text-xs font-medium">SKU / Barcode</Label>
                <Input
                  id="sku"
                  placeholder="e.g. BRD-001"
                  disabled={isPending}
                  className="rounded-lg"
                  {...register('sku')}
                />
                {errors.sku && (
                  <p className="text-xs text-destructive font-medium">{errors.sku.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unit" className="text-xs font-medium">Unit</Label>
                <Input
                  id="unit"
                  placeholder="pcs, bottles, kg"
                  disabled={isPending}
                  className="rounded-lg"
                  {...register('unit')}
                />
                {errors.unit && (
                  <p className="text-xs text-destructive font-medium">{errors.unit.message}</p>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs font-medium">Category</Label>
              <Input
                id="category"
                placeholder="e.g. Bakery, Beverages, Dairy"
                disabled={isPending}
                className="rounded-lg"
                {...register('category')}
              />
              {errors.category && (
                <p className="text-xs text-destructive font-medium">{errors.category.message}</p>
              )}
            </div>

            {/* Stock Levels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="quantity" className="text-xs font-medium">
                  {isEditing ? 'Current Quantity' : 'Starting Quantity'}{' '}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min={0}
                  disabled={isPending || isEditing}
                  className="rounded-lg"
                  {...register('quantity', { valueAsNumber: true })}
                />
                {isEditing && (
                  <p className="text-[11px] text-muted-foreground">
                    Use quick adjust to modify existing stock.
                  </p>
                )}
                {errors.quantity && (
                  <p className="text-xs text-destructive font-medium">{errors.quantity.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lowStockThreshold" className="text-xs font-medium">Low Stock Alert at</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  min={0}
                  disabled={isPending}
                  className="rounded-lg"
                  {...register('lowStockThreshold', { valueAsNumber: true })}
                />
                {errors.lowStockThreshold && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.lowStockThreshold.message}
                  </p>
                )}
              </div>
            </div>

            {/* Supplier */}
            <div className="space-y-1.5">
              <Label htmlFor="supplierId" className="text-xs font-medium">Linked Supplier</Label>
              <Select
                defaultValue={item?.supplier_id || undefined}
                onValueChange={(val) =>
                  setValue('supplierId', val === 'none' ? null : val, { shouldValidate: true })
                }
              >
                <SelectTrigger id="supplierId" className="rounded-lg">
                  <SelectValue placeholder="Select supplier (optional)" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="none">None / No supplier</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expiry Date */}
            <div className="space-y-1.5">
              <Label htmlFor="expiryDate" className="text-xs font-medium">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                disabled={isPending}
                className="rounded-lg"
                {...register('expiryDate')}
              />
              {errors.expiryDate && (
                <p className="text-xs text-destructive font-medium">{errors.expiryDate.message}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-medium">Notes / Storage Instructions</Label>
              <Textarea
                id="notes"
                placeholder="e.g. Keep refrigerated at 4°C. Aisle 3 Shelf B."
                disabled={isPending}
                rows={2}
                className="rounded-lg"
                {...register('notes')}
              />
              {errors.notes && (
                <p className="text-xs text-destructive font-medium">{errors.notes.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-xs sm:text-sm rounded-lg"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="text-xs sm:text-sm font-semibold rounded-lg">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Backwards compatibility alias
export const ItemSheet = ItemDialog;
export type ItemSheetItem = ItemDialogItem;
export type ItemSheetProps = ItemDialogProps;
