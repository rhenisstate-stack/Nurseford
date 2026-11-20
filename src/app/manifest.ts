import type { MetadataRoute } from 'next';
import { APP_NAME, APP_DESCRIPTION } from '@/lib/config/config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} Nursing Exam Preparation`,
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#1E3A8A',
    icons: [
      {
        src: '/logo/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
