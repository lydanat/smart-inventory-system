'use server';

import { z } from 'zod';
import { withAuth } from '@/lib/security/action-wrapper';
import { supplierFormSchema } from '@/lib/validation/supplier';
import {
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '@/lib/services/suppliers';
import { revalidatePath } from 'next/cache';

export const createSupplierAction = withAuth(
  {
    schema: supplierFormSchema,
    requiredRole: ['owner', 'manager'],
  },
  async (input, ctx) => {
    const supplier = await createSupplier(ctx.businessId, input);
    revalidatePath('/suppliers');
    revalidatePath('/inventory');
    return supplier;
  }
);

const updateSupplierSchema = supplierFormSchema.extend({
  id: z.string().uuid(),
});

export const updateSupplierAction = withAuth(
  {
    schema: updateSupplierSchema,
    requiredRole: ['owner', 'manager'],
  },
  async (input, ctx) => {
    const { id, ...data } = input;
    const supplier = await updateSupplier(ctx.businessId, id, data);
    revalidatePath('/suppliers');
    revalidatePath('/inventory');
    return supplier;
  }
);

const supplierIdSchema = z.object({
  id: z.string().uuid(),
}).strict();

export const deleteSupplierAction = withAuth(
  {
    schema: supplierIdSchema,
    requiredRole: ['owner', 'manager'],
  },
  async (input, ctx) => {
    const res = await deleteSupplier(ctx.businessId, input.id);
    revalidatePath('/suppliers');
    revalidatePath('/inventory');
    return res;
  }
);
