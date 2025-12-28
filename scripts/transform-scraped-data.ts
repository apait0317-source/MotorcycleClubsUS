import * as fs from 'fs';
import * as path from 'path';

interface RawClub {
  referenceNumber: string;
  name: string;
  state: string;
  region: string;
  description: string;
  contactName: string;
  phone: string;
  email: string;
  website: string;
  latitude: number | null;
  longitude: number | null;
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

const STATE_CODES: Record<string, string> = {
  'alabama': 'al', 'alaska': 'ak', 'arizona': 'az', 'arkansas': 'ar',
  'california': 'ca', 'colorado': 'co', 'connecticut': 'ct', 'delaware': 'de',
  'florida': 'fl', 'georgia': 'ga', 'hawaii': 'hi', 'idaho': 'id',
  'illinois': 'il', 'indiana': 'in', 'iowa': 'ia', 'kansas': 'ks',
  'kentucky': 'ky', 'louisiana': 'la', 'maine': 'me', 'maryland': 'md',
  'massachusetts': 'ma', 'michigan': 'mi', 'minnesota': 'mn', 'mississippi': 'ms',
  'missouri': 'mo', 'montana': 'mt', 'nebraska': 'ne', 'nevada': 'nv',
  'new hampshire': 'nh', 'new jersey': 'nj', 'new mexico': 'nm', 'new york': 'ny',
  'north carolina': 'nc', 'north dakota': 'nd', 'ohio': 'oh', 'oklahoma': 'ok',
  'oregon': 'or', 'pennsylvania': 'pa', 'rhode island': 'ri', 'south carolina': 'sc',
  'south dakota': 'sd', 'tennessee': 'tn', 'texas': 'tx', 'utah': 'ut',
  'vermont': 'vt', 'virginia': 'va', 'washington': 'wa', 'west virginia': 'wv',
  'wisconsin': 'wi', 'wyoming': 'wy', 'district of columbia': 'dc'
};

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

function getStateCode(stateName: string): string {
  const normalized = stateName.toLowerCase().trim();

  // Direct match
  if (STATE_CODES[normalized]) {
    return STATE_CODES[normalized];
  }

  // Check if it's already a code
  const lowerState = normalized.toLowerCase();
  if (Object.values(STATE_CODES).includes(lowerState)) {
    return lowerState;
  }

  // Fuzzy match
  for (const [name, code] of Object.entries(STATE_CODES)) {
    if (normalized.includes(name) || name.includes(normalized)) {
      return code;
    }
  }

  console.warn(`Unknown state: ${stateName}`);
  return normalized.substring(0, 2);
}

const STATE_NAMES_SET = new Set(Object.values(STATE_NAMES).map(n => n.toLowerCase()));

function extractCityFromRegion(region: string): string | null {
  // Try to extract city from region string like "Westchester County, NY, USA"
  if (!region) {
    return null;
  }

  const parts = region.split(',').map(p => p.trim());

  // First part is often the city/county
  const city = parts[0]
    .replace(/\s*County$/i, '')
    .replace(/\s*City$/i, '')
    .trim()
    .toLowerCase();

  // Skip if empty, too short, or is a state name
  if (!city || city.length < 2 || STATE_NAMES_SET.has(city)) {
    return null;
  }

  return city;
}

function generateGoogleMapsLink(lat: number | null, lng: number | null, name: string): string {
  if (lat && lng) {
    const encodedName = encodeURIComponent(name);
    return `https://www.google.com/maps/search/?api=1&query=${encodedName}&query_place_id=@${lat},${lng}`;
  }
  return '';
}

function transformClub(raw: RawClub): TransformedClub | null {
  if (!raw.name || !raw.state) {
    console.warn(`Skipping club with missing name or state:`, raw);
    return null;
  }

  const stateCode = getStateCode(raw.state);
  const stateName = STATE_NAMES[stateCode] || raw.state;
  const city = extractCityFromRegion(raw.region);

  // Skip clubs without a valid city - don't use state name as fallback
  if (!city) {
    return null;
  }

  const citySlug = generateCitySlug(city);

  // Build description with contact info if available
  let description = raw.description || '';
  if (raw.contactName && !description.includes(raw.contactName)) {
    description += description ? `\n\nContact: ${raw.contactName}` : `Contact: ${raw.contactName}`;
  }
  if (raw.email && !description.includes(raw.email)) {
    description += description ? `\nEmail: ${raw.email}` : `Email: ${raw.email}`;
  }

  // Build address from region
  const address = raw.region || `${city}, ${stateName}`;

  return {
    place_id: `mr_${raw.referenceNumber || Date.now().toString()}`,
    name: raw.name.trim(),
    slug: generateSlug(raw.name, city, stateCode),
    description: description.trim(),
    reviews: 0,
    rating: 0,
    website: raw.website || '',
    phone: raw.phone || '',
    featured_image: '',
    main_category: 'Motorcycle club',
    categories: 'Motorcycle club',
    closed_on: '',
    address: address,
    link: generateGoogleMapsLink(raw.latitude, raw.longitude, raw.name),
    City: city,
    State: stateCode,
    stateName: stateName,
    citySlug: citySlug,
    query: '',
    'query-02': ''
  };
}

async function transformData(): Promise<void> {
  const inputFile = path.join(__dirname, '../data/scraped-clubs-raw.json');
  const outputFile = path.join(__dirname, '../data/scraped-clubs-transformed.json');

  console.log('=== Transform Scraped Data ===\n');

  if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    console.error('Run the scraper first: npm run tsx scripts/scrape-motorcycleroads.ts');
    process.exit(1);
  }

  const rawData: RawClub[] = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  console.log(`Loaded ${rawData.length} raw clubs\n`);

  const transformedClubs: TransformedClub[] = [];
  const skipped: string[] = [];
  const stateCount: Record<string, number> = {};

  for (const raw of rawData) {
    const transformed = transformClub(raw);

    if (transformed) {
      transformedClubs.push(transformed);
      stateCount[transformed.stateName] = (stateCount[transformed.stateName] || 0) + 1;
    } else {
      skipped.push(raw.name || 'Unknown');
    }
  }

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
