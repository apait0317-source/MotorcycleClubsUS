import type { Club } from './types';

// Explicit allowlist: editorial review metadata must never cross into client props.
export type PublicClub = Pick<Club,
  'place_id' | 'name' | 'reviews' | 'rating' | 'featured_image' | 'main_category' |
  'address' | 'City' | 'State' | 'stateName' | 'slug' | 'images'> & { summary?: string; directoryHref?: string };

// Receives eligible, projected records from the server; imports no private data.
export function filterPublicClubs(clubs: PublicClub[], query: string, stateCode?: string): PublicClub[] {
  const q = query.toLowerCase();
  const state = (stateCode || '').toLowerCase();
  return clubs.filter((club) => (!state || club.State === state) &&
    [club.name, club.City, club.stateName, club.address].some((value) => value.toLowerCase().includes(q)));
}
