import { describe, it, expect } from 'vitest';
import {
  posterDesignSchema,
  generatePosterInputSchema,
} from '@/lib/validation/poster';
import {
  buildPosterPrompt,
  generateFallbackPosterDesign,
} from '@/lib/services/poster';

describe('Poster Generator Service & Validation', () => {
  it('validates poster design schema with required fields and valid hex colors', () => {
    const validDesign = {
      theme: 'modern-minimal',
      headline: 'SUMMER CLEARANCE SALE',
      subheadline: 'Huge discounts across all organic selections',
      badge: '50% OFF',
      category: 'SUPERMARKET SPECIAL',
      accentColor: '#2563eb',
      primaryColor: '#0f172a',
      backgroundColor: '#ffffff',
      secondaryBg: '#f8fafc',
      textColor: '#0f172a',
      mutedTextColor: '#64748b',
      offerHighlight: 'Save up to 50% on all produce',
      productDescription: 'Finest organic fruits harvested fresh daily.',
      eventDates: 'Saturday & Sunday • Oct 14–15',
      eventTime: '8:00 AM – 7:00 PM',
      location: 'Downtown Store, 123 Main St',
      contactDetails: '(555) 019-2834 • info@store.com',
      callToAction: 'VISIT US TODAY',
      finePrint: '*While supplies last.',
      illustrationType: 'grocery',
    };

    const parsed = posterDesignSchema.parse(validDesign);
    expect(parsed.headline).toBe('SUMMER CLEARANCE SALE');
    expect(parsed.accentColor).toBe('#2563eb');
    expect(parsed.theme).toBe('modern-minimal');
  });

  it('rejects invalid hex colors in poster design', () => {
    const invalidDesign = {
      headline: 'SALE',
      accentColor: 'not-a-color',
    };

    expect(() => posterDesignSchema.parse(invalidDesign)).toThrow();
  });

  it('includes the exact requested design requirements in the AI prompt', () => {
    const prompt = buildPosterPrompt({
      topic: 'Weekend Clearance',
      targetItem: 'Organic Apples',
      businessName: 'Fresh Grocer',
      deal: '30% Off',
    });

    expect(prompt).toContain('Design a high-quality, professional, and visually attractive poster for');
    expect(prompt).toContain('Use a modern and creative visual style.');
    expect(prompt).toContain('Create a strong visual hierarchy with a clear, eye-catching headline.');
    expect(prompt).toContain('Use balanced colors that match the topic and brand identity.');
    expect(prompt).toContain('Include relevant high-quality visuals, illustrations, or graphics.');
    expect(prompt).toContain('Keep the layout clean, organized, and easy to understand.');
    expect(prompt).toContain('Use professional typography with readable text.');
    expect(prompt).toContain('Highlight important information such as date, time, location, and contact details.');
    expect(prompt).toContain('Ensure all text is correctly spelled and clearly readable.');
    expect(prompt).toContain('Avoid overcrowding, unnecessary decorations, and excessive visual effects.');
    expect(prompt).toContain('Format: Vertical A3 poster, high resolution, print-ready quality.');
    expect(prompt).toContain('The final design should look like it was created by a professional graphic designer.');
  });

  it('generates a valid fallback design with tailored theme and illustration', () => {
    const fallback = generateFallbackPosterDesign({
      topic: 'Morning Freshness',
      targetItem: 'Artisan Sourdough Bread',
      businessName: 'Crust & Crumb',
      deal: 'Buy 1 Get 1 50% Off',
    });

    expect(fallback.illustrationType).toBe('bakery');
    expect(fallback.theme).toBe('fresh-organic');
    expect(fallback.headline).toContain('ARTISAN SOURDOUGH BREAD');
    expect(fallback.accentColor).toBe('#d97706');
    expect(fallback.eventDates).toBeTruthy();
    expect(fallback.location).toContain('Crust & Crumb');

    // Must strictly pass schema validation
    const parsed = posterDesignSchema.parse(fallback);
    expect(parsed).toBeDefined();
  });

  it('correctly maps beverage items to beverage illustration', () => {
    const fallback = generateFallbackPosterDesign({
      topic: 'Coffee Special',
      targetItem: 'Cold Brew Coffee',
      businessName: 'Brew Haven',
      deal: '20% off',
    });

    expect(fallback.illustrationType).toBe('beverage');
  });

  it('validates generate poster input schema strictly', () => {
    const valid = generatePosterInputSchema.parse({
      topic: 'Spring Festival',
      targetItem: 'Strawberries',
      businessName: 'Local Orchard',
      deal: '$2.99 / lb',
    });

    expect(valid.targetItem).toBe('Strawberries');
  });
});

