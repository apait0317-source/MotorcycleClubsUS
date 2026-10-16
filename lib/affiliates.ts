/**
 * Affiliate configuration. This is the only file that changes when a tag
 * rotates or a second program (Impact, AvantLink) is added.
 *
 * Amazon Associates: links go to Amazon search results so they never dead-end
 * on a retired ASIN. No prices are shown; the Operating Agreement only permits
 * prices pulled live from the Product Advertising API.
 */
export const AMAZON_AFFILIATE_TAG = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || 'usamotorcycle-20';

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
    description: 'DOT and ECE rated full-face helmets for street and touring riders',
    searchTerm: 'full face motorcycle helmet DOT ECE',
    category: 'Helmets',
  },
  {
    name: 'Armored riding jackets',
    description: 'CE-rated armor in leather and textile for all-season riding',
    searchTerm: 'armored motorcycle jacket CE',
    category: 'Jackets',
  },
  {
    name: 'Riding gloves',
    description: 'Full-grain leather gloves with knuckle protection',
    searchTerm: 'leather motorcycle gloves knuckle protection',
    category: 'Gloves',
  },
  {
    name: 'Helmet intercoms',
    description: 'Bluetooth and mesh headsets for group rides',
    searchTerm: 'motorcycle helmet bluetooth intercom mesh',
    category: 'Communication',
  },
];

export function amazonSearchUrl(term: string, tag: string = AMAZON_AFFILIATE_TAG): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(term)}&tag=${encodeURIComponent(tag)}`;
}
