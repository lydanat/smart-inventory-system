import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Smart Inventory AI',
    short_name: 'SmartInventory',
    description:
      'Autonomous multi-tenant inventory management system with Telegram alerts and Gemini AI advice.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#422D1E',
    theme_color: '#422D1E',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
