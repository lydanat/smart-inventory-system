import 'server-only';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { AppError, mapPostgresError } from '@/lib/errors';
import { logger } from '@/lib/logger';

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; fieldErrors?: Record<string, string[]> } };

export interface ActionContext {
  userId: string;
  businessId: string;
  role: 'owner' | 'manager' | 'staff';
  userEmail: string;
  supabase: Awaited<ReturnType<typeof createClient>>;
}

export interface ActionOptions<TSchema extends z.ZodTypeAny> {
  schema?: TSchema;
  requiredRole?: ('owner' | 'manager' | 'staff')[];
  rateLimitKey?: (ctx: { userId: string; businessId: string }) => string;
  maxRequestsPerMinute?: number;
}

export function withAuth<TSchema extends z.ZodTypeAny, TResult>(
  options: ActionOptions<TSchema>,
  handler: (input: z.infer<TSchema>, ctx: ActionContext) => Promise<TResult>
) {
  return async (rawInput?: unknown): Promise<ActionResult<TResult>> => {
    try {
      // 1. Verify user identity with the user client (RLS enforced)
      const supabase = await createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          ok: false,
          error: {
            code: 'UNAUTHENTICATED',
            message: 'You must be logged in to perform this action.',
          },
        };
      }

      // 2. Resolve user's active business and role
      const { data: member, error: memberError } = await supabase
        .from('business_members')
        .select('business_id, role')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (memberError || !member) {
        return {
          ok: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'No associated business organization found for your account.',
          },
        };
      }

      const role = member.role as 'owner' | 'manager' | 'staff';
      if (options.requiredRole && !options.requiredRole.includes(role)) {
        return {
          ok: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to perform this action.',
          },
        };
      }

      // 3. Server-side Rate Limiting (per user write limit: default 60 writes/min)
      const limitKey = options.rateLimitKey
        ? options.rateLimitKey({ userId: user.id, businessId: member.business_id })
        : `write:${user.id}`;
      const maxRequests = options.maxRequestsPerMinute ?? 60;
      
      const isAllowed = await checkRateLimit(limitKey, maxRequests, '1 minute');
      if (!isAllowed) {
        return {
          ok: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please slow down.',
          },
        };
      }

      // 4. Input validation with Zod .strict()
      let parsedInput = undefined as z.infer<TSchema>;
      if (options.schema) {
        const result = options.schema.safeParse(rawInput);
        if (!result.success) {
          const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[]>;
          return {
            ok: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid form or request data.',
              fieldErrors,
            },
          };
        }
        parsedInput = result.data;
      }

      // 5. Call business service with isolated context (business_id is NEVER from client)
      const ctx: ActionContext = {
        userId: user.id,
        businessId: member.business_id,
        role,
        userEmail: user.email || '',
        supabase,
      };

      const data = await handler(parsedInput, ctx);
      return { ok: true, data };
    } catch (err: unknown) {
      if (err instanceof AppError) {
        return {
          ok: false,
          error: {
            code: err.code,
            message: err.message,
            fieldErrors: err.fieldErrors,
          },
        };
      }

      const errorObj = err as { message?: string; stack?: string };
      logger.error('Unhandled action error', { message: errorObj?.message, stack: errorObj?.stack });
      const mapped = mapPostgresError(err);
      return {
        ok: false,
        error: {
          code: mapped.code,
          message: mapped.message,
        },
      };
    }
  };
}
