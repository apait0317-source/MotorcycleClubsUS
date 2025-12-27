import { Club, State, City } from './types';
import clubsData from '@/data/clubs.json';
import statesData from '@/data/states.json';
import citiesData from '@/data/cities.json';

export const clubs: Club[] = clubsData as Club[];
export const states: State[] = statesData as State[];
export const cities: City[] = citiesData as City[];

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
  return clubs.filter(club =>
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
