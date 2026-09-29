import { z } from 'zod';

export const testAlertSchema = z
  .object({
    message: z.string().trim().max(500).optional(),
  })
  .strict();

export const updateAlertSettingsSchema = z
  .object({
    alertsEnabled: z.boolean(),
  })
  .strict();

export type TestAlertInput = z.infer<typeof testAlertSchema>;
export type UpdateAlertSettingsInput = z.infer<typeof updateAlertSettingsSchema>;
