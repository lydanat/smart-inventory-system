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

    // Sample 5x5 pixel patches at 4 corners
    const sampleCorner = (cx: number, cy: number): [number, number, number] => {
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const px = Math.min(w - 1, Math.max(0, cx + dx));
          const py = Math.min(h - 1, Math.max(0, cy + dy));
          const idx = (py * w + px) * 4;
          rSum += data[idx];
          gSum += data[idx + 1];
          bSum += data[idx + 2];
          count++;
        }
      }
      return [rSum / count, gSum / count, bSum / count];
    };

    const tl = sampleCorner(4, 4);
    const tr = sampleCorner(w - 5, 4);
    const bl = sampleCorner(4, h - 5);
    const br = sampleCorner(w - 5, h - 5);

    // Bilinear background color estimator
    const getExpectedBg = (x: number, y: number): [number, number, number] => {
      const u = w > 1 ? x / (w - 1) : 0;
      const v = h > 1 ? y / (h - 1) : 0;
      const topR = tl[0] * (1 - u) + tr[0] * u;
      const topG = tl[1] * (1 - u) + tr[1] * u;
      const topB = tl[2] * (1 - u) + tr[2] * u;
      const botR = bl[0] * (1 - u) + br[0] * u;
      const botG = bl[1] * (1 - u) + br[1] * u;
      const botB = bl[2] * (1 - u) + br[2] * u;
      return [
        topR * (1 - v) + botR * v,
        topG * (1 - v) + botG * v,
        topB * (1 - v) + botB * v,
      ];
    };

    const colorDist = (r: number, g: number, b: number, exp: [number, number, number]) => {
      return Math.hypot(r - exp[0], g - exp[1], b - exp[2]);
    };

    const visited = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let qStart = 0;
    let qEnd = 0;

    // SELECTIVE BORDER SEEDING:
    // Only seed borders that match the background color (protects bottle caps, bases, and edges)
    const seedThreshold = tolerance + 16;

    for (let x = 0; x < w; x++) {
      const iTop = x * 4;
      const expTop = getExpectedBg(x, 0);
      if (colorDist(data[iTop], data[iTop + 1], data[iTop + 2], expTop) <= seedThreshold) {
        queue[qEnd++] = x;
      }
      const pBot = (h - 1) * w + x;
      const iBot = pBot * 4;
      const expBot = getExpectedBg(x, h - 1);
      if (colorDist(data[iBot], data[iBot + 1], data[iBot + 2], expBot) <= seedThreshold) {
        queue[qEnd++] = pBot;
      }
    }
    for (let y = 1; y < h - 1; y++) {
      const pL = y * w;
      const iL = pL * 4;
      const expL = getExpectedBg(0, y);
      if (colorDist(data[iL], data[iL + 1], data[iL + 2], expL) <= seedThreshold) {
        queue[qEnd++] = pL;
      }
      const pR = y * w + (w - 1);
      const iR = pR * 4;
      const expR = getExpectedBg(w - 1, y);
      if (colorDist(data[iR], data[iR + 1], data[iR + 2], expR) <= seedThreshold) {
        queue[qEnd++] = pR;
      }
    }

    const feather = 10;
    while (qStart < qEnd) {
      const p = queue[qStart++];
      if (visited[p]) continue;
      visited[p] = 1;

      const x = p % w;
      const y = Math.floor(p / w);
      const idx = p * 4;
      const exp = getExpectedBg(x, y);
      const dist = colorDist(data[idx], data[idx + 1], data[idx + 2], exp);

      if (dist <= tolerance + feather) {
        if (dist <= tolerance) {
          data[idx + 3] = 0;
        } else {
          const factor = (dist - tolerance) / feather;
          data[idx + 3] = Math.round(Math.min(255, Math.max(0, factor * 255)));
        }

        if (dist <= tolerance + 6) {
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
