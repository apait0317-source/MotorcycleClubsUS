import * as fs from 'fs';
import * as path from 'path';

interface RawClub {
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
  const slug = `${name}-${city}-${stateCode}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug;
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
  // Generate a unique ID based on the club info
  const hash = `${name}-${city}-${state}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
  return `rc_${hash}_${Date.now().toString(36)}`;
}

function transformClub(raw: RawClub, index: number): TransformedClub | null {
  if (!raw.name || !raw.stateCode) {
    console.warn(`Skipping club with missing name or state:`, raw);
    return null;
  }

  const stateCode = raw.stateCode.toLowerCase();
  const stateName = STATE_NAMES[stateCode] || raw.state;
  const city = raw.city.toLowerCase();
  const citySlug = generateCitySlug(city);

  // Build description with riding style and interests
  let description = raw.description || '';
  if (raw.ridingStyle && !description.includes(raw.ridingStyle)) {
    description += description ? `\n\nRiding Style: ${raw.ridingStyle}` : `Riding Style: ${raw.ridingStyle}`;
  }
  if (raw.interests && !description.includes(raw.interests)) {
    description += description ? `\nInterests: ${raw.interests}` : `Interests: ${raw.interests}`;
  }
  if (raw.status) {
    description += description ? `\n\n${raw.status}` : raw.status;
  }

  // Determine category
  const lowerName = raw.name.toLowerCase();
  let category = 'Motorcycle club';
  if (lowerName.includes('hog') || lowerName.includes('harley')) {
    category = 'Harley Owners Group';
  } else if (lowerName.includes('bmw')) {
    category = 'BMW Motorcycle club';
  } else if (lowerName.includes('ducati')) {
    category = 'Ducati Owners club';
  } else if (lowerName.includes('victory')) {
    category = 'Victory Riders club';
  } else if (lowerName.includes('indian')) {
    category = 'Indian Motorcycle club';
  } else if (lowerName.includes('women') || lowerName.includes("women's") || lowerName.includes('lady') || lowerName.includes('ladies')) {
    category = "Women's Motorcycle club";
  } else if (lowerName.includes('veteran') || lowerName.includes('military') || lowerName.includes('combat')) {
    category = 'Veterans Motorcycle club';
  } else if (lowerName.includes('law enforcement') || lowerName.includes('police') || lowerName.includes('blue knight')) {
    category = 'Law Enforcement Motorcycle club';
  } else if (lowerName.includes('christian') || lowerName.includes('faith') || lowerName.includes('ministry')) {
    category = 'Christian Motorcycle club';
  }

  return {
    place_id: generatePlaceId(raw.name, raw.city, raw.stateCode),
    name: raw.name.trim(),
    slug: generateSlug(raw.name, city, stateCode),
    description: description.trim().substring(0, 2000),
    reviews: 0,
    rating: 0,
    website: '',
    phone: '',
    featured_image: '',
    main_category: category,
    categories: category,
    closed_on: '',
    address: raw.address || `${raw.city}, ${stateName}`,
    link: '',
    City: city,
    State: stateCode,
    stateName: stateName,
    citySlug: citySlug,
    query: '',
    'query-02': ''
  };
}

async function transformData(): Promise<void> {
  const inputFile = path.join(__dirname, '../data/scraped-riderclubs-raw.json');
  const outputFile = path.join(__dirname, '../data/scraped-riderclubs-transformed.json');

  console.log('=== Transform RiderClubs Data ===\n');

  if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    console.error('Run the scraper first: npm run scrape:riderclubs');
    process.exit(1);
  }

  const rawData: RawClub[] = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  console.log(`Loaded ${rawData.length} raw clubs\n`);

  const transformedClubs: TransformedClub[] = [];
  const skipped: string[] = [];
  const stateCount: Record<string, number> = {};

  rawData.forEach((raw, index) => {
    const transformed = transformClub(raw, index);

    if (transformed) {
      transformedClubs.push(transformed);
      stateCount[transformed.stateName] = (stateCount[transformed.stateName] || 0) + 1;
    } else {
      skipped.push(raw.name || 'Unknown');
    }
  });

  // Sort by state then name
  transformedClubs.sort((a, b) => {
    if (a.stateName !== b.stateName) {
      return a.stateName.localeCompare(b.stateName);
    }
    return a.name.localeCompare(b.name);
  });

  // Save transformed data
  fs.writeFileSync(outputFile, JSON.stringify(transformedClubs, null, 2));

  console.log('=== Transform Complete ===\n');
  console.log(`Transformed: ${transformedClubs.length} clubs`);
  console.log(`Skipped: ${skipped.length} clubs`);

  if (skipped.length > 0) {
    console.log(`\nSkipped clubs: ${skipped.slice(0, 10).join(', ')}${skipped.length > 10 ? '...' : ''}`);
  }

  console.log('\nClubs by state:');
  const sortedStates = Object.entries(stateCount).sort((a, b) => b[1] - a[1]);
  for (const [state, count] of sortedStates.slice(0, 10)) {
    console.log(`  ${state}: ${count}`);
  }
  if (sortedStates.length > 10) {
    console.log(`  ... and ${sortedStates.length - 10} more states`);
  }

  console.log(`\nOutput saved to: ${outputFile}`);
}

transformData().catch(console.error);
