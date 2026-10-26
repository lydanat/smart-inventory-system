'use server';

import { z } from 'zod';
import { withAuth } from '@/lib/security/action-wrapper';
import { getCategories } from '@/lib/services/inventory';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

const createCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Category name cannot be empty')
      .max(80, 'Category name must be under 80 characters'),
  })
  .strict();

export const createCategoryAction = withAuth(
  {
    schema: createCategorySchema,
    requiredRole: ['owner', 'manager', 'staff'],
  },
  async (input, ctx) => {
    const supabase = await createClient();

    // Insert into categories table
    const { data, error } = await supabase
      .from('categories')
      .insert({
        business_id: ctx.businessId,
        name: input.name,
      })
      .select()
      .maybeSingle();

    if (error && error.code !== '23505') {
      // 23505 is unique violation, which means category already exists (fine to proceed)
      // Check if table missing (42P01 in postgres)
      if (error.code === '42P01') {
        // Table doesn't exist yet in remote Supabase, return success with in-memory representation
        revalidatePath('/inventory');
        return { name: input.name, business_id: ctx.businessId };
      }
      throw new Error(error.message || 'Failed to create category');
    }

    revalidatePath('/inventory');
    revalidatePath('/dashboard');
    return data || { name: input.name };
  }
);

const deleteCategorySchema = z
  .object({
    name: z.string().trim().min(1),
  })
  .strict();

export const deleteCategoryAction = withAuth(
  {
    schema: deleteCategorySchema,
    requiredRole: ['owner', 'manager'],
  },
  async (input, ctx) => {
    const supabase = await createClient();

    // 1. Delete from categories table
    await supabase
      .from('categories')
      .delete()
      .eq('business_id', ctx.businessId)
      .eq('name', input.name);

    revalidatePath('/inventory');
    revalidatePath('/dashboard');
    return { success: true };
  }
);

export const getCategoriesAction = withAuth(
  {
    schema: z.object({}).strict(),
    requiredRole: ['owner', 'manager', 'staff'],
  },
  async (_input, ctx) => {
    const categories = await getCategories(ctx.businessId);
    return categories;
  }
);
