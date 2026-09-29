import { z } from 'zod';

export const supplierFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Supplier name is required')
      .max(120, 'Supplier name must be 120 characters or fewer'),
    contactName: z
      .string()
      .trim()
      .max(120, 'Contact name must be 120 characters or fewer')
      .nullable()
      .optional()
      .transform((val) => (val === '' ? null : val)),
    phone: z
      .string()
      .trim()
      .max(40, 'Phone must be 40 characters or fewer')
      .nullable()
      .optional()
      .transform((val) => (val === '' ? null : val)),
    email: z
      .string()
      .trim()
      .email('Invalid email address')
      .nullable()
      .optional()
      .or(z.literal(''))
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

export type SupplierFormInput = z.infer<typeof supplierFormSchema>;
