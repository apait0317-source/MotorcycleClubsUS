import { MetadataRoute } from 'next';
import { getIndexableClubs, getIndexableStates, getIndexableCities } from '@/lib/data';
import { guides } from '@/lib/guides';
import { CHAPTER_ORGS } from '@/lib/chapter-orgs';
import { SITE_URL } from '@/lib/utils';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' }[] = [
    { path: '', priority: 1, changeFrequency: 'weekly' },
    { path: '/states', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/cities', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/guides', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/contact', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/submit', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/disclaimer', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
  ];

  const staticPages: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  const guidePages: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${SITE_URL}/guides/${guide.slug}`,
    lastModified: new Date(guide.updated),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // One hub per national organization, in place of a page per chapter.
  // Hubs that list only names and cities are noindex and stay out of it.
  const chapterHubs: MetadataRoute.Sitemap = CHAPTER_ORGS.filter((org) => org.index).map((org) => ({
    url: `${SITE_URL}/chapters/${org.slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Only states with at least one listable club; an empty hub is noindex.
  const statePages: MetadataRoute.Sitemap = getIndexableStates().map((state) => ({
    url: `${SITE_URL}/state/${state.code}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Only cities with enough clubs to stand on their own.
  const cityPages: MetadataRoute.Sitemap = getIndexableCities().map((city) => ({
    url: `${SITE_URL}/city/${city.state}/${city.slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Only clubs with enough public detail to stand alone; the rest are noindex.
  const clubPages: MetadataRoute.Sitemap = getIndexableClubs().map((club) => ({
    url: `${SITE_URL}/clubs/${club.slug}`,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticPages, ...guidePages, ...chapterHubs, ...statePages, ...cityPages, ...clubPages];
}
