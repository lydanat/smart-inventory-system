'use server';

import { z } from 'zod';
import { withAuth } from '@/lib/security/action-wrapper';
import {
  getOrGenerateRecommendations,
  recordAIFeedback,
} from '@/lib/services/ai';
import { revalidatePath } from 'next/cache';

const refreshSchema = z.object({
  forceRefresh: z.boolean().optional(),
}).strict();

export const refreshRecommendationsAction = withAuth(
  {
    schema: refreshSchema,
    requiredRole: ['owner', 'manager', 'staff'],
  },
  async (input, ctx) => {
    const res = await getOrGenerateRecommendations(ctx.businessId, {
      forceRefresh: input.forceRefresh,
    });
    revalidatePath('/dashboard');
    return res;
  }
);

const feedbackSchema = z.object({
  recommendationId: z.number().int().positive(),
  section: z.enum(['marketing', 'restock', 'suppliers']),
  itemIndex: z.number().int().min(0).max(10),
  rating: z.enum(['up', 'down']),
}).strict();

export const recordFeedbackAction = withAuth(
  {
    schema: feedbackSchema,
    requiredRole: ['owner', 'manager', 'staff'],
  },
  async (input, ctx) => {
    const res = await recordAIFeedback(ctx.businessId, ctx.userId, input);
    return res;
  }
);
