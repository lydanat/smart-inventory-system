import 'server-only';
import { GoogleGenAI } from '@google/genai';
import { logger } from '@/lib/logger';
import {
  type PosterDesign,
  type GeneratePosterInput,
  posterDesignSchema,
} from '@/lib/validation/poster';
import { generateFallbackPosterDesign } from '@/lib/utils/poster-theme';

export { generateFallbackPosterDesign };

/**
 * Builds the poster design prompt strictly incorporating the user's specification:
 * 
 * "Design a high-quality, professional, and visually attractive poster for [POSTER TOPIC / EVENT].
 * 
 * Design requirements:
 * - Use a modern and creative visual style.
 * - Create a strong visual hierarchy with a clear, eye-catching headline.
 * - Use balanced colors that match the topic and brand identity.
 * - Include relevant high-quality visuals, illustrations, or graphics.
 * - Keep the layout clean, organized, and easy to understand.
 * - Use professional typography with readable text.
 * - Highlight important information such as date, time, location, and contact details.
 * - Ensure all text is correctly spelled and clearly readable.
 * - Avoid overcrowding, unnecessary decorations, and excessive visual effects.
 * 
 * Format: Vertical A3 poster, high resolution, print-ready quality.
 * The final design should look like it was created by a professional graphic designer."
 */
export function buildPosterPrompt(input: GeneratePosterInput): string {
  const posterTopic = `${input.topic} — ${input.targetItem} (${input.deal || 'Featured Promo'})`;

  return `You are an elite, award-winning graphic designer and art director specializing in print-ready marketing collateral.

Design a high-quality, professional, and visually attractive poster for ${posterTopic}.

Design requirements:
- Use a modern and creative visual style.
- Create a strong visual hierarchy with a clear, eye-catching headline.
- Use balanced colors that match the topic and brand identity.
- Include relevant high-quality visuals, illustrations, or graphics.
- Keep the layout clean, organized, and easy to understand.
- Use professional typography with readable text.
- Highlight important information such as date, time, location, and contact details.
- Ensure all text is correctly spelled and clearly readable.
- Avoid overcrowding, unnecessary decorations, and excessive visual effects.

Format: Vertical A3 poster, high resolution, print-ready quality.

The final design should look like it was created by a professional graphic designer.

Business / Client Context:
- Store / Business Name: ${input.businessName}
- Featured Item: ${input.targetItem}
- Promotion Details: ${input.deal || 'Exclusive Special Offer'}
${input.stylePreference ? `- Requested Theme Style: ${input.stylePreference}` : ''}

Respond ONLY with a valid, clean JSON object matching this schema (no markdown formatting, no code fences):
{
  "theme": "modern-minimal" | "bold-creative" | "dark-luxury" | "vibrant-editorial" | "fresh-organic" | "editorial-fresh",
  "headline": string,            // Punchy, short, eye-catching headline (under 8 words, ALL CAPS or Title Case)
  "subheadline": string,         // Clean, elegant subtitle explaining the offer or product value
  "badge": string,               // Deal badge text e.g. "30% OFF", "BUY 1 GET 1", "WEEKEND EXCLUSIVE"
  "category": string,            // Top kicker / category tag e.g. "OFFICIAL STORE PROMO", "SEASONAL CLEARANCE"
  "accentColor": string,         // 6-digit hex color for badges, key accents, highlights (e.g. #D97706, #2563EB, #E11D48)
  "primaryColor": string,        // 6-digit hex color for dominant brand/title elements (e.g. #0F172A, #1B4332, #1E1B4B)
  "backgroundColor": string,     // 6-digit hex color for the clean poster background (e.g. #FFFFFF, #F8FAFC, #FDFBF7, #09090B)
  "secondaryBg": string,         // 6-digit hex color for info boxes/cards (e.g. #F1F5F9, #F5EBE0, #18181B)
  "textColor": string,           // 6-digit hex color for high-contrast readable primary text
  "mutedTextColor": string,      // 6-digit hex color for secondary text, metadata, labels
  "offerHighlight": string,      // Concise 1-sentence value hook or key savings callout
  "productDescription": string,  // 1-2 sentences of clean, compelling marketing copy describing the product
  "eventDates": string,          // Realistic date range (e.g. "This Weekend • Oct 14–15" or "Limited Time Only")
  "eventTime": string,           // Store hours or event time (e.g. "8:00 AM – 7:00 PM Daily")
  "location": string,            // Clean location string (e.g. "${input.businessName} • In-Store & Curbside")
  "contactDetails": string,      // Contact phone / website (e.g. "Call (555) 019-2834 • ${input.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com")
  "callToAction": string,        // Strong, clean action button text (e.g. "VISIT IN-STORE TO REDEEM", "SHOP NOW")
  "finePrint": string,           // Professional fine print disclaimer
  "illustrationType": "grocery" | "beverage" | "bakery" | "fresh" | "general" | "sale"
}`;
}

/**
 * Main AI Poster generation service.
 * Uses Gemini API with the exact prompt specified by user, with automatic failover and validation.
 */
export async function generatePosterDesign(input: GeneratePosterInput): Promise<PosterDesign> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    logger.warn('No GEMINI_API_KEY detected, using curated fallback poster design');
    return generateFallbackPosterDesign(input);
  }

  const prompt = buildPosterPrompt(input);
  const ai = new GoogleGenAI({ apiKey });
  const preferredModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  const candidateModels = Array.from(
    new Set([preferredModel, 'gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-flash-latest'])
  );

  let rawJsonText = '';

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      });

      if (response.text) {
        rawJsonText = response.text.trim();
        break;
      }
    } catch (err: unknown) {
      const errMsg = (err as Error)?.message || '';
      logger.warn(`Poster AI generation with model ${model} failed, testing next candidate...`, {
        error: errMsg,
      });
    }
  }

  if (!rawJsonText) {
    logger.warn('All Gemini models exhausted for poster generation, using fallback');
    return generateFallbackPosterDesign(input);
  }

  try {
    let clean = rawJsonText;
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }
    const parsed = JSON.parse(clean);
    return posterDesignSchema.parse(parsed);
  } catch (parseError) {
    logger.error('Failed to parse Gemini poster output, using fallback design', {
      error: (parseError as Error).message,
    });
    return generateFallbackPosterDesign(input);
  }
}
