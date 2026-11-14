import type { Club, ClubEnrichment, State, City } from './types';
import { getStateName } from './utils';

export function isReviewedCity(city: string, state: string): boolean {
  const normalized = city.trim().toLowerCase();
  const stateName = getStateName(state).toLowerCase();
  return /[a-z]/i.test(normalized) && !/[\d<>/\n]/.test(normalized)
    && !/\b(county|region|regional|statewide|undisclosed|unknown)\b/.test(normalized)
    && !['north', 'south', 'east', 'west', 'central', 'northern', 'southern', 'eastern', 'western', ''].some(
      prefix => normalized === `${prefix} ${stateName}`.trim());
}

export function applyReviewedLocation(club: Club, location: NonNullable<ClubEnrichment['changes']['location']>, states: State[] = []): Club {
  const city = location.city.trim();
  const moved = club.State !== location.state || club.City.trim().toLowerCase() !== city.toLowerCase();
  return { ...club, City: city, State: location.state,
    stateName: states.find(state => state.code === location.state)?.name ?? getStateName(location.state),
    citySlug: city.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    address: location.address ?? (moved ? '' : club.address),
    link: moved && /^https?:\/\/(?:www\.)?google\.com\/maps\//i.test(club.link) ? '' : club.link,
  };
}

// Preserve old routes while adding municipalities established by reviewed corrections.
export function deriveDirectoryCities(records: Club[], imported: City[]): City[] {
  const byKey = new Map(imported.map(city => [`${city.state}/${city.slug}`, { ...city, clubCount: 0 }]));
  for (const club of records) {
    const key = `${club.State}/${club.citySlug}`;
    const city = byKey.get(key) ?? { name: club.City, slug: club.citySlug, state: club.State, stateName: club.stateName, clubCount: 0 };
    city.clubCount++;
    byKey.set(key, city);
  }
  return [...byKey.values()];
}
