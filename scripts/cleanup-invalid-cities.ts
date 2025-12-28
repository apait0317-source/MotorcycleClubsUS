import * as fs from 'fs';
import * as path from 'path';

interface Club {
  place_id: string;
  name: string;
  slug: string;
  City: string;
  State: string;
  stateName: string;
  citySlug: string;
  [key: string]: unknown;
}

interface State {
  code: string;
  name: string;
  clubCount: number;
  cityCount: number;
}

interface City {
  name: string;
  slug: string;
  state: string;
  stateName: string;
  clubCount: number;
}

const STATE_NAMES = new Set([
  'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado',
  'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho',
  'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana',
  'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota',
  'mississippi', 'missouri', 'montana', 'nebraska', 'nevada',
  'new hampshire', 'new jersey', 'new mexico', 'new york',
  'north carolina', 'north dakota', 'ohio', 'oklahoma', 'oregon',
  'pennsylvania', 'rhode island', 'south carolina', 'south dakota',
  'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington',
  'west virginia', 'wisconsin', 'wyoming', 'district of columbia'
]);

// Patterns that indicate a "city" is actually a club name
const CLUB_NAME_PATTERNS = [
  /motorcycle/i,
  /\bmc\b/i,
  /\bm\/c\b/i,
  /\bfmc\b/i,
  /\bclub\b/i,
  /riders/i,
  /riding\b/i,
  /association/i,
  /chapter/i,
  /trials/i,
  /cruisers/i,
  /knights/i,
  /wheels/i,
  /enduro/i,
  /competition/i,
  /cycle\b/i,
  /bikers/i,
  /disciples/i,
  /rebels/i,
  /warriors/i,
  /angels/i,
  /brotherhood/i,
  /redeemed/i,
  /savages/i,
  /gypsies/i,
  /pirates/i,
  /outlaws/i,
  /veterans?\b/i,
  /elks\b/i,
];

// Known non-city values that slip through pattern matching
const KNOWN_BAD_CITIES = new Set([
  'perry mountain',
  'sand dollar',
  'loners',
  'mayhem fmc',
  'bjmc',
  'off camber',
  'southern',
  'blackhawk',
  'gator',
  'menehunes',
  'the lost ones',
  'lost souls',
]);

// Categories that are NOT motorcycle clubs - same as lib/data.ts
const EXCLUDED_CATEGORIES = new Set([
  // Bars & Nightlife
  'Bar', 'Bar & grill', 'Nightclub', 'Night club', 'Dance club', 'Gay bar',
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
  'Church', 'Place of worship',
]);

function isNotMotorcycleClub(club: Club): boolean {
  const category = ((club.main_category as string) || '').trim();
  if (!category) return false; // Keep clubs without category
  return EXCLUDED_CATEGORIES.has(category);
}

function isInvalidCity(club: Club): boolean {
  const cityLower = club.City.toLowerCase().trim();
  const stateNameLower = club.stateName.toLowerCase().trim();

  // City equals state name (exact match)
  if (cityLower === stateNameLower) return true;

  // City is a state name (might be assigned to wrong state)
  if (STATE_NAMES.has(cityLower)) return true;

  // City is in known bad cities list
  if (KNOWN_BAD_CITIES.has(cityLower)) return true;

  // City is suspiciously long (real US cities are usually < 25 chars)
  if (cityLower.length > 25) return true;

  // City contains patterns that suggest it's a club name, not a city
  if (CLUB_NAME_PATTERNS.some(p => p.test(cityLower))) return true;

  return false;
}

function recalculateStateCounts(clubs: Club[], states: State[]): State[] {
  const stateCounts: Record<string, number> = {};
  const stateCities: Record<string, Set<string>> = {};

  for (const club of clubs) {
    const stateCode = club.State.toLowerCase();
    stateCounts[stateCode] = (stateCounts[stateCode] || 0) + 1;

    if (!stateCities[stateCode]) {
      stateCities[stateCode] = new Set();
    }
    stateCities[stateCode].add(club.citySlug);
  }

  return states.map(state => ({
    ...state,
    clubCount: stateCounts[state.code] || 0,
    cityCount: stateCities[state.code]?.size || 0
  }));
}

function recalculateCityCounts(clubs: Club[]): City[] {
  const cityCounts: Record<string, number> = {};
  const cityInfo: Record<string, { name: string; state: string; stateName: string }> = {};

  for (const club of clubs) {
    const key = `${club.State}-${club.citySlug}`;
    cityCounts[key] = (cityCounts[key] || 0) + 1;

    if (!cityInfo[key]) {
      cityInfo[key] = {
        name: club.City,
        state: club.State,
        stateName: club.stateName
      };
    }
  }

  const cities: City[] = [];
  for (const [key, info] of Object.entries(cityInfo)) {
    // Split only on first dash to preserve multi-part slugs like "san-diego"
    const dashIndex = key.indexOf('-');
    const state = key.substring(0, dashIndex);
    const slug = key.substring(dashIndex + 1);
    cities.push({
      name: info.name,
      slug: slug,
      state: state,
      stateName: info.stateName,
      clubCount: cityCounts[key]
    });
  }

  return cities.sort((a, b) => {
    if (a.state !== b.state) return a.state.localeCompare(b.state);
    return a.name.localeCompare(b.name);
  });
}

async function cleanup(): Promise<void> {
  const clubsFile = path.join(__dirname, '../data/clubs.json');
  const statesFile = path.join(__dirname, '../data/states.json');
  const citiesFile = path.join(__dirname, '../data/cities.json');

  console.log('=== Cleanup Invalid Cities ===\n');

  const clubs: Club[] = JSON.parse(fs.readFileSync(clubsFile, 'utf-8'));
  const states: State[] = JSON.parse(fs.readFileSync(statesFile, 'utf-8'));

  console.log(`Total clubs before cleanup: ${clubs.length}`);

  // Filter out invalid clubs
  const invalidCityClubs: Club[] = [];
  const nonMotorcycleClubs: Club[] = [];
  const validClubs: Club[] = [];

  for (const club of clubs) {
    if (isInvalidCity(club)) {
      invalidCityClubs.push(club);
    } else if (isNotMotorcycleClub(club)) {
      nonMotorcycleClubs.push(club);
    } else {
      validClubs.push(club);
    }
  }

  console.log(`Clubs with invalid cities: ${invalidCityClubs.length}`);
  console.log(`Non-motorcycle clubs (bars, dealers, etc.): ${nonMotorcycleClubs.length}`);
  console.log(`Valid motorcycle clubs: ${validClubs.length}\n`);

  // Show removed by category
  const removedByCategory: Record<string, number> = {};
  for (const club of nonMotorcycleClubs) {
    const cat = (club.main_category as string) || 'Unknown';
    removedByCategory[cat] = (removedByCategory[cat] || 0) + 1;
  }

  if (Object.keys(removedByCategory).length > 0) {
    console.log('Removed by category:');
    const sortedCats = Object.entries(removedByCategory).sort((a, b) => b[1] - a[1]);
    for (const [cat, count] of sortedCats.slice(0, 10)) {
      console.log(`  ${cat}: ${count}`);
    }
    if (sortedCats.length > 10) {
      console.log(`  ... and ${sortedCats.length - 10} more categories`);
    }
    console.log('');
  }

  // Show removed by state (for invalid cities)
  const removedByState: Record<string, number> = {};
  for (const club of invalidCityClubs) {
    removedByState[club.stateName] = (removedByState[club.stateName] || 0) + 1;
  }

  if (Object.keys(removedByState).length > 0) {
    console.log('Removed by state (invalid cities):');
    const sortedRemoved = Object.entries(removedByState).sort((a, b) => b[1] - a[1]);
    for (const [state, count] of sortedRemoved.slice(0, 10)) {
      console.log(`  ${state}: ${count}`);
    }
    if (sortedRemoved.length > 10) {
      console.log(`  ... and ${sortedRemoved.length - 10} more states`);
    }
  }

  // Recalculate counts
  const updatedStates = recalculateStateCounts(validClubs, states);
  const updatedCities = recalculateCityCounts(validClubs);

  // Save cleaned data
  fs.writeFileSync(clubsFile, JSON.stringify(validClubs, null, 2));
  fs.writeFileSync(statesFile, JSON.stringify(updatedStates, null, 2));
  fs.writeFileSync(citiesFile, JSON.stringify(updatedCities, null, 2));

  console.log('\n=== Cleanup Complete ===\n');
  console.log(`Total clubs: ${validClubs.length}`);
  console.log(`Total states: ${updatedStates.length}`);
  console.log(`Total cities: ${updatedCities.length}`);

  console.log('\nFiles updated:');
  console.log(`  - ${clubsFile}`);
  console.log(`  - ${statesFile}`);
  console.log(`  - ${citiesFile}`);
}

cleanup().catch(console.error);
