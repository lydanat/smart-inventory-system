'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adjustStockSchema, type AdjustStockInput } from '@/lib/validation/stock';
import { adjustStockAction } from '@/actions/stock';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface StockAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
  } | null;
  defaultDelta?: number;
  defaultReason?: 'sale' | 'restock' | 'adjustment' | 'expired' | 'damaged';
  onSuccess?: () => void;
}

export function StockAdjustDialog({
  open,
  onOpenChange,
  item,
  defaultDelta,
  defaultReason = 'restock',
  onSuccess,
}: StockAdjustDialogProps) {
  const [isPending, startTransition] = React.useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: {
      itemId: item?.id || '',
      delta: defaultDelta || 1,
      reason: defaultReason,
      note: '',
    },
  });

  React.useEffect(() => {
    if (item && open) {
      reset({
        itemId: item.id,
        delta: defaultDelta !== undefined ? defaultDelta : (defaultReason === 'sale' ? -1 : 1),
        reason: defaultReason,
        note: '',
      });
    }
  }, [item, open, defaultDelta, defaultReason, reset]);

  const currentDelta = watch('delta') || 0;
  const newProjectedQuantity = (item?.quantity || 0) + Number(currentDelta);

  const onSubmit = (data: AdjustStockInput) => {
    startTransition(async () => {
      const res = await adjustStockAction(data);
      if (!res.ok) {
        toast.error(res.error.message);
      } else {
        toast.success(
          `Stock updated for ${item?.name}: ${data.delta > 0 ? '+' : ''}${data.delta} ${item?.unit}`
        );
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }
    });
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock Level</DialogTitle>
          <DialogDescription>
            Record inventory changes for <strong className="text-foreground">{item.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Current & Projected Preview */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border text-center">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Current Stock
              </p>
              <p className="text-xl font-bold text-foreground">
                {item.quantity} <span className="text-xs font-normal text-muted-foreground">{item.unit}</span>
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                New Projected Stock
              </p>
              <p
                className={`text-xl font-bold ${
                  newProjectedQuantity < 0 ? 'text-destructive' : 'text-primary'
                }`}
              >
                {newProjectedQuantity}{' '}
                <span className="text-xs font-normal text-muted-foreground">{item.unit}</span>
              </p>
            </div>
          </div>

          {/* Quick Buttons for Delta */}
          <div className="space-y-1.5">
            <Label htmlFor="delta">Quantity Adjustment (+ or -)</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => {
                  const val = Number(currentDelta) - 1;
                  setValue('delta', val, { shouldValidate: true });
                }}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="delta"
                type="number"
                disabled={isPending}
                className="text-center font-bold text-base"
                {...register('delta', { valueAsNumber: true })}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => {
                  const val = Number(currentDelta) + 1;
                  setValue('delta', val, { shouldValidate: true });
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {errors.delta && (
              <p className="text-xs text-destructive font-medium">{errors.delta.message}</p>
            )}
            {newProjectedQuantity < 0 && (
              <p className="text-xs text-destructive font-medium">
                Stock cannot go below 0 units.
              </p>
            )}
          </div>

          {/* Reason Select */}
          <div className="space-y-1.5">
            <Label htmlFor="reason">Adjustment Reason</Label>
            <Select
              defaultValue={defaultReason}
              onValueChange={(val: AdjustStockInput['reason']) =>
                setValue('reason', val, { shouldValidate: true })
              }
            >
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">Sale (Sold to customer)</SelectItem>
                <SelectItem value="restock">Restock (Received shipment)</SelectItem>
                <SelectItem value="adjustment">Count Adjustment (Stocktake audit)</SelectItem>
                <SelectItem value="expired">Expired (Written off)</SelectItem>
                <SelectItem value="damaged">Damaged (Spoiled/Broken)</SelectItem>
              </SelectContent>
            </Select>
            {errors.reason && (
              <p className="text-xs text-destructive font-medium">{errors.reason.message}</p>
            )}
          </div>

          {/* Optional Note */}
          <div className="space-y-1.5">
            <Label htmlFor="note">Reference Note (Optional)</Label>
            <Input
              id="note"
              placeholder="e.g. Invoice #1042 or register discrepancy"
              disabled={isPending}
              {...register('note')}
            />
            {errors.note && (
              <p className="text-xs text-destructive font-medium">{errors.note.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || newProjectedQuantity < 0 || currentDelta === 0}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Adjustment'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
