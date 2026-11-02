'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Copy,
  Check,
  Download,
  Share2,
  Sparkles,
  Upload,
  ImagePlus,
  RefreshCw,
  Printer,
  FileCode,
  Trash2,
  Wand2,
  Layers,
  Utensils,
  Type,
  Palette,
  Image as ImageIcon,
  Sliders,
  Store,
  SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import type { MarketingItem } from '@/lib/validation/ai';
import {
  type PosterDesign,
  type PosterTheme,
} from '@/lib/validation/poster';
import { generatePosterAction } from '@/actions/poster';
import { generateFallbackPosterDesign } from '@/lib/utils/poster-theme';
import { removeImageBackground } from '@/lib/utils/background-remover';

/**
 * Renders an accurate, high-fidelity editorial vector visual
 * dynamically adapted to the specific stock product when no custom photo is uploaded.
 */
function renderDefaultProductVisual(targetItem: string, poster: PosterDesign) {
  const itemLower = (targetItem || '').toLowerCase();

  const isCoffee =
    itemLower.includes('coffee') ||
    itemLower.includes('roast') ||
    itemLower.includes('espresso') ||
    itemLower.includes('bean');

  const isMatcha =
    itemLower.includes('matcha') ||
    itemLower.includes('green tea') ||
    itemLower.includes('tea');

  const isBakery =
    itemLower.includes('bread') ||
    itemLower.includes('sourdough') ||
    itemLower.includes('loaf') ||
    itemLower.includes('bakery') ||
    itemLower.includes('brioche') ||
    itemLower.includes('bun') ||
    itemLower.includes('croissant');

  const isDairy =
    itemLower.includes('milk') ||
    itemLower.includes('oat') ||
    itemLower.includes('dairy') ||
    itemLower.includes('yogurt') ||
    itemLower.includes('butter');

  const isApple =
    itemLower.includes('apple') ||
    itemLower.includes('fruit') ||
    itemLower.includes('honeycrisp');

  if (isCoffee) {
    // ☕ 1KG SPECIALTY ESPRESSO ROAST BEANS POUCH & ROASTED BEANS
    return (
      <g>
        {/* Soft realistic ground shadow */}
        <ellipse cx="600" cy="800" rx="380" ry="32" fill="rgba(66, 45, 30, 0.28)" filter="url(#cleanGroundBlur)" />
        <ellipse cx="600" cy="796" rx="260" ry="18" fill="rgba(66, 45, 30, 0.35)" filter="blur(8px)" />

        {/* Scattered Roasted Whole Coffee Beans */}
        <g>
          {/* Bean 1 (Far Left) */}
          <ellipse cx="410" cy="795" rx="36" ry="24" transform="rotate(-22 410 795)" fill="#2E1B10" stroke="#170C06" strokeWidth="2.5" />
          <path d="M 382 793 Q 410 797 438 791" stroke="#120A05" strokeWidth="4.5" strokeLinecap="round" fill="none" />

          {/* Bean 2 (Far Right) */}
          <ellipse cx="780" cy="790" rx="34" ry="23" transform="rotate(26 780 790)" fill="#3D2517" stroke="#170C06" strokeWidth="2.5" />
          <path d="M 754 788 Q 780 793 806 789" stroke="#120A05" strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* Bean 3 (Front Left) */}
          <ellipse cx="480" cy="820" rx="30" ry="20" transform="rotate(38 480 820)" fill="#442817" />
          <path d="M 460 818 Q 480 824 500 820" stroke="#1A0F08" strokeWidth="3.5" fill="none" strokeLinecap="round" />

          {/* Bean 4 (Front Right) */}
          <ellipse cx="720" cy="818" rx="32" ry="21" transform="rotate(-16 720 818)" fill="#2E1B10" />
          <path d="M 698 817 Q 720 820 742 816" stroke="#120A05" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </g>

        {/* 1KG Specialty Craft Coffee Pouch (Center) */}
        <g transform="translate(0, 10)">
          {/* Pouch Silhouette */}
          <path d="M 475 420 L 515 320 L 685 320 L 725 420 L 705 775 L 495 775 Z" fill="#24140B" />
          <path d="M 480 425 L 520 325 L 680 325 L 720 425 L 700 775 L 500 775 Z" fill="#3A2312" stroke="#24140B" strokeWidth="3" />

          {/* Top Seal Fold & Gold Clamp */}
          <rect x="510" y="310" width="180" height="26" rx="4" fill="#C49A6C" stroke="#8C6834" strokeWidth="2.5" />
          <line x1="520" y1="323" x2="680" y2="323" stroke="#8C6834" strokeWidth="1.5" />

          {/* Degassing Valve */}
          <circle cx="600" cy="405" r="14" fill="#24140B" stroke="#C49A6C" strokeWidth="2" />
          <circle cx="600" cy="405" r="5" fill="#3A2312" />

          {/* Minimalist Kraft Label */}
          <rect x="522" y="460" width="156" height="250" rx="8" fill="#FDF8E5" stroke="#C49A6C" strokeWidth="2" />
          <rect x="528" y="466" width="144" height="238" rx="4" fill="none" stroke="#3A2312" strokeWidth="1" strokeOpacity="0.3" />

          {/* Label Typography */}
          <text x="600" y="498" textAnchor="middle" fill="#3A2312" fontSize="12" fontWeight="900" letterSpacing="3">
            SPECIALTY ROAST
          </text>
          <text x="600" y="535" textAnchor="middle" fill="#1A0F08" fontSize="24" fontWeight="900" letterSpacing="1">
            ESPRESSO
          </text>
          <text x="600" y="558" textAnchor="middle" fill="#78350F" fontSize="11" fontWeight="700" letterSpacing="2">
            WHOLE BEANS • 1KG
          </text>

          {/* Coffee Bean Icon on Label */}
          <g transform="translate(600, 600)">
            <ellipse cx="0" cy="0" rx="22" ry="15" fill="#3A2312" />
            <path d="M -15 -1 Q 0 2 15 -2" stroke="#FDF8E5" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>

          <text x="600" y="650" textAnchor="middle" fill="#3A2312" fontSize="11" fontWeight="800" letterSpacing="1">
            100% ARABICA BLEND
          </text>
          <text x="600" y="675" textAnchor="middle" fill="#78350F" fontSize="10" fontWeight="600">
            SMALL BATCH LOCALLY ROASTED
          </text>
        </g>

        {/* Rising Warm Aroma Wisps */}
        <g opacity="0.65">
          <path d="M 575 270 Q 560 230 580 190" stroke="#C49A6C" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 605 260 Q 620 220 600 180" stroke="#C49A6C" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 630 275 Q 645 235 625 195" stroke="#C49A6C" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      </g>
    );
  }

  if (isMatcha) {
    // 🍵 CEREMONIAL MATCHA GREEN TEA CHAWAN BOWL & BAMBOO WHISK
    return (
      <g>
        {/* Soft realistic ground shadow */}
        <ellipse cx="600" cy="800" rx="380" ry="32" fill="rgba(66, 45, 30, 0.24)" filter="url(#cleanGroundBlur)" />
        <ellipse cx="600" cy="796" rx="270" ry="18" fill="rgba(66, 45, 30, 0.32)" filter="blur(8px)" />

        {/* Ceramic Chawan Bowl */}
        <g transform="translate(0, 40)">
          <path d="M 420 540 C 420 760, 780 760, 780 540 C 780 500, 420 500, 420 540 Z" fill="#2C2723" stroke="#1B1714" strokeWidth="5" />
          {/* Jade Green Frothy Matcha Tea Surface */}
          <ellipse cx="600" cy="545" rx="165" ry="42" fill="#3D7026" />
          <ellipse cx="585" cy="542" rx="135" ry="30" fill="#5C9E33" />
          {/* Micro-foam froth highlights */}
          <circle cx="545" cy="538" r="6" fill="#A8D572" opacity="0.8" />
          <circle cx="615" cy="545" r="5" fill="#A8D572" opacity="0.8" />
          <circle cx="645" cy="539" r="4" fill="#A8D572" opacity="0.8" />
          <circle cx="575" cy="547" r="4" fill="#A8D572" opacity="0.8" />
        </g>

        {/* Bamboo Whisk (Chasen) Resting on the Right */}
        <g transform="translate(0, 40)">
          <rect x="740" y="580" width="32" height="110" rx="8" transform="rotate(34 740 580)" fill="#D6B885" stroke="#8C6834" strokeWidth="3" />
          <path d="M 690 680 Q 725 735 765 765 M 705 670 Q 735 725 780 755" stroke="#D6B885" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </g>

        {/* Bamboo Spoon (Chashaku) on Left with jade matcha powder */}
        <g transform="translate(0, 40)">
          <path d="M 440 680 Q 400 710 380 760" stroke="#D6B885" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="380" cy="760" rx="18" ry="10" fill="#5C9E33" />
        </g>
      </g>
    );
  }

  if (isBakery) {
    // 🍞 ARTISAN SOURDOUGH BREAD BOULE
    return (
      <g>
        {/* Soft realistic ground shadow */}
        <ellipse cx="600" cy="800" rx="380" ry="32" fill="rgba(66, 45, 30, 0.24)" filter="url(#cleanGroundBlur)" />
        <ellipse cx="600" cy="796" rx="270" ry="18" fill="rgba(66, 45, 30, 0.32)" filter="blur(8px)" />

        <g transform="translate(0, 20)">
          {/* Bread Boule Body */}
          <path d="M 380 660 C 360 460, 840 460, 820 660 C 810 750, 390 750, 380 660 Z" fill="#C48E56" stroke="#7A4B1A" strokeWidth="5" />
          {/* Crust Ear & Bloom */}
          <path d="M 450 540 Q 600 490 750 550" stroke="#5C330E" strokeWidth="16" fill="none" strokeLinecap="round" />
          <path d="M 465 543 Q 600 498 735 553" stroke="#E6BF83" strokeWidth="8" fill="none" strokeLinecap="round" />
          {/* Flour Dusting Highlights */}
          <ellipse cx="520" cy="510" rx="55" ry="22" fill="#FFFBF0" opacity="0.45" />
          <ellipse cx="680" cy="520" rx="45" ry="18" fill="#FFFBF0" opacity="0.45" />
        </g>
      </g>
    );
  }

  if (isDairy) {
    // 🥛 BARISTA OAT MILK / DAIRY CARTON
    return (
      <g>
        {/* Soft realistic ground shadow */}
        <ellipse cx="600" cy="800" rx="360" ry="30" fill="rgba(66, 45, 30, 0.22)" filter="url(#cleanGroundBlur)" />
        <ellipse cx="600" cy="796" rx="250" ry="16" fill="rgba(66, 45, 30, 0.30)" filter="blur(8px)" />

        <g transform="translate(0, 10)">
          {/* Gable Top */}
          <path d="M 515 440 L 600 360 L 685 440 Z" fill="#E5E5E5" stroke="#222" strokeWidth="3" />
          <rect x="515" y="440" width="170" height="340" rx="8" fill="#F4F4F0" stroke="#D0D0CA" strokeWidth="3" />
          {/* Label banner */}
          <rect x="530" y="475" width="140" height="190" rx="6" fill="#2d6a4f" />
          <text x="600" y="520" textAnchor="middle" fill="#FFF" fontSize="16" fontWeight="900" letterSpacing="2">
            BARISTA
          </text>
          <text x="600" y="555" textAnchor="middle" fill="#E6BF83" fontSize="22" fontWeight="900">
            OAT MILK
          </text>
          <text x="600" y="590" textAnchor="middle" fill="#FFF" fontSize="12" fontWeight="700">
            1 LITRE / 100% PLANT
          </text>
        </g>
      </g>
    );
  }

  if (isApple) {
    // 🍎 CRISP HONEYCRISP APPLE
    return (
      <g>
        {/* Soft realistic ground shadow */}
        <ellipse cx="600" cy="800" rx="320" ry="28" fill="rgba(66, 45, 30, 0.22)" filter="url(#cleanGroundBlur)" />
        <g transform="translate(0, 20)">
          <path
            d="M 600 480 C 520 400, 420 520, 460 690 C 500 790, 580 770, 600 750 C 620 770, 700 790, 740 690 C 780 520, 680 400, 600 480 Z"
            fill="#C62828"
            stroke="#7F0000"
            strokeWidth="4"
          />
          <path d="M 600 480 Q 610 420 625 400" stroke="#4E342E" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M 610 435 Q 645 415 675 430 Q 655 455 610 435 Z" fill="#4CAF50" stroke="#2E7D32" strokeWidth="2.5" />
        </g>
      </g>
    );
  }

  // 🥑 DEFAULT: ARTISAN AVOCADO TOAST
  return (
    <g>
      {/* Soft ground drop shadow */}
      <ellipse cx="600" cy="790" rx="340" ry="26" fill="rgba(66, 45, 30, 0.20)" filter="url(#cleanGroundBlur)" />
      <g transform="translate(600, 580) scale(1.7)">
        <path
          d="M -130 -20 C -140 -70, -70 -95, 0 -90 C 70 -95, 140 -70, 130 -20 C 120 45, -120 45, -130 -20 Z"
          fill="#c49a6c"
          stroke="#8b5e34"
          strokeWidth="4"
        />
        <path
          d="M -110 -20 C -120 -60, -60 -75, 0 -70 C 60 -75, 120 -60, 110 -20 C 100 30, -100 30, -110 -20 Z"
          fill="#70a340"
        />
        <ellipse cx="10" cy="-20" rx="44" ry="32" fill="#ffffff" />
        <ellipse cx="15" cy="-20" rx="24" ry="20" fill="#f59e0b" />
      </g>
    </g>
  );
}

interface SocialCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: MarketingItem | null;
  businessName?: string;
}

export function SocialCampaignDialog({
  open,
  onOpenChange,
  campaign,
  businessName = 'Apex Supermarket',
}: SocialCampaignDialogProps) {
  const [copiedCaption, setCopiedCaption] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isGeneratingPoster, setIsGeneratingPoster] = React.useState(false);
  const [isRemovingBg, setIsRemovingBg] = React.useState(false);
  const [customImage, setCustomImage] = React.useState<string | null>(null);
  const [originalImage, setOriginalImage] = React.useState<string | null>(null);
  const [cutoutImage, setCutoutImage] = React.useState<string | null>(null);
  const [isCutoutActive, setIsCutoutActive] = React.useState(false);
  const [customImageName, setCustomImageName] = React.useState<string | null>(null);
  const [tolerance, setTolerance] = React.useState<number>(45);
  const [selectedTheme, setSelectedTheme] = React.useState<PosterTheme>('editorial-fresh');
  const [activeTab, setActiveTab] = React.useState<'poster' | 'caption'>('poster');

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);

  const targetItem = campaign?.targetItemNames?.[0] || 'Featured Product';
  const dealMessage = campaign?.sampleMessage || 'Special promotion available today';

  // State for the editable Poster Design
  const [poster, setPoster] = React.useState<PosterDesign>(() =>
    generateFallbackPosterDesign({
      topic: campaign?.title || 'Promotional Event',
      targetItem,
      businessName,
      deal: dealMessage,
      stylePreference: 'editorial-fresh',
    })
  );

  // Initialize or re-initialize poster design when campaign changes
  React.useEffect(() => {
    if (campaign && open) {
      const fallback = generateFallbackPosterDesign({
        topic: campaign.title || 'Promotional Event',
        targetItem: campaign.targetItemNames?.[0] || 'Featured Product',
        businessName,
        deal: campaign.sampleMessage || 'Special promotion',
        stylePreference: selectedTheme,
      });

      if (campaign.posterHeadline) {
        fallback.headline = campaign.posterHeadline;
      }
      if (campaign.promoBadge) {
        fallback.badge = campaign.promoBadge;
      }
      setPoster(fallback);
      setSelectedTheme(fallback.theme);
    }
  }, [campaign, businessName, open, selectedTheme]);

  if (!campaign) return null;

  const headline = poster.headline || campaign.posterHeadline || campaign.title.toUpperCase();
  const cta = poster.callToAction || campaign.callToAction || 'VISIT IN-STORE TODAY TO REDEEM';

  // Format Facebook Caption without inappropriate placeholder text
  const caption =
    campaign.facebookCaption ||
    `🌿 ${headline} 🌿\n\n${campaign.idea}\n\nFeatured Selection: ${targetItem}\nOffer: ${campaign.sampleMessage}\n\n📍 ${cta}\n\n#SpecialOffer #ShopLocal #${targetItem.replace(/[^a-zA-Z0-9]/g, '')} #FreshQuality`;

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopiedCaption(true);
      toast.success('Social caption copied to clipboard!');
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch {
      toast.error('Unable to copy caption');
    }
  };

  // Upload product photo handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      toast.error('Image size must be under 12MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result as string;
      if (rawDataUrl) {
        setOriginalImage(rawDataUrl);
        setCustomImage(rawDataUrl);
        setCustomImageName(file.name);
        setCutoutImage(null);
        setIsCutoutActive(false);
        toast.success(`Photo loaded: ${file.name}. Click "Remove Background" for seamless cutout!`);
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  // Background removal with adjustable tolerance
  const handleRemoveBackground = async (tolOverride?: number) => {
    const sourceImg = originalImage || customImage;
    if (!sourceImg) return;

    const tolToUse = tolOverride !== undefined ? tolOverride : tolerance;
    setIsRemovingBg(true);
    const toastId = toast.loading('Removing background & isolating product...');

    try {
      const cutout = await removeImageBackground(sourceImg, tolToUse);
      if (cutout) {
        setCutoutImage(cutout);
        setCustomImage(cutout);
        setIsCutoutActive(true);
        toast.success('Background removed! Seamless product cutout with soft ground shadow.', { id: toastId });
      } else {
        toast.error('Could not isolate product background', { id: toastId });
      }
    } catch (err) {
      console.error('Background removal error:', err);
      toast.error('Could not auto-remove background. Try adjusting tolerance slider.', { id: toastId });
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleToggleCutout = () => {
    if (isCutoutActive && originalImage) {
      setCustomImage(originalImage);
      setIsCutoutActive(false);
      toast.info('Showing original uploaded photo');
    } else if (!isCutoutActive && cutoutImage) {
      setCustomImage(cutoutImage);
      setIsCutoutActive(true);
      toast.info('Showing isolated cutout product');
    }
  };

  // Adapt to store stock presets
  const handleSelectStockPreset = (presetKey: string) => {
    switch (presetKey) {
      case 'avocado':
        setCustomImage('/samples/sample-product-cutout.png');
        setOriginalImage('/samples/sample-product-cutout.png');
        setCutoutImage('/samples/sample-product-cutout.png');
        setCustomImageName('avocado-toast-cutout.png');
        setIsCutoutActive(true);
        setSelectedTheme('editorial-fresh');
        setPoster((prev) => ({
          ...prev,
          theme: 'editorial-fresh',
          headline: 'FRESH DAILY',
          subheadline: 'Healthy Choice',
          category: 'REAL FOOD CLUB',
          offerHighlight: 'BACK TO SIMPLE TASTE',
          productDescription: 'NATURAL INGREDIENTS • HOUSE RECIPES',
          eventDates: 'Weekend Harvest • Fresh Batches',
          eventTime: '8:00 AM – 7:00 PM Daily',
          location: `${businessName} • Artisan Bakery Hub`,
          contactDetails: 'EST. 2026',
          callToAction: 'VISIT IN-STORE TODAY TO REDEEM',
          finePrint: '*Handcrafted daily with fresh locally sourced ingredients. While supplies last.',
          backgroundColor: '#F9F7ED',
          primaryColor: '#1B3B22',
          textColor: '#1B3B22',
          accentColor: '#2d5a37',
          mutedTextColor: '#422D1E',
        }));
        toast.success('Loaded Avocado Toast Reference Style!');
        break;

      case 'matcha':
        setCustomImage(null);
        setOriginalImage(null);
        setCutoutImage(null);
        setIsCutoutActive(false);
        setCustomImageName(null);
        setSelectedTheme('editorial-fresh');
        setPoster((prev) => ({
          ...prev,
          theme: 'editorial-fresh',
          headline: 'CEREMONIAL GRADE',
          subheadline: 'Matcha Green Tea',
          category: 'SHADE GROWN',
          offerHighlight: 'FIRST HARVEST',
          productDescription: 'TRADITIONAL STONE MILLED • 100% ORGANIC',
          eventDates: 'This Week • Limited Small Batch',
          eventTime: '8:00 AM – 7:00 PM Daily',
          location: `${businessName} • Specialty Tea Bar`,
          contactDetails: 'EST. 2026',
          callToAction: 'VISIT IN-STORE TODAY TO REDEEM',
          finePrint: '*Authentic ceremonial shade-grown matcha powder. While supplies last.',
          backgroundColor: '#F9F7ED',
          primaryColor: '#1B3B22',
          textColor: '#1B3B22',
          accentColor: '#2d5a37',
          mutedTextColor: '#422D1E',
        }));
        toast.success('Adapted to Matcha Green Tea Powder (Stock Item)!');
        break;

      case 'espresso':
        setCustomImage(null);
        setOriginalImage(null);
        setCutoutImage(null);
        setIsCutoutActive(false);
        setCustomImageName(null);
        setSelectedTheme('dark-luxury');
        setPoster((prev) => ({
          ...prev,
          theme: 'dark-luxury',
          headline: 'ROASTED FRESH',
          subheadline: 'Single Origin Roast',
          category: 'SPECIALTY COFFEE',
          offerHighlight: '100% ARABICA BEANS',
          productDescription: 'SMALL BATCH ROASTED • SUSTAINABLY SOURCED',
          eventDates: 'Daily Roast • Fresh Batch',
          eventTime: '7:00 AM – 6:00 PM Daily',
          location: `${businessName} • Espresso Bar`,
          contactDetails: 'EST. 2026',
          callToAction: 'VISIT IN-STORE TODAY TO REDEEM',
          finePrint: '*Whole bean specialty grade coffee roasted locally.',
          backgroundColor: '#422D1E',
          primaryColor: '#F9F7ED',
          textColor: '#F9F7ED',
          accentColor: '#D97706',
          mutedTextColor: '#D6C7B2',
        }));
        toast.success('Adapted to Espresso Roast Beans 1kg (Stock Item)!');
        break;

      case 'sourdough':
        setCustomImage(null);
        setOriginalImage(null);
        setCutoutImage(null);
        setIsCutoutActive(false);
        setCustomImageName(null);
        setSelectedTheme('editorial-fresh');
        setPoster((prev) => ({
          ...prev,
          theme: 'editorial-fresh',
          headline: 'BAKED DAILY',
          subheadline: 'Artisan Sourdough Loaf',
          category: 'SLOW FERMENTED',
          offerHighlight: 'WILD YEAST CRUST',
          productDescription: 'HANDCRAFTED DAILY • STONE GROUND FLOUR',
          eventDates: 'Morning Bake • 7:00 AM Fresh',
          eventTime: '7:00 AM – 4:00 PM Daily',
          location: `${businessName} • Artisan Bakery`,
          contactDetails: 'EST. 2026',
          callToAction: 'VISIT IN-STORE TODAY TO REDEEM',
          finePrint: '*Naturally fermented for 24 hours. Crusty exterior with soft airy crumb.',
          backgroundColor: '#F9F7ED',
          primaryColor: '#1B3B22',
          textColor: '#1B3B22',
          accentColor: '#2d5a37',
          mutedTextColor: '#422D1E',
        }));
        toast.success('Adapted to Artisan Sourdough (Stock Item)!');
        break;

      case 'oatmilk':
        setCustomImage(null);
        setOriginalImage(null);
        setCutoutImage(null);
        setIsCutoutActive(false);
        setCustomImageName(null);
        setSelectedTheme('editorial-fresh');
        setPoster((prev) => ({
          ...prev,
          theme: 'editorial-fresh',
          headline: 'BARISTA EDITION',
          subheadline: 'Creamy Oat Milk 1L',
          category: 'LOCAL CRAFT RESERVE',
          offerHighlight: 'MICRO-FOAM QUALITY',
          productDescription: 'CLEAN INGREDIENTS • ZERO ARTIFICIAL ADDITIVES',
          eventDates: 'Chilled Daily • In-Store',
          eventTime: 'Regular Store Hours',
          location: `${businessName} • Chilled Section`,
          contactDetails: 'EST. 2026',
          callToAction: 'VISIT IN-STORE TODAY TO REDEEM',
          finePrint: '*Crafted for silky smooth latte microfoam and dairy-free indulgence.',
          backgroundColor: '#F9F7ED',
          primaryColor: '#1B3B22',
          textColor: '#1B3B22',
          accentColor: '#2d5a37',
          mutedTextColor: '#422D1E',
        }));
        toast.success('Adapted to Oat Milk Barista (Stock Item)!');
        break;
    }
  };

  const handleRemoveCustomImage = () => {
    setCustomImage(null);
    setOriginalImage(null);
    setCutoutImage(null);
    setIsCutoutActive(false);
    setCustomImageName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Reverted to vector graphic');
  };

  // AI Poster Regeneration
  const handleRegenerateWithAI = async (themeOverride?: PosterTheme) => {
    setIsGeneratingPoster(true);
    const themeToUse = themeOverride || selectedTheme;

    try {
      const res = await generatePosterAction({
        topic: campaign.title || 'Promotional Event',
        targetItem,
        businessName,
        deal: campaign.sampleMessage,
        stylePreference: themeToUse,
      });

      if (res.ok && res.data) {
        setPoster(res.data);
        setSelectedTheme(res.data.theme);
        toast.success('AI Poster adapted with clean typography!');
      } else {
        const fallback = generateFallbackPosterDesign({
          topic: campaign.title || 'Promotional Event',
          targetItem,
          businessName,
          deal: campaign.sampleMessage,
          stylePreference: themeToUse,
        });
        setPoster(fallback);
        toast.info('Applied clean editorial style template');
      }
    } catch (err) {
      console.error('Error generating poster:', err);
      const fallback = generateFallbackPosterDesign({
        topic: campaign.title || 'Promotional Event',
        targetItem,
        businessName,
        deal: campaign.sampleMessage,
        stylePreference: themeToUse,
      });
      setPoster(fallback);
      toast.info('Applied clean editorial style template');
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  // Download High-Resolution Vertical A3 Poster (2400 x 3394 px print-ready PNG)
  const handleDownloadA3PNG = () => {
    if (!svgRef.current) return;
    setIsDownloading(true);

    try {
      const svgElement = svgRef.current;
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 2400;
        canvas.height = 3394;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = poster.backgroundColor || '#F9F7ED';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0, 2400, 3394);
          const pngUrl = canvas.toDataURL('image/png', 1.0);
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `${targetItem.toLowerCase().replace(/[^a-z0-9]/g, '-')}-a3-poster.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(blobURL);
          toast.success('Print-ready Vertical A3 Poster downloaded (2400×3394 PNG)!');
        }
        setIsDownloading(false);
      };
      image.onerror = (err) => {
        console.error('Canvas draw error:', err);
        toast.error('Could not render high-res poster image');
        setIsDownloading(false);
      };
      image.src = blobURL;
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Could not download poster');
      setIsDownloading(false);
    }
  };

  // Download Vector SVG
  const handleDownloadSVG = () => {
    if (!svgRef.current) return;
    try {
      const svgElement = svgRef.current;
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobURL;
      downloadLink.download = `${targetItem.toLowerCase().replace(/[^a-z0-9]/g, '-')}-a3-poster.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobURL);
      toast.success('Vector A3 Poster SVG downloaded!');
    } catch {
      toast.error('Could not export SVG');
    }
  };

  // Direct Browser Print
  const handlePrintPoster = () => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up was blocked. Please allow pop-ups to print.');
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${headline} - Print Poster</title>
          <style>
            @page { size: A3 portrait; margin: 0; }
            body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; }
            svg { width: 100vw; height: 100vh; max-width: 100%; max-height: 100%; }
          </style>
        </head>
        <body>
          ${svgString}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1140px] lg:max-w-[1280px] w-[96vw] h-[92vh] max-h-[95vh] p-0 overflow-hidden border border-border/80 rounded-2xl shadow-2xl flex flex-col bg-background">
        {/* Top Header Bar */}
        <DialogHeader className="p-3.5 sm:p-4 border-b border-border/60 bg-muted/20 shrink-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <span>Marketing Campaign &amp; Poster Studio</span>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-semibold text-primary border-primary/30 bg-primary/5 uppercase"
                  >
                    A3 Print-Ready • 300 DPI
                  </Badge>
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Clean editorial typography, automatic product background cutout, and print-ready export.
                </p>
              </div>
            </div>

            {/* Quick Export Actions in Header */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                size="sm"
                onClick={handleDownloadA3PNG}
                disabled={isDownloading}
                className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloading ? 'Exporting...' : 'Download A3 PNG'}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSVG}
                className="h-8 text-xs font-medium gap-1 cursor-pointer"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">SVG</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintPoster}
                className="h-8 text-xs font-medium gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Selector */}
        <div className="px-4 pt-2.5 shrink-0 border-b border-border/40 bg-muted/10">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as 'poster' | 'caption')}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-[460px] grid-cols-2 h-10 p-1 bg-muted/40 rounded-xl border border-border/70">
              <TabsTrigger
                value="poster"
                className="text-xs font-semibold gap-1.5 cursor-pointer rounded-lg border-2 border-transparent data-[state=active]:border-[#422D1E] data-[state=active]:bg-background data-[state=active]:text-[#422D1E] data-[state=active]:shadow-xs transition-all hover:border-[#422D1E]/30"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Visual A3 Poster Studio</span>
              </TabsTrigger>
              <TabsTrigger
                value="caption"
                className="text-xs font-semibold gap-1.5 cursor-pointer rounded-lg border-2 border-transparent data-[state=active]:border-[#422D1E] data-[state=active]:bg-background data-[state=active]:text-[#422D1E] data-[state=active]:shadow-xs transition-all hover:border-[#422D1E]/30"
              >
                <span>Social Post Caption</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-hidden p-3 sm:p-5">
          {activeTab === 'poster' ? (
            /* ========================================================================= */
            /* TWO-PANEL STUDIO LAYOUT: Left Controls (42%) + Right Live Canvas (58%)    */
            /* ========================================================================= */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full overflow-hidden">
              {/* LEFT COLUMN: Organized, Intuitive Studio Navigation */}
              <div className="lg:col-span-5 flex flex-col gap-3.5 overflow-y-auto pr-1 h-full scrollbar-thin">
                {/* 1. SHOP STOCK PRESETS (Instant 1-click adaptation to real inventory) */}
                <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <Store className="w-3.5 h-3.5 text-primary" />
                      <span>In-Stock Product Presets</span>
                    </span>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      1-Click Adapt
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSelectStockPreset('avocado')}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border/70 bg-muted/30 hover:bg-primary/10 hover:border-primary/50 text-foreground transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>🥑 Avocado Toast</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectStockPreset('matcha')}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border/70 bg-muted/30 hover:bg-primary/10 hover:border-primary/50 text-foreground transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>🍵 Matcha Green Tea</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectStockPreset('espresso')}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border/70 bg-muted/30 hover:bg-primary/10 hover:border-primary/50 text-foreground transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>☕ Espresso Beans</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectStockPreset('sourdough')}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border/70 bg-muted/30 hover:bg-primary/10 hover:border-primary/50 text-foreground transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>🍞 Artisan Sourdough</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectStockPreset('oatmilk')}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border/70 bg-muted/30 hover:bg-primary/10 hover:border-primary/50 text-foreground transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>🥛 Barista Oat Milk</span>
                    </button>
                  </div>
                </div>

                {/* 2. PRODUCT IMAGE UPLOAD & BACKGROUND REMOVAL */}
                <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <ImageIcon className="w-3.5 h-3.5 text-primary" />
                      <span>Custom Product Cutout</span>
                    </span>
                    {customImage && (
                      <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                        {customImageName || 'Product photo'}
                      </span>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  {!customImage ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-primary/30 hover:border-primary/70 bg-muted/20 hover:bg-muted/40 p-3.5 rounded-xl text-center cursor-pointer transition-colors"
                    >
                      <ImagePlus className="w-5 h-5 text-primary mx-auto mb-1 opacity-80" />
                      <p className="text-xs font-semibold text-foreground">Click to upload product photo</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        PNG, JPG, or WEBP. Background removed automatically!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between bg-muted/40 p-2 rounded-lg border border-border/50 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-medium truncate">{customImageName || 'Uploaded Product'}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            title="Change photo"
                            className="w-6 h-6 text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <Upload className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleRemoveCustomImage}
                            title="Remove photo"
                            className="w-6 h-6 text-rose-500 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Tolerance & Sensitivity Slider */}
                      <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <SlidersHorizontal className="w-3 h-3" />
                            <span>Cutout Sensitivity (Tolerance)</span>
                          </span>
                          <span className="font-semibold text-foreground">{tolerance}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="15"
                            max="85"
                            step="5"
                            value={tolerance}
                            onChange={(e) => setTolerance(Number(e.target.value))}
                            className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-muted-foreground px-0.5">
                          <span>Soft (25)</span>
                          <span>Balanced (45)</span>
                          <span>Crisp (70)</span>
                        </div>
                      </div>

                      {/* Background Removal Action Bar */}
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleRemoveBackground()}
                          disabled={isRemovingBg}
                          className="flex-1 h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
                        >
                          <Wand2 className={`w-3.5 h-3.5 ${isRemovingBg ? 'animate-spin' : ''}`} />
                          <span>{isRemovingBg ? 'Removing Background...' : '✨ Remove Background (Cutout)'}</span>
                        </Button>

                        {cutoutImage && originalImage && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleToggleCutout}
                            className="h-8 text-xs font-medium gap-1 cursor-pointer"
                            title="Toggle between original photo and transparent cutout"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>{isCutoutActive ? 'Original' : 'Cutout'}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. POSTER TYPOGRAPHY & EDITORIAL CONTENT */}
                <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-xs space-y-3">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <Type className="w-3.5 h-3.5 text-primary" />
                    <span>Editorial Typography &amp; Content</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Bold Headline</Label>
                      <Input
                        value={poster.headline}
                        onChange={(e) => setPoster((p) => ({ ...p, headline: e.target.value }))}
                        className="h-8 text-xs font-bold"
                        placeholder="e.g. CEREMONIAL GRADE"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Cursive Subtitle</Label>
                      <Input
                        value={poster.subheadline}
                        onChange={(e) => setPoster((p) => ({ ...p, subheadline: e.target.value }))}
                        className="h-8 text-xs italic"
                        placeholder="e.g. Matcha Green Tea"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Top Left Kicker Tag</Label>
                      <Input
                        value={poster.category}
                        onChange={(e) => setPoster((p) => ({ ...p, category: e.target.value }))}
                        className="h-8 text-xs"
                        placeholder="e.g. SHADE GROWN"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Bottom Right Value Tag</Label>
                      <Input
                        value={poster.offerHighlight}
                        onChange={(e) => setPoster((p) => ({ ...p, offerHighlight: e.target.value }))}
                        className="h-8 text-xs"
                        placeholder="e.g. FIRST HARVEST"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-[11px] text-muted-foreground">Provenance / Story Tagline</Label>
                      <Input
                        value={poster.productDescription}
                        onChange={(e) => setPoster((p) => ({ ...p, productDescription: e.target.value }))}
                        className="h-8 text-xs"
                        placeholder="e.g. TRADITIONAL STONE MILLED • 100% ORGANIC"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Schedule / Batch</Label>
                      <Input
                        value={poster.eventDates}
                        onChange={(e) => setPoster((p) => ({ ...p, eventDates: e.target.value }))}
                        className="h-8 text-xs"
                        placeholder="e.g. Weekend Batch"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Store Hours</Label>
                      <Input
                        value={poster.eventTime}
                        onChange={(e) => setPoster((p) => ({ ...p, eventTime: e.target.value }))}
                        className="h-8 text-xs"
                        placeholder="e.g. 8:00 AM – 7:00 PM"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-[11px] text-muted-foreground">Call To Action</Label>
                      <Input
                        value={poster.callToAction}
                        onChange={(e) => setPoster((p) => ({ ...p, callToAction: e.target.value }))}
                        className="h-8 text-xs font-semibold"
                        placeholder="e.g. VISIT IN-STORE TODAY TO REDEEM"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. VISUAL TONE & THEME PALETTE */}
                <div className="p-3.5 rounded-xl border border-border/70 bg-card shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <Palette className="w-3.5 h-3.5 text-primary" />
                      <span>Visual Tone &amp; Palette</span>
                    </span>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleRegenerateWithAI()}
                      disabled={isGeneratingPoster}
                      className="h-7 text-[11px] font-semibold gap-1 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs px-2.5"
                    >
                      <RefreshCw className={`w-3 h-3 ${isGeneratingPoster ? 'animate-spin' : ''}`} />
                      <span>{isGeneratingPoster ? 'Designing...' : 'Regenerate with AI'}</span>
                    </Button>
                  </div>

                  <Select
                    value={selectedTheme}
                    onValueChange={(val) => {
                      const nextTheme = val as PosterTheme;
                      setSelectedTheme(nextTheme);
                      handleRegenerateWithAI(nextTheme);
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs w-full">
                      <SelectValue placeholder="Style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editorial-fresh">Warm Linen Cream (Avocado Reference)</SelectItem>
                      <SelectItem value="dark-luxury">Espresso Brown (#422D1E)</SelectItem>
                      <SelectItem value="fresh-organic">Forest Sage &amp; Botanical</SelectItem>
                      <SelectItem value="modern-minimal">Modern Minimalist Stone</SelectItem>
                      <SelectItem value="bold-creative">Warm Amber &amp; Crimson</SelectItem>
                      <SelectItem value="vibrant-editorial">Editorial Mint Spruce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* RIGHT COLUMN: Live Clean A3 Poster Canvas Preview (1 Card only! Full-bleed, borderless!) */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center bg-muted/20 p-2 sm:p-4 rounded-2xl border border-border/60 overflow-hidden h-full">
                <div
                  className="h-full max-h-[78vh] aspect-[1200/1697] rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/10 flex items-center justify-center transition-colors"
                  style={{ backgroundColor: poster.backgroundColor || '#F9F7ED' }}
                >
                  <svg
                    ref={svgRef}
                    viewBox="0 0 1200 1697"
                    className="w-full h-full block select-none font-sans"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                  >
                    <defs>
                      {/* Realistic Soft Diffused Ground Drop Shadow for floating transparent cutouts */}
                      <filter id="cleanGroundBlur" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="18" />
                      </filter>
                    </defs>

                    {/* Canvas Background: Pure Full-Bleed Edge-to-Edge */}
                    <rect width="1200" height="1697" fill={poster.backgroundColor || '#F9F7ED'} />

                    {/* 1. TOP HEADER: STORE BRAND & SELECTION */}
                    <g transform="translate(600, 95)">
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        fill={poster.primaryColor || '#1B3B22'}
                        fontSize="20"
                        fontWeight="700"
                        letterSpacing="6"
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        {businessName.toUpperCase()} • SELECTION
                      </text>
                    </g>

                    {/* 2. MAIN BOLD CONDENSED HEADLINE (Giant Editorial Impact) */}
                    <g transform="translate(600, 210)">
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        fill={poster.primaryColor || '#1B3B22'}
                        fontSize={
                          headline.length > 20
                            ? '86'
                            : headline.length > 14
                            ? '102'
                            : '120'
                        }
                        fontWeight="900"
                        letterSpacing="3"
                        fontFamily="Impact, 'Arial Black', -apple-system, sans-serif"
                      >
                        {headline}
                      </text>
                    </g>

                    {/* 3. SUBTITLE: PAIRING CONTRASTING SCRIPT ACCENT WITH DELICATE MOTIFS */}
                    <g transform="translate(600, 290)">
                      {/* Left Ornament: Delicate Intersecting Rings */}
                      <g transform="translate(-320, -14)">
                        <circle cx="-12" cy="0" r="16" fill="none" stroke={poster.primaryColor} strokeWidth="2.5" />
                        <circle cx="12" cy="0" r="16" fill="none" stroke={poster.primaryColor} strokeWidth="2.5" />
                      </g>

                      {/* Cursive Subtitle */}
                      <text
                        x="0"
                        y="2"
                        textAnchor="middle"
                        fill={poster.primaryColor || '#1B3B22'}
                        fontSize="54"
                        fontStyle="italic"
                        fontWeight="600"
                        fontFamily="'Brush Script MT', 'Baskerville', 'Playfair Display', Georgia, serif"
                      >
                        {poster.subheadline || 'Healthy Choice'}
                      </text>

                      {/* Right Ornament: Minimalist Parallel Rules */}
                      <g transform="translate(250, -22)">
                        <line x1="0" y1="0" x2="60" y2="0" stroke={poster.primaryColor} strokeWidth="2" />
                        <line x1="0" y1="8" x2="60" y2="8" stroke={poster.primaryColor} strokeWidth="2" />
                        <line x1="0" y1="16" x2="60" y2="16" stroke={poster.primaryColor} strokeWidth="2" />
                        <line x1="0" y1="24" x2="60" y2="24" stroke={poster.primaryColor} strokeWidth="2" />
                        <line x1="0" y1="32" x2="60" y2="32" stroke={poster.primaryColor} strokeWidth="2" />
                      </g>
                    </g>

                    {/* 4. UPPER CORNER ANNOTATION TAGS (Spacious, safe margins far from product) */}
                    <g transform="translate(100, 390)">
                      <text
                        x="0"
                        y="0"
                        fill={poster.primaryColor || '#1B3B22'}
                        fontSize="22"
                        fontWeight="900"
                        letterSpacing="3"
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        {poster.category ? poster.category.slice(0, 26).toUpperCase() : 'CRAFT SELECTION'}
                      </text>
                    </g>

                    <g transform="translate(1100, 940)">
                      <text
                        x="0"
                        y="0"
                        textAnchor="end"
                        fill={poster.primaryColor || '#1B3B22'}
                        fontSize="22"
                        fontWeight="900"
                        letterSpacing="3"
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        {poster.offerHighlight ? poster.offerHighlight.slice(0, 30).toUpperCase() : 'SIMPLE TASTE'}
                      </text>
                    </g>

                    {/* 5. HERO PRODUCT STAGE: DYNAMIC PRODUCT-ACCURATE ARTWORK (OR CUSTOM CUTOUT) */}
                    <g transform="translate(0, 80)">
                      {customImage ? (
                        <g>
                          {/* Realistic Soft Diffused Ground Drop Shadow */}
                          <ellipse
                            cx="600"
                            cy="800"
                            rx="380"
                            ry="30"
                            fill="rgba(66, 45, 30, 0.22)"
                            filter="url(#cleanGroundBlur)"
                          />
                          <ellipse
                            cx="600"
                            cy="796"
                            rx="280"
                            ry="18"
                            fill="rgba(66, 45, 30, 0.30)"
                            filter="blur(10px)"
                          />

                          {/* Seamless Floating Product Image (No Inner Border!) */}
                          <image
                            href={customImage}
                            xlinkHref={customImage}
                            x="120"
                            y="360"
                            width="960"
                            height="490"
                            preserveAspectRatio="xMidYMid meet"
                          />
                        </g>
                      ) : (
                        /* Product-Accurate Vector Visual Matching The Actual Stock Item */
                        renderDefaultProductVisual(targetItem, poster)
                      )}
                    </g>

                    {/* 6. CLEAN TYPOGRAPHIC INFORMATION ROW (NO BORDERED BOXES! NO EMOJIS!) */}
                    <g transform="translate(60, 1020)">
                      {/* Hairline Top Divider */}
                      <line
                        x1="40"
                        y1="0"
                        x2="1040"
                        y2="0"
                        stroke={poster.primaryColor}
                        strokeOpacity="0.18"
                        strokeWidth="1.5"
                      />

                      {/* Deal / Offer Callout (Clean, high-legibility bold typography) */}
                      <text
                        x="540"
                        y="50"
                        textAnchor="middle"
                        fill={poster.primaryColor || '#1B3B22'}
                        fontSize="32"
                        fontWeight="900"
                        letterSpacing="1.5"
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        {poster.badge || 'SPECIAL OFFER AVAILABLE IN-STORE'}
                      </text>

                      {/* Hairline Middle Divider */}
                      <line
                        x1="40"
                        y1="85"
                        x2="1040"
                        y2="85"
                        stroke={poster.primaryColor}
                        strokeOpacity="0.18"
                        strokeWidth="1.5"
                      />

                      {/* Clean 3-Column Typographic Schedule / Location Grid */}
                      <g transform="translate(0, 140)">
                        {/* Col 1: Schedule */}
                        <g transform="translate(60, 0)">
                          <text x="0" y="0" fill={poster.mutedTextColor || '#422D1E'} fontSize="16" fontWeight="800" letterSpacing="2">
                            SCHEDULE
                          </text>
                          <text x="0" y="34" fill={poster.textColor || '#1B3B22'} fontSize="22" fontWeight="700">
                            {poster.eventDates ? poster.eventDates.slice(0, 26) : 'Limited Batch Special'}
                          </text>
                        </g>

                        {/* Col 2: Hours */}
                        <g transform="translate(420, 0)">
                          <text x="0" y="0" fill={poster.mutedTextColor || '#422D1E'} fontSize="16" fontWeight="800" letterSpacing="2">
                            HOURS
                          </text>
                          <text x="0" y="34" fill={poster.textColor || '#1B3B22'} fontSize="22" fontWeight="700">
                            {poster.eventTime ? poster.eventTime.slice(0, 24) : 'Regular Store Hours'}
                          </text>
                        </g>

                        {/* Col 3: Location */}
                        <g transform="translate(760, 0)">
                          <text x="0" y="0" fill={poster.mutedTextColor || '#422D1E'} fontSize="16" fontWeight="800" letterSpacing="2">
                            LOCATION
                          </text>
                          <text x="0" y="34" fill={poster.textColor || '#1B3B22'} fontSize="22" fontWeight="700">
                            {poster.location ? poster.location.slice(0, 26) : `${businessName} Store`}
                          </text>
                        </g>
                      </g>
                    </g>

                    {/* 7. FOOTER MOTTO & BADGES */}
                    <g transform="translate(60, 1380)">
                      {/* Starburst Glyph */}
                      <g transform="translate(70, 0) scale(1.4)">
                        <path
                          d="M 0 -18 L 0 18 M -18 0 L 18 0 M -12 -12 L 12 12 M -12 12 L 12 -12"
                          stroke={poster.primaryColor || '#1B3B22'}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </g>

                      {/* Center Provenance Tagline */}
                      <text
                        x="540"
                        y="6"
                        textAnchor="middle"
                        fill={poster.primaryColor || '#1B3B22'}
                        fontSize="23"
                        fontWeight="800"
                        letterSpacing="3"
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        {poster.productDescription
                          ? poster.productDescription.slice(0, 48).toUpperCase()
                          : 'NATURAL INGREDIENTS • HOUSE RECIPES'}
                      </text>

                      {/* Right Oval Pill Badge: EST. 2026 */}
                      <g transform="translate(930, -18)">
                        <rect
                          x="0"
                          y="0"
                          width="120"
                          height="44"
                          rx="22"
                          fill="none"
                          stroke={poster.primaryColor || '#1B3B22'}
                          strokeWidth="2"
                        />
                        <text
                          x="60"
                          y="28"
                          textAnchor="middle"
                          fill={poster.primaryColor || '#1B3B22'}
                          fontSize="16"
                          fontWeight="800"
                          letterSpacing="1"
                          fontFamily="system-ui, -apple-system, sans-serif"
                        >
                          EST. 2026
                        </text>
                      </g>
                    </g>

                    {/* 8. HIGH-CONTRAST CLEAN CALL TO ACTION FOOTER BAR (NO EMOJIS!) */}
                    <g transform="translate(60, 1460)">
                      <rect
                        x="40"
                        y="0"
                        width="1000"
                        height="85"
                        rx="18"
                        fill={poster.primaryColor || '#1B3B22'}
                      />
                      <text
                        x="540"
                        y="52"
                        textAnchor="middle"
                        fill={poster.backgroundColor || '#F9F7ED'}
                        fontSize="28"
                        fontWeight="900"
                        letterSpacing="3"
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        {poster.callToAction || 'VISIT IN-STORE TODAY TO REDEEM'}
                      </text>
                    </g>

                    {/* Fine Print Note */}
                    <g transform="translate(600, 1590)">
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        fill={poster.mutedTextColor || '#422D1E'}
                        fontSize="15"
                        fontWeight="500"
                        opacity="0.75"
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        {poster.finePrint || '*Handcrafted daily with fresh locally sourced ingredients. While supplies last.'}
                      </text>
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* TAB 2: Clean Social Caption (Ready to Copy for Telegram, FB, Instagram)   */
            /* ========================================================================= */
            <div className="flex flex-col gap-4 max-w-2xl mx-auto py-4">
              <div className="p-4 rounded-xl border border-border/70 bg-card shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Copyable Campaign Post Text
                  </span>
                  <Button
                    size="sm"
                    onClick={handleCopyCaption}
                    className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                  >
                    {copiedCaption ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCaption ? 'Copied!' : 'Copy Caption'}</span>
                  </Button>
                </div>
                <div className="p-4 rounded-lg bg-muted/40 border border-border/50 text-xs font-mono leading-relaxed whitespace-pre-wrap select-all">
                  {caption}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
