export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/** Pass `source` ("Google") to name where the reviews were written. */
export function formatReviews(reviews: number, source?: string): string {
  if (reviews === 0) return 'No reviews';
  const noun = source ? `${source} review` : 'review';
  return reviews === 1 ? `1 ${noun}` : `${reviews} ${noun}s`;
}

export function getStateName(stateCode: string): string {
  const stateNames: Record<string, string> = {
    'al': 'Alabama', 'ak': 'Alaska', 'az': 'Arizona', 'ar': 'Arkansas',
    'ca': 'California', 'co': 'Colorado', 'ct': 'Connecticut', 'de': 'Delaware',
    'fl': 'Florida', 'ga': 'Georgia', 'hi': 'Hawaii', 'id': 'Idaho',
    'il': 'Illinois', 'in': 'Indiana', 'ia': 'Iowa', 'ks': 'Kansas',
    'ky': 'Kentucky', 'la': 'Louisiana', 'me': 'Maine', 'md': 'Maryland',
    'ma': 'Massachusetts', 'mi': 'Michigan', 'mn': 'Minnesota', 'ms': 'Mississippi',
    'mo': 'Missouri', 'mt': 'Montana', 'ne': 'Nebraska', 'nv': 'Nevada',
    'nh': 'New Hampshire', 'nj': 'New Jersey', 'nm': 'New Mexico', 'ny': 'New York',
    'nc': 'North Carolina', 'nd': 'North Dakota', 'oh': 'Ohio', 'ok': 'Oklahoma',
    'or': 'Oregon', 'pa': 'Pennsylvania', 'pr': 'Puerto Rico', 'ri': 'Rhode Island', 'sc': 'South Carolina',
    'sd': 'South Dakota', 'tn': 'Tennessee', 'tx': 'Texas', 'ut': 'Utah',
    'vt': 'Vermont', 'va': 'Virginia', 'wa': 'Washington', 'wv': 'West Virginia',
    'wi': 'Wisconsin', 'wy': 'Wyoming', 'dc': 'District of Columbia'
  };
  return stateNames[stateCode.toLowerCase()] || stateCode.toUpperCase();
}

export function capitalizeCity(city: string): string {
  return city
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/** "A", "A and B", or "A, B, and C". */
export function joinNames(items: string[]): string {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

/** Lowercases an initial capital for mid-sentence use; acronyms such as "MC" stay as they are. */
export function lowerFirst(text: string): string {
  if (!text || /^[A-Z]{2}/.test(text)) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export const SITE_NAME = 'US Motorcycle Clubs';
export const SITE_TAGLINE = 'Find Motorcycle Clubs Near You';
export const SITE_DESCRIPTION =
  'Directory of motorcycle clubs, riding clubs, and veteran MCs across the United States. Browse by state or city, find contact details, and learn how to join.';
// Canonical origin. Override with NEXT_PUBLIC_SITE_URL if the primary domain changes.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.usmotorcycleclubs.com').replace(/\/$/, '');
