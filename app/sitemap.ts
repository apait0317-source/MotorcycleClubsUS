import { MetadataRoute } from 'next';
import { getAllClubs, getAllStates, getAllCities } from '@/lib/data';
import { SITE_URL } from '@/lib/utils';

export default function sitemap(): MetadataRoute.Sitemap {
  const clubs = getAllClubs();
  const states = getAllStates();
  const cities = getAllCities();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/states`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/cities`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // State pages
  const statePages: MetadataRoute.Sitemap = states.map((state) => ({
    url: `${SITE_URL}/state/${state.code}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // City pages
  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${SITE_URL}/city/${city.state}/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Club pages
  const clubPages: MetadataRoute.Sitemap = clubs.map((club) => ({
    url: `${SITE_URL}/clubs/${club.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...statePages, ...cityPages, ...clubPages];
}
