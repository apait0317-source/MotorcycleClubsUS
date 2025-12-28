import { Club, State, City } from './types';
import clubsData from '@/data/clubs.json';
import statesData from '@/data/states.json';
import citiesData from '@/data/cities.json';

export const clubs: Club[] = clubsData as Club[];
export const states: State[] = statesData as State[];
export const cities: City[] = citiesData as City[];

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

  // Racing venues (not clubs)
  'Racecourse', 'Off-road racing venue', 'Off roading area',
  'Race track', 'Motorsports venue',

  // Retail & Services
  'Motorcycle dealer', 'Motorcycle shop', 'Motorcycle repair shop',
  'Auto repair shop', 'Garage', 'Store', 'Clothing store',
  'Car dealer', 'Auto parts store',

  // Religious
  'Church', 'Place of worship', 'Religious organization',

  // Other non-club categories
  'Tour operator', 'Transportation service', 'Rental agency',
  'Hotel', 'Motel', 'Campground', 'RV park',
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

export function getFeaturedClubs(limit: number = 12): Club[] {
  return [...clubs]
    .filter(club => club.rating >= 4.5 && club.reviews >= 10)
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, limit);
}

export function getPopularCities(limit: number = 12): City[] {
  return [...cities]
    .sort((a, b) => b.clubCount - a.clubCount)
    .slice(0, limit);
}

export function getRelatedClubs(club: Club, limit: number = 6): Club[] {
  return clubs
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
  return [...clubs].reverse().slice(0, limit);
}

// Filter clubs to only those with images
export function filterClubsWithImages(clubsList: Club[], clubsWithImagesPlaceIds: Set<string>): Club[] {
  return clubsList.filter(club => clubsWithImagesPlaceIds.has(club.place_id));
}
