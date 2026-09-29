import { z } from 'zod';

export const adjustStockSchema = z
  .object({
    itemId: z.string().uuid('Invalid item ID'),
    delta: z.coerce.number().int().refine((val) => val !== 0, {
      message: 'Stock adjustment delta cannot be 0',
    }),
    reason: z.enum(['sale', 'restock', 'adjustment', 'expired', 'damaged', 'initial'], {
      message: 'Invalid adjustment reason',
    }),
    note: z
      .string()
      .trim()
      .max(300, 'Note must be 300 characters or fewer')
      .nullable()
      .optional()
      .transform((val) => (val === '' ? null : val)),
  })
  .strict();

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
