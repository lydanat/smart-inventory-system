'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supplierFormSchema, type SupplierFormInput } from '@/lib/validation/supplier';
import { createSupplierAction, updateSupplierAction } from '@/actions/suppliers';
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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SupplierData {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
}

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: SupplierData | null;
  onSuccess?: () => void;
}

export function SupplierDialog({
  open,
  onOpenChange,
  supplier,
  onSuccess,
}: SupplierDialogProps) {
  const isEditing = Boolean(supplier);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormInput>({
    resolver: zodResolver(supplierFormSchema) as any,
    defaultValues: {
      name: '',
      contactName: '',
      phone: '',
      email: '',
      notes: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      if (supplier) {
        reset({
          name: supplier.name,
          contactName: supplier.contact_name || '',
          phone: supplier.phone || '',
          email: supplier.email || '',
          notes: supplier.notes || '',
        });
      } else {
        reset({
          name: '',
          contactName: '',
          phone: '',
          email: '',
          notes: '',
        });
      }
    }
  }, [open, supplier, reset]);

  const onSubmit = async (data: SupplierFormInput) => {
    try {
      if (isEditing && supplier) {
        const res = await updateSupplierAction({ id: supplier.id, ...data });
        if (!res.ok) {
          toast.error(res.error.message);
          return;
        }
        toast.success(`Updated supplier "${data.name}"`);
      } else {
        const res = await createSupplierAction(data);
        if (!res.ok) {
          toast.error(res.error.message);
          return;
        }
        toast.success(`Created supplier "${data.name}"`);
      }

      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('An unexpected error occurred.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update supplier contact details and notes.'
                : 'Register a vendor or distributor for inventory restocking.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                Company / Supplier Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Acme Organic Distributing"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contactName">Contact Person</Label>
                <Input
                  id="contactName"
                  placeholder="e.g. John Doe"
                  {...register('contactName')}
                />
                {errors.contactName && (
                  <p className="text-xs text-destructive">{errors.contactName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 000-0000"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="orders@acmedistributing.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes / Terms / Lead Time</Label>
              <Textarea
                id="notes"
                placeholder="e.g. 2-day delivery lead time. Net 30 payment terms."
                rows={3}
                {...register('notes')}
              />
              {errors.notes && (
                <p className="text-xs text-destructive">{errors.notes.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="text-xs sm:text-sm">
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Supplier'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
