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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
  Sparkles,
  Store,
  Tag,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';
import type { MarketingItem } from '@/lib/validation/ai';

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
  businessName = 'My Store',
}: SocialCampaignDialogProps) {
  const [copiedCaption, setCopiedCaption] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const svgRef = React.useRef<SVGSVGElement>(null);

  if (!campaign) return null;

  const targetItem = campaign.targetItemNames?.[0] || 'Special Item';
  const promoBadge = campaign.promoBadge || 'SPECIAL OFFER';
  const headline = campaign.posterHeadline || campaign.title.toUpperCase();
  const cta = campaign.callToAction || 'Visit in-store today or message our page to reserve!';

  // Format Facebook Caption if not already generated
  const caption =
    campaign.facebookCaption ||
    `🔥 ${headline} 🔥\n\n${campaign.idea}\n\n👉 Featured Item: ${targetItem}\n🏷️ Deal: ${campaign.sampleMessage}\n\n📍 ${cta}\n\n#SpecialOffer #ShopLocal #${targetItem.replace(/[^a-zA-Z0-9]/g, '')} #Deals`;

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopiedCaption(true);
      toast.success('Facebook post caption copied to clipboard!');
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch {
      toast.error('Unable to copy caption');
    }
  };

  const handleDownloadPoster = () => {
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
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(image, 0, 0, 1080, 1080);
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `${targetItem.toLowerCase().replace(/\s+/g, '-')}-promo-poster.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(blobURL);
          toast.success('Promotional poster downloaded successfully (1080x1080 PNG)!');
        }
        setIsDownloading(false);
      };
      image.src = blobURL;
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Could not download poster');
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden border border-border/80 rounded-xl shadow-2xl">
        <DialogHeader className="p-4 sm:p-5 border-b border-border/40 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <span>Social Media Campaign Kit</span>
                  <Badge variant="outline" className="text-[10px] uppercase font-semibold text-blue-600 border-blue-500/30">
                    Facebook & Instagram
                  </Badge>
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ready-to-post Facebook caption and high-res promotional flyer graphic.
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <Tabs defaultValue="caption" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-9 p-1 bg-muted/60 rounded-lg">
              <TabsTrigger value="caption" className="text-xs font-semibold gap-1.5">
                <span>Facebook Post Caption</span>
              </TabsTrigger>
              <TabsTrigger value="poster" className="text-xs font-semibold gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Visual Promotional Poster</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Facebook Post Caption */}
            <TabsContent value="caption" className="space-y-4 pt-3">
              {/* Facebook Feed Post Mockup Card */}
              <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-sm">
                {/* Mock Facebook Header */}
                <div className="p-3.5 flex items-center gap-3 border-b border-border/40 bg-muted/10">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {businessName.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground leading-none">{businessName}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                      <span>Just now</span> • <span>🌎</span>
                    </p>
                  </div>
                </div>

                {/* Caption Body */}
                <div className="p-4 font-sans text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed select-all bg-muted/5">
                  {caption}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
                <Button
                  onClick={handleCopyCaption}
                  className="w-full sm:w-auto h-9 gap-1.5 font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm"
                >
                  {copiedCaption ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCaption ? 'Copied to Clipboard!' : 'Copy Full Facebook Caption'}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full sm:w-auto h-9 gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
                    <span>Open Facebook</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              </div>
            </TabsContent>

            {/* TAB 2: Visual Promotional Poster */}
            <TabsContent value="poster" className="space-y-4 pt-3">
              <div className="flex items-center justify-center bg-muted/20 p-2 sm:p-4 rounded-xl border border-border/60">
                {/* Scalable High-Res SVG Poster Graphic (1080x1080 Aspect Ratio) */}
                <div className="w-full max-w-[340px] aspect-square rounded-xl overflow-hidden shadow-xl ring-1 ring-border/80">
                  <svg
                    ref={svgRef}
                    viewBox="0 0 1080 1080"
                    width="100%"
                    height="100%"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="posterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0f172a" />
                        <stop offset="50%" stopColor="#1e1b4b" />
                        <stop offset="100%" stopColor="#311042" />
                      </linearGradient>
                      <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f43f5e" />
                        <stop offset="100%" stopColor="#fb7185" />
                      </linearGradient>
                      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>

                    {/* Dark Premium Gradient Background */}
                    <rect width="1080" height="1080" fill="url(#posterGrad)" />

                    {/* Decorative Geometric Rings */}
                    <circle cx="540" cy="540" r="460" fill="none" stroke="#6366f1" strokeWidth="2" opacity="0.2" />
                    <circle cx="540" cy="540" r="500" fill="none" stroke="#ec4899" strokeWidth="2" opacity="0.15" />

                    {/* Store Header */}
                    <rect x="140" y="80" width="800" height="70" rx="35" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" />
                    <text x="540" y="126" textAnchor="middle" fill="#f8fafc" fontSize="32" fontWeight="700" fontFamily="system-ui, sans-serif" letterSpacing="4">
                      {businessName.toUpperCase()} • OFFICIAL OFFER
                    </text>

                    {/* Deal Badge */}
                    <g transform="translate(540, 260)">
                      <rect x="-240" y="-45" width="480" height="90" rx="45" fill="url(#badgeGrad)" />
                      <text x="0" y="16" textAnchor="middle" fill="#ffffff" fontSize="42" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="3">
                        ⚡ {promoBadge.toUpperCase()}
                      </text>
                    </g>

                    {/* Main Headline */}
                    <text x="540" y="420" textAnchor="middle" fill="#fbbf24" fontSize="62" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="2">
                      {headline.length > 25 ? headline.slice(0, 25) + '...' : headline}
                    </text>

                    {/* Product Box */}
                    <rect x="120" y="480" width="840" height="260" rx="32" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" />
                    <text x="540" y="570" textAnchor="middle" fill="#ffffff" fontSize="52" fontWeight="800" fontFamily="system-ui, sans-serif">
                      {targetItem}
                    </text>
                    <text x="540" y="650" textAnchor="middle" fill="#cbd5e1" fontSize="30" fontWeight="500" fontFamily="system-ui, sans-serif">
                      {campaign.sampleMessage.slice(0, 60)}
                    </text>

                    {/* Urgency Pill */}
                    <rect x="290" y="790" width="500" height="60" rx="30" fill="rgba(244,63,94,0.18)" stroke="#f43f5e" strokeWidth="2" />
                    <text x="540" y="832" textAnchor="middle" fill="#fda4af" fontSize="26" fontWeight="700" fontFamily="system-ui, sans-serif">
                      ⏳ LIMITED TIME • WHILE SUPPLIES LAST
                    </text>

                    {/* Store CTA Footer */}
                    <rect x="80" y="890" width="920" height="110" rx="28" fill="url(#goldGrad)" />
                    <text x="540" y="960" textAnchor="middle" fill="#0f172a" fontSize="36" fontWeight="900" fontFamily="system-ui, sans-serif">
                      {cta.length > 42 ? cta.slice(0, 42) + '...' : cta}
                    </text>
                  </svg>
                </div>
              </div>

              {/* Download Action */}
              <div className="flex items-center justify-between pt-1">
                <Button
                  onClick={handleDownloadPoster}
                  disabled={isDownloading}
                  className="w-full h-9 gap-1.5 font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Generating 1080x1080 PNG...' : 'Download Poster (1080x1080 PNG)'}</span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
