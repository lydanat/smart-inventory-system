import { z } from 'zod';

export const itemFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Item name is required')
      .max(200, 'Item name must be 200 characters or fewer'),
    sku: z
      .string()
      .trim()
      .max(64, 'SKU must be 64 characters or fewer')
      .nullable()
      .optional()
      .transform((val) => (val === '' ? null : val)),
    category: z
      .string()
      .trim()
      .min(1, 'Category is required')
      .max(80, 'Category must be 80 characters or fewer')
      .default('Uncategorized'),
    unit: z
      .string()
      .trim()
      .min(1, 'Unit is required')
      .max(20, 'Unit must be 20 characters or fewer')
      .default('pcs'),
    quantity: z.coerce
      .number()
      .int('Quantity must be an integer')
      .min(0, 'Quantity cannot be negative')
      .max(1000000, 'Quantity cannot exceed 1,000,000')
      .default(0),
    lowStockThreshold: z.coerce
      .number()
      .int('Threshold must be an integer')
      .min(0, 'Threshold cannot be negative')
      .max(1000000, 'Threshold cannot exceed 1,000,000')
      .default(5),
    costPrice: z.coerce
      .number()
      .min(0, 'Cost price cannot be negative')
      .max(1000000000, 'Cost price is too high')
      .nullable()
      .optional()
      .transform((val) => (val === undefined || isNaN(val as number) ? null : val)),
    price: z.coerce
      .number()
      .min(0, 'Price cannot be negative')
      .max(1000000000, 'Price is too high')
      .default(0),
    expiryDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expiry date must be in YYYY-MM-DD format')
      .nullable()
      .optional()
      .transform((val) => (val === '' ? null : val)),
    supplierId: z
      .string()
      .uuid('Invalid supplier ID')
      .nullable()
      .optional()
      .transform((val) => (val === '' ? null : val)),
    notes: z
      .string()
      .trim()
      .max(1000, 'Notes must be 1,000 characters or fewer')
      .nullable()
      .optional()
      .transform((val) => (val === '' ? null : val)),
  })
  .strict();

export type ItemFormInput = z.infer<typeof itemFormSchema>;

export const itemQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional().default(''),
    category: z.string().optional().default(''),
    status: z.enum(['all', 'low', 'out', 'expiring', 'expired']).default('all'),
    sortBy: z.enum(['name', 'quantity', 'price', 'expiry_date', 'created_at']).default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict();

export type ItemQueryInput = z.infer<typeof itemQuerySchema>;
