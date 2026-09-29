'use server';

import { z } from 'zod';
import { withAuth } from '@/lib/security/action-wrapper';
import { itemFormSchema } from '@/lib/validation/item';
import {
  createItem,
  updateItem,
  archiveItem,
  restoreItem,
} from '@/lib/services/inventory';
import { revalidatePath } from 'next/cache';

export const createItemAction = withAuth(
  {
    schema: itemFormSchema,
    requiredRole: ['owner', 'manager', 'staff'],
  },
  async (input, ctx) => {
    const item = await createItem(ctx.businessId, ctx.userId, input);
    revalidatePath('/inventory');
    revalidatePath('/dashboard');
    return item;
  }
);

const updateItemSchema = itemFormSchema.extend({
  id: z.string().uuid(),
});

export const updateItemAction = withAuth(
  {
    schema: updateItemSchema,
    requiredRole: ['owner', 'manager', 'staff'],
  },
  async (input, ctx) => {
    const { id, ...data } = input;
    const item = await updateItem(ctx.businessId, id, data);
    revalidatePath('/inventory');
    revalidatePath(`/inventory/${id}`);
    revalidatePath('/dashboard');
    return item;
  }
);

const itemIdSchema = z.object({
  id: z.string().uuid(),
}).strict();

export const archiveItemAction = withAuth(
  {
    schema: itemIdSchema,
    requiredRole: ['owner', 'manager'],
  },
  async (input, ctx) => {
    const item = await archiveItem(ctx.businessId, input.id);
    revalidatePath('/inventory');
    revalidatePath(`/inventory/${input.id}`);
    revalidatePath('/dashboard');
    return item;
  }
);

export const restoreItemAction = withAuth(
  {
    schema: itemIdSchema,
    requiredRole: ['owner', 'manager'],
  },
  async (input, ctx) => {
    const item = await restoreItem(ctx.businessId, input.id);
    revalidatePath('/inventory');
    revalidatePath(`/inventory/${input.id}`);
    revalidatePath('/dashboard');
    return item;
  }
);
