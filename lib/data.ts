import { Club, State, City } from './types';
import clubsData from '@/data/clubs.json';
import statesData from '@/data/states.json';
import citiesData from '@/data/cities.json';
import { clubHasImages } from './images';
import { CHAPTER_ORGS, chapterOrgForId } from './chapter-orgs';

// Deduplicate by slug at load time. A handful of source rows share a slug;
// only the first is routable, so the rest are dropped everywhere.
function dedupeBySlug(list: Club[]): Club[] {
  const seen = new Set<string>();
  return list.filter((club) => {
    if (seen.has(club.slug)) return false;
    seen.add(club.slug);
    return true;
  });
}

export const clubs: Club[] = dedupeBySlug(clubsData as Club[]);
export const states: State[] = statesData as State[];
export const cities: City[] = citiesData as City[];

// City pages with fewer clubs than this are served but marked noindex and
// left out of the sitemap. They duplicate the single club page beneath them.
export const MIN_CITY_CLUBS_FOR_INDEX = 2;

// Categories to EXCLUDE - these are NOT motorcycle clubs
const EXCLUDED_CATEGORIES = new Set([
  // Bars & Nightlife
  'Bar', 'Bar & grill', 'Nightclub', 'Dance club', 'Gay bar',
  'Lounge', 'Cocktail bar', 'Bar PMU', 'Sports bar', 'Dive bar',
  'Wine bar', 'Pub', 'Irish pub', 'Biker bar',

  // Food & Beverage
  'Restaurant', 'Café', 'Coffee shop', 'American restaurant',
  'Hamburger restaurant', 'Pizza restaurant', 'Fast food restaurant',

  // Schools & Training
  'Driving school', 'Motorcycle driving school', 'Training centre',
  'Motorcycle training school',

  // Fitness & Cycling (bicycles, not motorcycles)
  'Bicycle club', 'Fitness center', 'Gym', 'Cycling club',
  'Indoor cycling', 'Spinning',

  // Entertainment
  'Adult entertainment club', 'Amusement center', 'Entertainment center',
  'Event venue',

  // Racing venues (not clubs)
  'Racecourse', 'Off-road racing venue', 'Off roading area',
  'Race track', 'Motorsports venue', 'Car racing venue',

  // Retail & Services
  'Motorcycle dealer', 'Motorcycle shop', 'Motorcycle repair shop',
  'Harley-Davidson dealer', 'Motorcycle parts store',
  'Auto repair shop', 'Garage', 'Store', 'Clothing store',
  'Car dealer', 'Auto parts store', 'Corporate office',

  // Religious
  'Church', 'Place of worship', 'Religious organization',

  // Other non-club categories
  'Tour operator', 'Transportation service', 'Rental agency',
  'Hotel', 'Motel', 'Campground', 'RV park',
  'Training center', 'Event planner', 'Event management company', 'Party planner',
  'Sports complex', 'Sports activity location', 'Sports school', 'Martial arts school',
  'Christian church', 'Church of the Nazarene', 'Religious institution', 'Religious destination',
  'Mechanic', 'Warehouse', 'Housing complex', 'Consultant', 'Professional services',
  'Home and construction', 'Automobile storage facility', 'Education center',
  'Fire station', 'Radio broadcaster', 'Scout hall', 'Auditorium', 'Art gallery',
  'Horse riding field', 'Outdoor activity organiser', 'Festival', 'Tourist attraction',
  'Playground', 'Park', 'Memorial park', 'Historical landmark', 'Rodeo', 'Veterinary care',
  'Adventure sports center',
]);

// Check if a club is actually a motorcycle club (not a bar, school, etc.)
export function isMotorcycleClub(club: Club): boolean {
  const category = club.main_category?.trim() || '';

  // If category is empty, include it (benefit of the doubt)
  if (!category) return true;

  // Check if the category is in the excluded list
  return !EXCLUDED_CATEGORIES.has(category);
}

// Get only valid motorcycle clubs
export function getMotorcycleClubs(): Club[] {
  return clubs.filter(isMotorcycleClub);
}

// ---------------------------------------------------------------------------
// Content depth. A club page is only worth indexing, and only worth linking
// to from listing pages, when it carries enough public detail to stand alone.
// Everything else stays reachable by URL but is noindex and unlinked.
// ---------------------------------------------------------------------------

const AMA_TEMPLATE = /is an AMA-chartered motorcycle organization/i;

export function isTemplateDescription(description?: string): boolean {
  return AMA_TEMPLATE.test(description || '');
}

export function hasOriginalDescription(club: Club): boolean {
  const d = (club.description || '').trim();
  return d.length >= 60 && !isTemplateDescription(d);
}

export function hasStreetAddress(club: Club): boolean {
  return Boolean(club.address) && club.address.split(',').length > 2;
}

export function clubContentScore(club: Club): number {
  let score = 0;
  const d = (club.description || '').trim();
  if (hasOriginalDescription(club)) score += 2;
  else if (d && !isTemplateDescription(d)) score += 1;
  if (club.website) score += 1;
  if (club.phone) score += 1;
  if (clubHasImages(club.place_id)) score += 1;
  if (club.reviews > 0) score += 1;
  if (hasStreetAddress(club)) score += 1;
  return score;
}

export const MIN_CLUB_SCORE_FOR_INDEX = 3;

// A row taken from a national organization's own chapter list (see
// lib/chapter-orgs.ts). Each repeats one organization blurb with a new city, so
// it never gets an indexed page. Its organization's hub page lists it instead.
export function isChapterListing(club: Club): boolean {
  return chapterOrgForId(club.place_id) !== undefined;
}

// Listable: shown as a card on listing pages and linked internally.
export function isListableClub(club: Club): boolean {
  return isMotorcycleClub(club) && !isChapterListing(club) && clubContentScore(club) >= MIN_CLUB_SCORE_FOR_INDEX;
}

// Indexable club pages are exactly the listable ones.
export const isIndexableClub = isListableClub;

// Thin: a real club with too little public detail for its own indexed page.
// Chapter listings are left out: a hub page covers them, so state and city
// pages do not repeat them as unlinked text.
export function isThinClub(club: Club): boolean {
  return isMotorcycleClub(club) && !isListableClub(club) && !isChapterListing(club);
}

export function getIndexableClubs(): Club[] {
  return clubs.filter(isIndexableClub);
}

export function getAllClubs(): Club[] {
  return clubs;
}

// Chapter rows for one organization, ordered by state, then city, then name.
export function getChapterListings(orgSlug: string): Club[] {
  const org = CHAPTER_ORGS.find((o) => o.slug === orgSlug);
  if (!org) return [];
  return clubs
    .filter((club) => club.place_id.startsWith(org.idPrefix) && isMotorcycleClub(club))
    .sort((a, b) =>
      `${a.stateName}|${a.City}|${a.name}`.localeCompare(`${b.stateName}|${b.City}|${b.name}`));
}

export function getClubBySlug(slug: string): Club | undefined {
  return clubs.find(club => club.slug === slug);
}

export function getClubsByState(stateCode: string): Club[] {
  return clubs.filter(club => club.State === stateCode.toLowerCase());
}

export function getClubsByCity(stateCode: string, citySlug: string): Club[] {
  return clubs.filter(
    club => club.State === stateCode.toLowerCase() && club.citySlug === citySlug
  );
}

export function getAllStates(): State[] {
  return states;
}

export function getStateByCode(code: string): State | undefined {
  return states.find(state => state.code === code.toLowerCase());
}

export function getAllCities(): City[] {
  return cities;
}

// A state hub with no listable club has nothing to link to. It stays reachable
// by URL but is noindex and left out of the sitemap and the state grids.
export const MIN_STATE_CLUBS_FOR_INDEX = 1;

export function isIndexableState(state: State): boolean {
  return getListableClubsByState(state.code).length >= MIN_STATE_CLUBS_FOR_INDEX;
}

export function getIndexableStates(): State[] {
  return states.filter(isIndexableState);
}

export function getCitiesByState(stateCode: string): City[] {
  return cities.filter(city => city.state === stateCode.toLowerCase());
}

export function getCityBySlug(stateCode: string, citySlug: string): City | undefined {
  return cities.find(
    city => city.state === stateCode.toLowerCase() && city.slug === citySlug
  );
}

// Number of listable clubs in a city (the cards the city page renders).
export function getCityClubCount(city: City): number {
  return getClubsByCity(city.state, city.slug).filter(isListableClub).length;
}

export function getListableClubsByState(stateCode: string): Club[] {
  return getClubsByState(stateCode).filter(isListableClub);
}

export function getThinClubsByState(stateCode: string): Club[] {
  return getClubsByState(stateCode).filter(isThinClub);
}

export function getListableClubsByCity(stateCode: string, citySlug: string): Club[] {
  return getClubsByCity(stateCode, citySlug).filter(isListableClub);
}

export function getThinClubsByCity(stateCode: string, citySlug: string): Club[] {
  return getClubsByCity(stateCode, citySlug).filter(isThinClub);
}

export function isIndexableCity(city: City): boolean {
  return getCityClubCount(city) >= MIN_CITY_CLUBS_FOR_INDEX;
}

export function getIndexableCities(): City[] {
  return cities.filter(isIndexableCity);
}

export function getFeaturedClubs(limit: number = 12): Club[] {
  return [...clubs]
    .filter(isListableClub)
    .filter(club => club.rating >= 4.5 && club.reviews >= 10)
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, limit);
}

export function getPopularCities(limit: number = 12): City[] {
  return [...cities]
    .map((city) => ({ ...city, clubCount: getCityClubCount(city) }))
    .sort((a, b) => b.clubCount - a.clubCount)
    .slice(0, limit);
}

export function getRelatedClubs(club: Club, limit: number = 6): Club[] {
  return clubs
    .filter(isListableClub)
    .filter(c =>
      c.slug !== club.slug &&
      (c.citySlug === club.citySlug && c.State === club.State)
    )
    .slice(0, limit);
}

export function searchClubs(query: string, stateCode?: string): Club[] {
  const q = query.toLowerCase();
  const state = (stateCode || '').toLowerCase();
  return clubs
    .filter(isMotorcycleClub) // Only search actual motorcycle clubs
    .filter(club => !state || club.State === state)
    .filter(club =>
      club.name.toLowerCase().includes(q) ||
      club.City.toLowerCase().includes(q) ||
      club.stateName.toLowerCase().includes(q) ||
      club.address.toLowerCase().includes(q)
    );
}

export function getTopRatedClubs(limit: number = 8): Club[] {
  return [...clubs]
    .filter(isListableClub)
    .filter(club => club.rating > 0 && club.reviews >= 5)
    .sort((a, b) => {
      // Sort by rating first, then by review count
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviews - a.reviews;
    })
    .slice(0, limit);
}

// A stable selection for the home page. The data has no "added" date, so this
// is not a recency list and must not be labelled as one. It takes listable
// clubs from the end of the file so it differs from the rating-sorted lists.
export function getExploreClubs(limit: number = 8): Club[] {
  return [...clubs].filter(isListableClub).reverse().slice(0, limit);
}

// Filter clubs to only those with images
export function filterClubsWithImages(clubsList: Club[], clubsWithImagesPlaceIds: Set<string>): Club[] {
  return clubsList.filter(club => clubsWithImagesPlaceIds.has(club.place_id));
}

// ---------------------------------------------------------------------------
// Aggregates used for on-page copy. Every number shown to visitors comes from
// the data file, never from a hardcoded string.
// ---------------------------------------------------------------------------

export interface SiteStats {
  clubCount: number;
  stateCount: number;
  cityCount: number;
  ratedCount: number;
  averageRating: number;
  veteranClubCount: number;
  womensClubCount: number;
}

export function getSiteStats(): SiteStats {
  const list = getMotorcycleClubs();
  const rated = list.filter((c) => c.rating > 0 && c.reviews > 0);
  const avg = rated.length ? rated.reduce((sum, c) => sum + c.rating, 0) / rated.length : 0;
  const cityKeys = new Set(list.map((c) => `${c.State}/${c.citySlug}`));
  return {
    clubCount: list.length,
    stateCount: new Set(list.map((c) => c.State)).size,
    cityCount: cityKeys.size,
    ratedCount: rated.length,
    averageRating: Math.round(avg * 10) / 10,
    veteranClubCount: list.filter((c) => /veteran|combat/i.test(c.main_category || '')).length,
    womensClubCount: list.filter((c) => /women/i.test(c.main_category || '')).length,
  };
}

export type ClubGroup =
  | 'Veteran clubs'
  | "Women's clubs"
  | 'Off-road and dual-sport'
  | 'Sport and racing'
  | 'Touring and brand clubs'
  | 'Charity, recovery, and ministry'
  | 'Rider rights groups'
  | 'Traditional MCs and riding clubs';

export function classifyClub(club: Club): ClubGroup {
  const cat = (club.main_category || '').toLowerCase();
  const name = club.name.toLowerCase();
  if (/veteran|combat|law enforcement/.test(cat) || /veteran|cvma|leatherneck|legion rider/.test(name)) return 'Veteran clubs';
  if (/women/.test(cat) || /women|ladies/.test(name)) return "Women's clubs";
  if (/off-road|enduro|trail|dirt/.test(cat) || /enduro|trail rider|dirt/.test(name)) return 'Off-road and dual-sport';
  if (/sport|racing/.test(cat)) return 'Sport and racing';
  if (/touring|bmw|harley owners|gold ?wing|indian|motoring/.test(cat) || /hog|h\.o\.g|gold ?wing|bmw|imrg/.test(name)) return 'Touring and brand clubs';
  if (/charity|recovery|ministry|sober|christian/.test(cat) || /ministry|sober|christian|faith/.test(name)) return 'Charity, recovery, and ministry';
  if (/rights|abate|association \/ organization/.test(cat) || /abate|motorcycle rights/.test(name)) return 'Rider rights groups';
  return 'Traditional MCs and riding clubs';
}

export interface StateSummary {
  clubCount: number;
  cityCount: number;
  topCities: { name: string; slug: string; state: string; clubCount: number }[];
  groups: { group: ClubGroup; count: number }[];
  withWebsite: number;
  withPhone: number;
}

export function getStateSummary(stateCode: string): StateSummary {
  const list = getClubsByState(stateCode).filter(isMotorcycleClub);
  const byCity = new Map<string, { name: string; slug: string; state: string; clubCount: number }>();
  for (const club of list) {
    const key = club.citySlug;
    const entry = byCity.get(key) || { name: club.City, slug: club.citySlug, state: club.State, clubCount: 0 };
    entry.clubCount += 1;
    byCity.set(key, entry);
  }
  const groupCounts = new Map<ClubGroup, number>();
  for (const club of list) {
    const g = classifyClub(club);
    groupCounts.set(g, (groupCounts.get(g) || 0) + 1);
  }
  return {
    clubCount: list.length,
    cityCount: byCity.size,
    topCities: [...byCity.values()].sort((a, b) => b.clubCount - a.clubCount).slice(0, 5),
    groups: [...groupCounts.entries()].map(([group, count]) => ({ group, count })).sort((a, b) => b.count - a.count),
    withWebsite: list.filter((c) => c.website).length,
    withPhone: list.filter((c) => c.phone).length,
  };
}
