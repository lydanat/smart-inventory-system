import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url()
    .refine((url) => !url.includes('/rest/v1'), {
      message: 'NEXT_PUBLIC_SUPABASE_URL must end at .supabase.co, not contain /rest/v1',
    }),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1, 'Publishable key is required'),
  
  // Server-only secrets
  SUPABASE_SECRET_KEY: z.string().min(1, 'Supabase secret key is required'),
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'Telegram bot token is required'),
  TELEGRAM_BOT_USERNAME: z.string().min(1, 'Telegram bot username is required'),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(16, 'Telegram webhook secret must be secure'),
  GEMINI_API_KEY: z.string().min(1, 'Gemini API key is required'),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  GEMINI_DAILY_BUDGET: z.coerce.number().default(200),
  CRON_SECRET: z.string().min(16, 'CRON secret must be secure'),
});

// For client-side bundles, only validate public keys
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

export function getEnv() {
  const isServer = typeof window === 'undefined';
  
  if (isServer) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      console.error('Invalid environment variables:', parsed.error.format());
      throw new Error(`Environment validation failed: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
    }
    return parsed.data;
  }

  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });

  if (!parsed.success) {
    console.error('Invalid public environment variables:', parsed.error.format());
    throw new Error('Public environment validation failed');
  }

  return parsed.data as z.infer<typeof envSchema>;
}

export const env = getEnv();
