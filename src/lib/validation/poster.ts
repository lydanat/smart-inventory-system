import { z } from 'zod';

export const posterThemeEnum = z.enum([
  'modern-minimal',
  'bold-creative',
  'dark-luxury',
  'vibrant-editorial',
  'fresh-organic',
  'editorial-fresh',
]);

export const illustrationTypeEnum = z.enum([
  'grocery',
  'beverage',
  'bakery',
  'fresh',
  'general',
  'sale',
]);

export const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const posterDesignSchema = z.object({
  theme: posterThemeEnum.default('modern-minimal'),
  headline: z.string().min(1).max(140),
  subheadline: z.string().max(250).optional().default(''),
  badge: z.string().max(80).optional().default('SPECIAL OFFER'),
  category: z.string().max(100).optional().default('EXCLUSIVE DEAL'),
  accentColor: z.string().regex(hexColorRegex).default('#2563eb'),
  primaryColor: z.string().regex(hexColorRegex).default('#0f172a'),
  backgroundColor: z.string().regex(hexColorRegex).default('#ffffff'),
  secondaryBg: z.string().regex(hexColorRegex).default('#f8fafc'),
  textColor: z.string().regex(hexColorRegex).default('#0f172a'),
  mutedTextColor: z.string().regex(hexColorRegex).default('#64748b'),
  offerHighlight: z.string().max(200).optional().default(''),
  productDescription: z.string().max(400).optional().default(''),
  eventDates: z.string().max(120).optional().default('Limited Time Offer'),
  eventTime: z.string().max(120).optional().default('During Regular Business Hours'),
  location: z.string().max(160).optional().default('Available In-Store & Online'),
  contactDetails: z.string().max(160).optional().default('Contact us for details & orders'),
  callToAction: z.string().max(120).default('VISIT US TODAY'),
  finePrint: z.string().max(250).optional().default('*Terms & conditions apply. While supplies last.'),
  illustrationType: illustrationTypeEnum.default('general'),
});

export type PosterTheme = z.infer<typeof posterThemeEnum>;
export type IllustrationType = z.infer<typeof illustrationTypeEnum>;
export type PosterDesign = z.infer<typeof posterDesignSchema>;

export const generatePosterInputSchema = z.object({
  topic: z.string().min(1).max(200),
  targetItem: z.string().min(1).max(120),
  businessName: z.string().min(1).max(120),
  deal: z.string().max(300).optional().default(''),
  stylePreference: posterThemeEnum.optional(),
  currentValues: z.record(z.string(), z.string()).optional(),
}).strict();

export type GeneratePosterInput = z.infer<typeof generatePosterInputSchema>;

export const removeBackgroundInputSchema = z.object({
  imageData: z.string().min(10), // Base64 data URL or string
  tolerance: z.number().min(5).max(150).default(45),
}).strict();

export type RemoveBackgroundInput = z.infer<typeof removeBackgroundInputSchema>;

