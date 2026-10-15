import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Google's AdSense crawler must see every page that carries ads.
      { userAgent: 'Mediapartners-Google', allow: '/' },
      {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/search',
        '/dashboard/',
        '/admin/',
        '/login',
        '/register',
        '/claim/',
        '/submit-club',
      ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
