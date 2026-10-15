import { Club, State, City } from './types';
import clubsData from '@/data/clubs.json';
import statesData from '@/data/states.json';
import citiesData from '@/data/cities.json';

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

export function getAllClubs(): Club[] {
  return clubs;
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

export function getCitiesByState(stateCode: string): City[] {
  return cities.filter(city => city.state === stateCode.toLowerCase());
}

export function getCityBySlug(stateCode: string, citySlug: string): City | undefined {
  return cities.find(
    city => city.state === stateCode.toLowerCase() && city.slug === citySlug
  );
}

// Number of real motorcycle clubs in a city (the number the city page renders).
export function getCityClubCount(city: City): number {
  return getClubsByCity(city.state, city.slug).filter(isMotorcycleClub).length;
}

export function isIndexableCity(city: City): boolean {
  return getCityClubCount(city) >= MIN_CITY_CLUBS_FOR_INDEX;
}

export function getIndexableCities(): City[] {
  return cities.filter(isIndexableCity);
}

export function getFeaturedClubs(limit: number = 12): Club[] {
  return [...clubs]
    .filter(isMotorcycleClub)
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
    .filter(isMotorcycleClub)
    .filter(c =>
      c.slug !== club.slug &&
      (c.citySlug === club.citySlug && c.State === club.State)
    )
    .slice(0, limit);
}

export function searchClubs(query: string): Club[] {
  const q = query.toLowerCase();
  return clubs
    .filter(isMotorcycleClub) // Only search actual motorcycle clubs
    .filter(club =>
      club.name.toLowerCase().includes(q) ||
      club.City.toLowerCase().includes(q) ||
      club.stateName.toLowerCase().includes(q) ||
      club.address.toLowerCase().includes(q)
    );
}

export function getTopRatedClubs(limit: number = 8): Club[] {
  return [...clubs]
    .filter(isMotorcycleClub)
    .filter(club => club.rating > 0 && club.reviews >= 5)
    .sort((a, b) => {
      // Sort by rating first, then by review count
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviews - a.reviews;
    })
    .slice(0, limit);
}

export function getRecentClubs(limit: number = 8): Club[] {
  // Since we don't have a date field, we'll use the order in the dataset
  // (newer entries tend to be at the end) and reverse it
  return [...clubs].filter(isMotorcycleClub).reverse().slice(0, limit);
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
