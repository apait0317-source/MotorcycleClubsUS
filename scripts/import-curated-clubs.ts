import * as fs from 'fs';
import * as path from 'path';

interface CuratedClub {
  name: string;
  city: string;
  state: string;
  category: string;
  description: string;
}

interface TransformedClub {
  place_id: string;
  name: string;
  slug: string;
  description: string;
  reviews: number;
  rating: number;
  website: string;
  phone: string;
  featured_image: string;
  main_category: string;
  categories: string;
  closed_on: string;
  address: string;
  link: string;
  City: string;
  State: string;
  stateName: string;
  citySlug: string;
  query: string;
  'query-02': string;
}

const STATE_NAMES: Record<string, string> = {
  'al': 'Alabama', 'ak': 'Alaska', 'az': 'Arizona', 'ar': 'Arkansas',
  'ca': 'California', 'co': 'Colorado', 'ct': 'Connecticut', 'de': 'Delaware',
  'fl': 'Florida', 'ga': 'Georgia', 'hi': 'Hawaii', 'id': 'Idaho',
  'il': 'Illinois', 'in': 'Indiana', 'ia': 'Iowa', 'ks': 'Kansas',
  'ky': 'Kentucky', 'la': 'Louisiana', 'me': 'Maine', 'md': 'Maryland',
  'ma': 'Massachusetts', 'mi': 'Michigan', 'mn': 'Minnesota', 'ms': 'Mississippi',
  'mo': 'Missouri', 'mt': 'Montana', 'ne': 'Nebraska', 'nv': 'Nevada',
  'nh': 'New Hampshire', 'nj': 'New Jersey', 'nm': 'New Mexico', 'ny': 'New York',
  'nc': 'North Carolina', 'nd': 'North Dakota', 'oh': 'Ohio', 'ok': 'Oklahoma',
  'or': 'Oregon', 'pa': 'Pennsylvania', 'ri': 'Rhode Island', 'sc': 'South Carolina',
  'sd': 'South Dakota', 'tn': 'Tennessee', 'tx': 'Texas', 'ut': 'Utah',
  'vt': 'Vermont', 'va': 'Virginia', 'wa': 'Washington', 'wv': 'West Virginia',
  'wi': 'Wisconsin', 'wy': 'Wyoming', 'dc': 'District of Columbia'
};

function generateSlug(name: string, city: string, stateCode: string): string {
  return `${name}-${city}-${stateCode}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateCitySlug(city: string): string {
  return city
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function generatePlaceId(name: string, city: string, state: string): string {
  const hash = `curated-${name}-${city}-${state}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
  return `cur_${hash}_${Date.now().toString(36)}`;
}

function transformClub(raw: CuratedClub): TransformedClub {
  const stateCode = raw.state.toLowerCase();
  const stateName = STATE_NAMES[stateCode] || raw.state;
  const city = raw.city.toLowerCase();
  const citySlug = generateCitySlug(city);

  return {
    place_id: generatePlaceId(raw.name, raw.city, stateCode),
    name: raw.name.trim(),
    slug: generateSlug(raw.name, city, stateCode),
    description: raw.description.trim(),
    reviews: 0,
    rating: 0,
    website: '',
    phone: '',
    featured_image: '',
    main_category: raw.category,
    categories: raw.category,
    closed_on: '',
    address: `${raw.city}, ${stateName}`,
    link: '',
    City: city,
    State: stateCode,
    stateName: stateName,
    citySlug: citySlug,
    query: '',
    'query-02': ''
  };
}

async function importCuratedClubs(): Promise<void> {
  const curatedFile = path.join(__dirname, '../data/curated-clubs.json');
  const clubsFile = path.join(__dirname, '../data/clubs.json');

  console.log('=== Import Curated Clubs ===\n');

  // Load curated clubs
  const curatedClubs: CuratedClub[] = JSON.parse(fs.readFileSync(curatedFile, 'utf-8'));
  console.log(`Curated clubs to import: ${curatedClubs.length}`);

  // Load existing clubs
  const existingClubs: TransformedClub[] = JSON.parse(fs.readFileSync(clubsFile, 'utf-8'));
  console.log(`Existing clubs: ${existingClubs.length}`);

  // Create lookup for existing clubs
  const existingKeys = new Set<string>();
  for (const club of existingClubs) {
    const key = `${club.name.toLowerCase()}-${club.City.toLowerCase()}-${club.State.toLowerCase()}`;
    existingKeys.add(key);
  }

  // Transform and filter duplicates
  const newClubs: TransformedClub[] = [];
  const duplicates: string[] = [];
  const categoryCount: Record<string, number> = {};

  for (const raw of curatedClubs) {
    const transformed = transformClub(raw);
    const key = `${transformed.name.toLowerCase()}-${transformed.City}-${transformed.State}`;

    if (existingKeys.has(key)) {
      duplicates.push(raw.name);
    } else {
      newClubs.push(transformed);
      existingKeys.add(key);
      categoryCount[raw.category] = (categoryCount[raw.category] || 0) + 1;
    }
  }

  console.log(`\nDuplicates found: ${duplicates.length}`);
  console.log(`New clubs to add: ${newClubs.length}`);

  if (newClubs.length === 0) {
    console.log('\nNo new clubs to add.');
    return;
  }

  // Append new clubs
  const allClubs = [...existingClubs, ...newClubs];

  // Sort by state then city then name
  allClubs.sort((a, b) => {
    if (a.State !== b.State) return a.State.localeCompare(b.State);
    if (a.City !== b.City) return a.City.localeCompare(b.City);
    return a.name.localeCompare(b.name);
  });

  // Save updated clubs
  fs.writeFileSync(clubsFile, JSON.stringify(allClubs, null, 2));

  console.log('\n=== Import Complete ===');
  console.log(`Total clubs now: ${allClubs.length}`);
  console.log(`Added: ${newClubs.length} curated clubs`);

  console.log('\nClubs by category:');
  const sortedCats = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of sortedCats) {
    console.log(`  ${cat}: ${count}`);
  }

  console.log('\nSample of added clubs:');
  for (const club of newClubs.slice(0, 5)) {
    console.log(`  - ${club.name} (${club.address})`);
  }
  if (newClubs.length > 5) {
    console.log(`  ... and ${newClubs.length - 5} more`);
  }
}

importCuratedClubs().catch(console.error);
