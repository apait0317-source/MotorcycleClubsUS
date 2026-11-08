/**
 * Affiliate tags, shopping categories and contextual guide placements.
 * A second merchant also needs destination/label support in AffiliateSection.
 *
 * Amazon Associates: links go to Amazon search results so they never dead-end
 * on a retired ASIN. No prices are shown; the Operating Agreement only permits
 * prices pulled live from the Product Advertising API.
 */
export const AMAZON_AFFILIATE_TAG = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || 'usamotorcycle-20';

export const AFFILIATE_PLACEMENTS = ['home_strip', 'guide_inline', 'club_sidebar', 'city_sidebar'] as const;
export type AffiliatePlacement = typeof AFFILIATE_PLACEMENTS[number];

// Use only tracking IDs created in the existing Amazon Associates account.
// Unconfigured placements continue using the existing account-wide tag.
export function amazonTagForPlacement(placement: AffiliatePlacement): string {
  const tags: Record<AffiliatePlacement, string | undefined> = {
    home_strip: process.env.NEXT_PUBLIC_AMAZON_TAG_HOME,
    guide_inline: process.env.NEXT_PUBLIC_AMAZON_TAG_GUIDES,
    club_sidebar: process.env.NEXT_PUBLIC_AMAZON_TAG_CLUBS,
    city_sidebar: process.env.NEXT_PUBLIC_AMAZON_TAG_CITIES,
  };
  return tags[placement]?.trim() || AMAZON_AFFILIATE_TAG;
}

/** rel value for every outbound affiliate link. */
export const AFFILIATE_REL = 'noopener noreferrer sponsored';

export const AFFILIATE_DISCLOSURE = 'As an Amazon Associate, we earn from qualifying purchases.';

export type AffiliateCategory = 'Helmets' | 'Jackets' | 'Gloves' | 'Communication';

export interface AffiliateProduct {
  name: string;
  description: string;
  searchTerm: string;
  category: AffiliateCategory;
}

export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  {
    name: 'Full-face helmets',
    description: 'Compare fit, sizing, and the safety-standard claims for each helmet',
    searchTerm: 'full face motorcycle helmet DOT ECE',
    category: 'Helmets',
  },
  {
    name: 'Armored riding jackets',
    description: 'Compare coverage, fit, weather suitability, and included armor',
    searchTerm: 'armored motorcycle jacket CE',
    category: 'Jackets',
  },
  {
    name: 'Riding gloves',
    description: 'Compare fit, control feel, coverage, and stated materials',
    searchTerm: 'leather motorcycle gloves knuckle protection',
    category: 'Gloves',
  },
  {
    name: 'Helmet intercoms',
    description: 'Compare helmet fit, pairing compatibility, and controls for your group',
    searchTerm: 'motorcycle helmet bluetooth intercom mesh',
    category: 'Communication',
  },
];

export function amazonSearchUrl(term: string, tag: string = AMAZON_AFFILIATE_TAG): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(term)}&tag=${encodeURIComponent(tag)}`;
}

interface GuideAffiliateOffer {
  afterHeading: string;
  title: string;
  categories: AffiliateCategory[];
}

// Editorial placements are explicit: mentioning clubs alone is not a reason
// to insert shopping links, and intercoms belong only beside a communication plan.
const GUIDE_AFFILIATE_OFFERS: Record<string, GuideAffiliateOffer> = {
  'how-to-join-a-motorcycle-club': {
    afterHeading: 'Prepare for an invited guest ride',
    title: 'Compare guest-ride gear categories',
    categories: ['Helmets', 'Gloves'],
  },
  'motorcycle-rallies-and-events': {
    afterHeading: 'Planning a first rally',
    title: 'Compare gear categories for the trip',
    categories: ['Jackets', 'Gloves'],
  },
  'group-riding-safety': {
    afterHeading: 'Communication and a backup plan',
    title: 'Compare intercom options if your group uses them',
    categories: ['Communication'],
  },
  'best-motorcycle-roads-in-the-us': {
    afterHeading: 'Riding them with a club',
    title: 'Compare gear categories for your route',
    categories: ['Helmets', 'Jackets', 'Gloves'],
  },
};

export function getGuideAffiliateOffer(slug: string): {
  afterHeading: string;
  title: string;
  products: AffiliateProduct[];
} | undefined {
  const offer = Object.hasOwn(GUIDE_AFFILIATE_OFFERS, slug) ? GUIDE_AFFILIATE_OFFERS[slug] : undefined;
  if (!offer) return undefined;
  return {
    afterHeading: offer.afterHeading,
    title: offer.title,
    products: AFFILIATE_PRODUCTS.filter(product => offer.categories.includes(product.category)),
  };
}
