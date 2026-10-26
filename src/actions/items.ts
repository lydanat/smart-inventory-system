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
import { createClient } from '@/lib/supabase/server';
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

const importItemsSchema = z
  .object({
    items: z
      .array(
        z.object({
          name: z.string().trim().min(1, 'Name is required').max(200),
          sku: z.string().trim().max(64).nullable().optional(),
          category: z.string().trim().min(1).max(80).default('Uncategorized'),
          unit: z.string().trim().min(1).max(20).default('pcs'),
          quantity: z.number().int().min(0, 'Quantity cannot be negative').default(0),
          lowStockThreshold: z.number().int().min(0).default(5),
          price: z.number().min(0).default(0),
          costPrice: z.number().min(0).nullable().optional(),
          expiryDate: z.string().nullable().optional(),
          notes: z.string().max(1000).nullable().optional(),
        })
      )
      .min(1, 'At least 1 product is required for import')
      .max(500, 'Maximum 500 products per import'),
  })
  .strict();

export const importProductsAction = withAuth(
  {
    schema: importItemsSchema,
    requiredRole: ['owner', 'manager', 'staff'],
  },
  async (input, ctx) => {
    const supabase = await createClient();

    const insertPayload = input.items.map((item) => ({
      business_id: ctx.businessId,
      name: item.name,
      sku: item.sku || null,
      category: item.category || 'Uncategorized',
      unit: item.unit || 'pcs',
      quantity: item.quantity,
      low_stock_threshold: item.lowStockThreshold,
      price: item.price,
      cost_price: item.costPrice || null,
      expiry_date: item.expiryDate || null,
      notes: item.notes || null,
    }));

    const { data, error } = await supabase
      .from('items')
      .insert(insertPayload)
      .select('id, name, quantity');

    if (error) {
      throw new Error(error.message || 'Failed to import products');
    }

    // Insert initial stock movements for items with quantity > 0
    const movements = (data || [])
      .filter((i) => i.quantity > 0)
      .map((i) => ({
        business_id: ctx.businessId,
        item_id: i.id,
        delta: i.quantity,
        reason: 'initial' as const,
        note: 'Imported via spreadsheet',
        created_by: ctx.userId,
      }));

    if (movements.length > 0) {
      await supabase.from('stock_movements').insert(movements);
    }

    revalidatePath('/inventory');
    revalidatePath('/dashboard');

    return {
      success: true,
      count: data?.length || 0,
    };
  }
);

