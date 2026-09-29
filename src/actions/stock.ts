'use server';

import { withAuth } from '@/lib/security/action-wrapper';
import { adjustStockSchema } from '@/lib/validation/stock';
import { AppError } from '@/lib/errors';
import { revalidatePath } from 'next/cache';

export const adjustStockAction = withAuth(
  {
    schema: adjustStockSchema,
    requiredRole: ['owner', 'manager', 'staff'],
  },
  async (input, ctx) => {
    // Call the atomic database RPC adjust_stock
    const { data, error } = await ctx.supabase.rpc('adjust_stock', {
      _item_id: input.itemId,
      _delta: input.delta,
      _reason: input.reason,
      _note: input.note || null,
    });

    if (error) {
      if (error.code === '23514' || error.message.includes('check constraint')) {
        throw new AppError('Cannot reduce stock below 0.', 'BAD_REQUEST', 400);
      }
      if (error.code === 'P0002' || error.message === 'item_not_found') {
        throw new AppError('Item not found.', 'NOT_FOUND', 404);
      }
      throw error;
    }

    revalidatePath('/inventory');
    revalidatePath(`/inventory/${input.itemId}`);
    revalidatePath('/dashboard');
    return data;
  }
);
