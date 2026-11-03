import {
  type PosterDesign,
  type GeneratePosterInput,
  type PosterTheme,
  type IllustrationType,
} from '@/lib/validation/poster';

/**
 * Intelligent adaptive copywriting & curated design presets.
 * Analyzes the target product and generates cohesive, editorial-grade
 * typography (headline, cursive subtitle, tags, and palette) adapted to the subject.
 */
export function generateFallbackPosterDesign(input: GeneratePosterInput): PosterDesign {
  const itemRaw = input.targetItem || 'Featured Item';
  const itemLower = itemRaw.toLowerCase();
  const dealLower = (input.deal || '').toLowerCase();
  const cleanBusiness = input.businessName || 'Our Store';

  // Detect product category & theme
  let theme: PosterTheme = input.stylePreference || 'editorial-fresh';
  let illustration: IllustrationType = 'general';

  let headline = 'FRESH SELECTION';
  let subheadline = 'Handcrafted Quality';
  let categoryTag = `${cleanBusiness.toUpperCase()} • SELECTION`;
  let benefitTag = 'LIMITED BATCH';
  let footerTagline = 'NATURAL INGREDIENTS • HOUSE RECIPES';

  if (
    itemLower.includes('bread') ||
    itemLower.includes('sourdough') ||
    itemLower.includes('croissant') ||
    itemLower.includes('pastry') ||
    itemLower.includes('toast') ||
    itemLower.includes('bakery') ||
    itemLower.includes('brioche') ||
    itemLower.includes('bun')
  ) {
    illustration = 'bakery';
    if (!input.stylePreference) theme = 'fresh-organic';
    headline = input.targetItem ? input.targetItem.toUpperCase() : 'BAKED DAILY';
    subheadline = 'Artisan Sourdough';
    categoryTag = 'SLOW FERMENTED';
    benefitTag = 'WILD YEAST CRUST';
    footerTagline = 'HANDCRAFTED DAILY • STONE GROUND FLOUR';
  } else if (
    itemLower.includes('matcha') ||
    itemLower.includes('green tea')
  ) {
    illustration = 'beverage';
    if (!input.stylePreference) theme = 'editorial-fresh';
    headline = 'CEREMONIAL GRADE';
    subheadline = 'Matcha Green Tea';
    categoryTag = 'SHADE GROWN';
    benefitTag = 'FIRST HARVEST';
    footerTagline = 'TRADITIONAL STONE MILLED • 100% ORGANIC';
  } else if (
    itemLower.includes('coffee') ||
    itemLower.includes('roast') ||
    itemLower.includes('espresso') ||
    itemLower.includes('bean')
  ) {
    illustration = 'beverage';
    if (!input.stylePreference) theme = 'dark-luxury';
    headline = 'ROASTED FRESH';
    subheadline = 'Single Origin Blend';
    categoryTag = 'SPECIALTY COFFEE';
    benefitTag = '100% ARABICA BEANS';
    footerTagline = 'SMALL BATCH ROASTED • SUSTAINABLY SOURCED';
  } else if (
    itemLower.includes('oat milk') ||
    itemLower.includes('whole milk') ||
    itemLower.includes('milk') ||
    itemLower.includes('dairy') ||
    itemLower.includes('yogurt') ||
    itemLower.includes('butter')
  ) {
    illustration = 'grocery';
    if (!input.stylePreference) theme = 'editorial-fresh';
    headline = itemLower.includes('oat') ? 'BARISTA EDITION' : 'FARM FRESH';
    subheadline = itemLower.includes('oat') ? 'Creamy Barista Oat' : 'Grass-Fed Dairy';
    categoryTag = 'LOCAL DAIRY & CRAFT';
    benefitTag = 'RICH & CREAMY';
    footerTagline = 'CLEAN INGREDIENTS • ZERO PRESERVATIVES';
  } else if (
    itemLower.includes('coconut') ||
    itemLower.includes('coco') ||
    itemLower.includes('tropical') ||
    itemLower.includes('pineapple') ||
    itemLower.includes('mango')
  ) {
    illustration = 'fresh';
    if (!input.stylePreference) theme = 'editorial-fresh';
    headline = itemRaw && itemRaw !== 'Featured Item' ? itemRaw.toUpperCase() : 'FRESH COCONUT';
    subheadline = 'Pure Island Harvest';
    categoryTag = 'TROPICAL RESERVE';
    benefitTag = '100% NATURAL WATER';
    footerTagline = 'SUSTAINABLY HARVESTED • NATURALLY SWEET & HYDRATING';
  } else if (
    itemLower.includes('cola') ||
    itemLower.includes('coca') ||
    itemLower.includes('pepsi') ||
    itemLower.includes('soda') ||
    itemLower.includes('soft drink')
  ) {
    illustration = 'beverage';
    if (!input.stylePreference) theme = 'dark-luxury';
    headline = itemRaw && itemRaw !== 'Featured Item' ? itemRaw.toUpperCase() : 'ICE COLD REFRESH';
    subheadline = 'Chilled Selection';
    categoryTag = 'COLD BEVERAGES';
    benefitTag = 'BEST SERVED CHILLED';
    footerTagline = 'ORIGINAL REFRESHMENT • CRISP & ICY';
  } else if (
    itemLower.includes('tea') ||
    itemLower.includes('chai') ||
    itemLower.includes('ginger ale') ||
    itemLower.includes('nitro') ||
    itemLower.includes('sparkling') ||
    itemLower.includes('water') ||
    itemLower.includes('drink') ||
    itemLower.includes('beverage')
  ) {
    illustration = 'beverage';
    if (!input.stylePreference) theme = 'editorial-fresh';
    headline = itemRaw && itemRaw !== 'Featured Item' ? itemRaw.toUpperCase() : 'CRAFT REFRESH';
    subheadline = 'Artisan Botanicals';
    categoryTag = 'CHILLED RESERVE';
    benefitTag = 'NATURAL FLAVORS';
    footerTagline = 'CRISP REFRESHMENT • PURE BOTANICAL EXTRACTS';
  } else if (
    itemLower.includes('avocado')
  ) {
    illustration = 'fresh';
    if (!input.stylePreference) theme = 'editorial-fresh';
    headline = 'FRESH DAILY';
    subheadline = 'Healthy Choice';
    categoryTag = 'REAL FOOD CLUB';
    benefitTag = 'BACK TO SIMPLE TASTE';
    footerTagline = 'NATURAL INGREDIENTS • HOUSE RECIPES';
  } else if (
    itemLower.includes('apple') ||
    itemLower.includes('fruit') ||
    itemLower.includes('veg') ||
    itemLower.includes('salad') ||
    itemLower.includes('organic') ||
    itemLower.includes('fresh') ||
    itemLower.includes('produce')
  ) {
    illustration = 'fresh';
    if (!input.stylePreference) theme = 'fresh-organic';
    headline = itemRaw && itemRaw !== 'Featured Item' ? itemRaw.toUpperCase() : 'FRESH HARVEST';
    subheadline = 'Orchard Selected';
    categoryTag = 'CERTIFIED ORGANIC';
    benefitTag = 'TREE RIPENED';
    footerTagline = 'FARM TO TABLE • PICKED AT PEAK FLAVOR';
  } else if (
    itemLower.includes('olive oil') ||
    itemLower.includes('oil') ||
    itemLower.includes('almond') ||
    itemLower.includes('pantry')
  ) {
    illustration = 'grocery';
    if (!input.stylePreference) theme = 'editorial-fresh';
    headline = itemRaw && itemRaw !== 'Featured Item' ? itemRaw.toUpperCase() : 'PANTRY RESERVE';
    subheadline = 'Cold Pressed & Pure';
    categoryTag = 'ARTISAN PANTRY';
    benefitTag = 'UNREFINED QUALITY';
    footerTagline = 'FIRST COLD PRESS • HAND SELECTED HARVEST';
  } else if (
    dealLower.includes('flash') ||
    dealLower.includes('clearance') ||
    dealLower.includes('% off') ||
    dealLower.includes('sale')
  ) {
    illustration = 'sale';
    headline = itemRaw && itemRaw !== 'Featured Item' ? itemRaw.toUpperCase() : 'CLEARANCE SPECIAL';
    subheadline = 'Limited In-Store Offer';
    categoryTag = 'STORE EXCLUSIVE';
    benefitTag = input.deal ? input.deal.toUpperCase() : 'WHILE STOCKS LAST';
    footerTagline = 'SPECIAL PRICING • LOCAL COMMUNITY OFFER';
  } else {
    // General fallback adapted from the product name
    const words = itemRaw.trim().split(/\s+/);
    if (words.length <= 2) {
      headline = itemRaw.toUpperCase();
      subheadline = 'Signature Selection';
    } else {
      headline = words.slice(0, 2).join(' ').toUpperCase();
      subheadline = words.slice(2).join(' ');
    }
  }

  // Curated designer color palettes matching the theme
  const palettes: Record<
    PosterTheme,
    {
      accent: string;
      primary: string;
      bg: string;
      secondaryBg: string;
      text: string;
      mutedText: string;
    }
  > = {
    'editorial-fresh': {
      accent: '#2d5a37', // Deep artisan forest green
      primary: '#1B3B22', // Editorial title green
      bg: '#F9F7ED', // Warm cream linen
      secondaryBg: '#F3EFE0',
      text: '#1B3B22',
      mutedText: '#422D1E', // Espresso brown accent
    },
    'modern-minimal': {
      accent: '#422D1E', // Espresso accent
      primary: '#1C1917', // Neutral warm stone black
      bg: '#FAF9F6', // Crisp off-white paper
      secondaryBg: '#F5F5F0',
      text: '#1C1917',
      mutedText: '#78716C',
    },
    'bold-creative': {
      accent: '#991B1B', // Rich ruby red
      primary: '#1E1B4B', // Midnight indigo
      bg: '#FFFBEB', // Warm amber cream
      secondaryBg: '#FEF3C7',
      text: '#1E1B4B',
      mutedText: '#78350F',
    },
    'dark-luxury': {
      accent: '#D97706', // Radiant gold/amber
      primary: '#F9F7ED', // Warm cream text
      bg: '#422D1E', // Rich dark espresso brown (#422D1E)
      secondaryBg: '#543A28', // Elevated warm cocoa surface
      text: '#F9F7ED',
      mutedText: '#D6C7B2',
    },
    'vibrant-editorial': {
      accent: '#0D9488', // Editorial teal
      primary: '#134E4A', // Forest spruce
      bg: '#F0FDFA', // Mint mist
      secondaryBg: '#CCFBF1',
      text: '#042F2E',
      mutedText: '#4B5563',
    },
    'fresh-organic': {
      accent: '#d97706', // Warm terracotta amber
      primary: '#2d6a4f', // Botanical green
      bg: '#fdfbf7', // Artisan warm parchment
      secondaryBg: '#f7f4ed',
      text: '#1b4332',
      mutedText: '#52796f',
    },
  };

  const palette = palettes[theme] || palettes['editorial-fresh'];
  const badge = input.deal && input.deal.length < 35 ? input.deal.toUpperCase() : 'SPECIAL PROMOTION';

  return {
    theme,
    headline,
    subheadline,
    badge,
    category: categoryTag,
    accentColor: palette.accent,
    primaryColor: palette.primary,
    backgroundColor: palette.bg,
    secondaryBg: palette.secondaryBg,
    textColor: palette.text,
    mutedTextColor: palette.mutedText,
    offerHighlight: input.deal || benefitTag,
    productDescription: footerTagline,
    eventDates: 'Saturday & Sunday • Limited Batch',
    eventTime: '8:00 AM – 7:00 PM Daily',
    location: `${cleanBusiness} • In-Store & Online`,
    contactDetails: 'EST. 2026',
    callToAction: 'VISIT IN-STORE TODAY TO REDEEM',
    finePrint: '*Handcrafted daily with fresh locally sourced ingredients. While supplies last.',
    illustrationType: illustration,
  };
}
