'use server';

import { z } from 'zod';
import { withAuth } from '@/lib/security/action-wrapper';
import { revalidatePath } from 'next/cache';
import { AppError } from '@/lib/errors';

const settingsSchema = z.object({
  name: z.string().trim().min(2, 'Store name must be at least 2 characters').max(60),
  currency: z.string().trim().min(1).max(5),
  timezone: z.string().trim().min(1).max(50),
}).strict();

export const updateStoreSettingsAction = withAuth(
  {
    schema: settingsSchema,
    requiredRole: ['owner', 'manager'],
  },
  async (input, ctx) => {
    const { data, error } = await ctx.supabase
      .from('businesses')
      .update({
        name: input.name,
        currency: input.currency.toUpperCase(),
        timezone: input.timezone,
      })
      .eq('id', ctx.businessId)
      .select()
      .single();

    if (error || !data) {
      throw error || new AppError('Failed to update store settings', 'BAD_REQUEST', 400);
    }

    revalidatePath('/settings');
    revalidatePath('/dashboard');
    revalidatePath('/inventory');
    return data;
  }
);
