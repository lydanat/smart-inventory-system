import { describe, it, expect } from 'vitest';
import { parseRecommendation } from '@/lib/validation/ai';

describe('parseRecommendation validation & anti-hallucination', () => {
  const validCatalog = ['Organic Apples', 'Oat Milk 1L', 'Espresso Beans'];

  const validPayload = {
    summary: 'Focus on restock of Espresso Beans and promote Oat Milk before expiry.',
    marketing: [
      {
        title: 'Morning Brew Combo',
        targetItemNames: ['Oat Milk 1L', 'Espresso Beans'],
        idea: 'Bundle oat milk with espresso beans for a 15% discount.',
        channel: 'in-store sign' as const,
        sampleMessage: 'Pair Oat Milk with Espresso Beans today!',
      },
    ],
    restock: [
      {
        itemName: 'Espresso Beans',
        why: 'Stock is down to 2 units and daily sales average 4.',
        urgency: 'today' as const,
      },
    ],
    suppliers: [
      {
        itemCategory: 'Coffee',
        supplierType: 'Local Roaster',
        whatToAskFor: 'Weekly 10kg delivery batch',
        tip: 'Order on Tuesdays for Thursday delivery.',
      },
    ],
  };

  it('successfully parses valid JSON matching catalog items', () => {
    const raw = JSON.stringify(validPayload);
    const parsed = parseRecommendation(raw, validCatalog);

    expect(parsed.summary).toBe(validPayload.summary);
    expect(parsed.restock[0].itemName).toBe('Espresso Beans');
    expect(parsed.marketing[0].targetItemNames).toEqual(['Oat Milk 1L', 'Espresso Beans']);
  });

  it('successfully parses JSON wrapped in markdown fences', () => {
    const raw = '```json\n' + JSON.stringify(validPayload) + '\n```';
    const parsed = parseRecommendation(raw, validCatalog);

    expect(parsed.summary).toBe(validPayload.summary);
    expect(parsed.restock.length).toBe(1);
  });

  it('rejects JSON with unknown fields due to strict schema', () => {
    const invalidWithExtra = {
      ...validPayload,
      unauthorizedField: 'hacked_payload',
    };
    const raw = JSON.stringify(invalidWithExtra);

    expect(() => parseRecommendation(raw, validCatalog)).toThrow();
  });

  it('rejects JSON referencing a hallucinated item not in the catalog', () => {
    const hallucinatedPayload = {
      ...validPayload,
      restock: [
        {
          itemName: 'Dragon Fruit Sorbet', // NOT in validCatalog
          why: 'Trending dessert',
          urgency: 'today' as const,
        },
      ],
    };
    const raw = JSON.stringify(hallucinatedPayload);

    expect(() => parseRecommendation(raw, validCatalog)).toThrowError(
      /Anti-hallucination check failed/i
    );
  });

  it('rejects JSON referencing hallucinated marketing target items', () => {
    const hallucinatedMarketing = {
      ...validPayload,
      marketing: [
        {
          title: 'Special promotion',
          targetItemNames: ['Magic Beans'], // NOT in validCatalog
          idea: 'Great deal',
          channel: 'sms' as const,
          sampleMessage: 'Get your magic beans now!',
        },
      ],
    };
    const raw = JSON.stringify(hallucinatedMarketing);

    expect(() => parseRecommendation(raw, validCatalog)).toThrowError(
      /Anti-hallucination check failed/i
    );
  });

  it('throws on non-JSON raw strings', () => {
    expect(() => parseRecommendation('Sorry, I cannot help with that.', validCatalog)).toThrow();
  });
});
