import { load } from 'cheerio';
import { getStateName } from '../../lib/utils';

export interface RawRiderClub {
  name: string;
  city: string;
  state: string;
  stateCode: string;
  address: string;
  description: string;
  ridingStyle: string;
  interests: string;
  status: string;
  sourceUrl: string;
}

const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): string => typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';

function detailUrl(value: unknown): string | undefined {
  if (!text(value)) return;
  try {
    const url = new URL(text(value), 'https://www.riderclubs.com');
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port
      || !['www.riderclubs.com', 'riderclubs.com'].includes(url.hostname)
      || !/^\/club\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/.test(url.pathname)) return;
    return `https://www.riderclubs.com${url.pathname.replace(/\/$/, '')}`;
  } catch { return; }
}

// Nearby results can be in another city or state. Only an entity's own
// explicit US address can place it; page headings and prose are not entities.
export function parseRiderClubListings(html: string): RawRiderClub[] {
  const $ = load(html);
  const clubs = new Map<string, RawRiderClub>();
  function visit(value: unknown): void {
    if (Array.isArray(value)) { value.forEach(visit); return; }
    if (!object(value)) return;
    const types = (Array.isArray(value['@type']) ? value['@type'] : [value['@type']]).map(text);
    if (value['@graph']) visit(value['@graph']);
    if (types.includes('ItemList')) visit(value.itemListElement);
    if (types.includes('ListItem')) visit(value.item);
    if (!types.some(type => ['Organization', 'SportsClub'].includes(type))) return;
    const sourceUrl = detailUrl(value.url);
    const name = text(value.name);
    const location = object(value.location) ? value.location : undefined;
    const address = object(value.address) ? value.address : location && object(location.address) ? location.address : undefined;
    if (!sourceUrl || !name || name.length > 200 || /[<>]/.test(name) || !address) return;
    const city = text(address.addressLocality);
    const stateCode = text(address.addressRegion).toLowerCase();
    const state = getStateName(stateCode);
    const country = text(object(address.addressCountry) ? address.addressCountry.name : address.addressCountry).toUpperCase();
    if (!city || !/^[a-z]{2}$/.test(stateCode) || state === stateCode.toUpperCase()
      || !['US', 'USA', 'UNITED STATES', 'UNITED STATES OF AMERICA'].includes(country)) return;
    if (clubs.has(sourceUrl)) return;
    const postal = text(address.postalCode);
    const locality = `${city}, ${stateCode.toUpperCase()}${postal ? ` ${postal}` : ''}`;
    clubs.set(sourceUrl, {
      name, city, state, stateCode,
      address: [text(address.streetAddress), locality].filter(Boolean).join(', '),
      description: text(value.description),
      ridingStyle: '', interests: '', status: '', sourceUrl,
    });
  }
  $('script[type="application/ld+json"]').each((_, element) => {
    try { visit(JSON.parse($(element).html() || '')); }
    catch { /* A malformed block must not discard another valid listing. */ }
  });
  return [...clubs.values()];
}
