'use server';

import { withAuth } from '@/lib/security/action-wrapper';
import {
  generatePosterInputSchema,
  removeBackgroundInputSchema,
  type PosterDesign,
} from '@/lib/validation/poster';
import { generatePosterDesign } from '@/lib/services/poster';
import sharp from 'sharp';

export const generatePosterAction = withAuth(
  {
    schema: generatePosterInputSchema,
    requiredRole: ['owner', 'manager', 'staff'],
    maxRequestsPerMinute: 20,
    rateLimitKey: (ctx) => `poster-generate:${ctx.businessId}`,
  },
  async (input): Promise<PosterDesign> => {
    return generatePosterDesign(input);
  }
);

export const removeBackgroundAction = withAuth(
  {
    schema: removeBackgroundInputSchema,
    requiredRole: ['owner', 'manager', 'staff'],
    maxRequestsPerMinute: 30,
    rateLimitKey: (ctx) => `poster-bg-remove:${ctx.businessId}`,
  },
  async (input): Promise<{ cutoutDataUrl: string }> => {
    const rawData = input.imageData.replace(/^data:image\/\w+;base64,/, '');
    const imgBuffer = Buffer.from(rawData, 'base64');
    const tolerance = input.tolerance || 45;

    const { data, info } = await sharp(imgBuffer)
      .resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width: w, height: h } = info;

    // Sample boundary coordinates
    const points = [
      [4, 4], [w - 5, 4], [4, h - 5], [w - 5, h - 5],
      [Math.floor(w / 2), 4], [Math.floor(w / 2), h - 4],
      [4, Math.floor(h / 2)], [w - 5, Math.floor(h / 2)]
    ];

    let bgR = 0, bgG = 0, bgB = 0;
    for (const [x, y] of points) {
      const idx = (y * w + x) * 4;
      bgR += data[idx];
      bgG += data[idx + 1];
      bgB += data[idx + 2];
    }
    bgR /= points.length;
    bgG /= points.length;
    bgB /= points.length;

    const visited = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let qStart = 0;
    let qEnd = 0;

    for (let x = 0; x < w; x++) {
      queue[qEnd++] = x;
      queue[qEnd++] = (h - 1) * w + x;
    }
    for (let y = 1; y < h - 1; y++) {
      queue[qEnd++] = y * w;
      queue[qEnd++] = y * w + (w - 1);
    }

    const feather = 12;
    while (qStart < qEnd) {
      const p = queue[qStart++];
      if (visited[p]) continue;
      visited[p] = 1;

      const idx = p * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

      if (dist <= tolerance + feather) {
        if (dist <= tolerance) {
          data[idx + 3] = 0;
        } else {
          const factor = (dist - tolerance) / feather;
          data[idx + 3] = Math.round(Math.min(255, Math.max(0, factor * 255)));
        }

        if (dist <= tolerance + 6) {
          const x = p % w;
          const y = Math.floor(p / w);
          if (x > 0 && !visited[p - 1]) queue[qEnd++] = p - 1;
          if (x < w - 1 && !visited[p + 1]) queue[qEnd++] = p + 1;
          if (y > 0 && !visited[p - w]) queue[qEnd++] = p - w;
          if (y < h - 1 && !visited[p + w]) queue[qEnd++] = p + w;
        }
      }
    }

    const pngBuf = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
      .png({ quality: 90, compressionLevel: 7 })
      .toBuffer();

    return { cutoutDataUrl: 'data:image/png;base64,' + pngBuf.toString('base64') };
  }
);
