import { z } from 'zod';

export const marketingItemSchema = z
  .object({
    title: z.string().min(1).max(120),
    targetItemNames: z.array(z.string().min(1)).min(1).max(5),
    idea: z.string().min(1).max(300),
    channel: z.enum(['in-store sign', 'social media', 'sms', 'telegram broadcast']),
    sampleMessage: z.string().min(1).max(250),
  })
  .strict();

export const restockItemSchema = z
  .object({
    itemName: z.string().min(1).max(120),
    why: z.string().min(1).max(300),
    urgency: z.enum(['today', 'this week']),
    suggestedQuantity: z.number().int().positive().optional(),
  })
  .strict();

export const supplierTipSchema = z
  .object({
    itemCategory: z.string().min(1).max(100),
    supplierType: z.string().min(1).max(120),
    whatToAskFor: z.string().min(1).max(300),
    tip: z.string().min(1).max(300),
  })
  .strict();

export const recommendationSchema = z
  .object({
    summary: z.string().min(1).max(500),
    marketing: z.array(marketingItemSchema).max(3),
    restock: z.array(restockItemSchema).max(3),
    suppliers: z.array(supplierTipSchema).max(3),
  })
  .strict();

export type MarketingItem = z.infer<typeof marketingItemSchema>;
export type RestockItem = z.infer<typeof restockItemSchema>;
export type SupplierTip = z.infer<typeof supplierTipSchema>;
export type RecommendationPayload = z.infer<typeof recommendationSchema>;

/**
 * Extracts JSON and validates against schema + anti-hallucination checks.
 * Rejects any item names not provided in `validItemNames`.
 */
export function parseRecommendation(
  rawText: string,
  validItemNames: string[]
): RecommendationPayload {
  // 1. Strip markdown fences if present
  let cleanText = rawText.trim();
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }

  // 2. Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanText);
  } catch {
    throw new Error('Invalid JSON format from AI generation');
  }

  // 3. Strict schema validation
  const result = recommendationSchema.parse(parsed);

  // 4. Anti-hallucination check: every referenced item must exist in validItemNames
  const validSet = new Set(validItemNames.map((n) => n.trim().toLowerCase()));

  for (const item of result.restock) {
    if (!validSet.has(item.itemName.trim().toLowerCase())) {
      throw new Error(
        `Anti-hallucination check failed: restock item "${item.itemName}" was not found in catalog`
      );
    }
  }

  for (const promo of result.marketing) {
    for (const name of promo.targetItemNames) {
      if (!validSet.has(name.trim().toLowerCase())) {
        throw new Error(
          `Anti-hallucination check failed: marketing target item "${name}" was not found in catalog`
        );
      }
    }
  }

  return result;
}
