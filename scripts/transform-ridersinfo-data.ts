import * as fs from 'fs';
import * as path from 'path';

interface RawClub {
  name: string;
  state: string;
  stateCode: string;
  website: string;
  description: string;
  category: string;
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

function generateSlug(name: string, stateCode: string): string {
  const slug = `${name}-${stateCode}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug;
}

function generatePlaceId(name: string, state: string): string {
  const hash = `${name}-${state}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
  return `ri_${hash}_${Date.now().toString(36)}`;
}

const STATE_NAMES_SET = new Set(Object.values(STATE_NAMES).map(n => n.toLowerCase()));

function extractCityFromName(name: string): string | null {
  // Try to extract city from club name patterns like "Club Name (City)" or "City Club Name"
  const cityPatterns = [
    /\(([A-Za-z\s]+)\)$/,  // "Club Name (City)"
    /^([A-Za-z\s]+)\s+(?:MC|M\/C|Motorcycle|Club)/i,  // "City MC"
    /of\s+([A-Za-z\s]+)$/i,  // "Club of City"
  ];

  for (const pattern of cityPatterns) {
    const match = name.match(pattern);
    if (match && match[1] && match[1].length < 30) {
      const city = match[1].trim().toLowerCase();
      // Don't return state names as cities
      if (!STATE_NAMES_SET.has(city)) {
        return city;
      }
    }
  }

  // Return null if no valid city found - don't use state name as fallback
  return null;
}

function transformClub(raw: RawClub): TransformedClub | null {
  if (!raw.name || !raw.stateCode) {
    return null;
  }

  const stateCode = raw.stateCode.toLowerCase();
  const stateName = STATE_NAMES[stateCode] || raw.state;
  const city = extractCityFromName(raw.name);

  // Skip clubs without a valid city - don't use state name as fallback
  if (!city) {
    return null;
  }

  const citySlug = city.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return {
    place_id: generatePlaceId(raw.name, raw.stateCode),
    name: raw.name.trim(),
    slug: generateSlug(raw.name, stateCode),
    description: raw.description || '',
    reviews: 0,
    rating: 0,
    website: raw.website || '',
    phone: '',
    featured_image: '',
    main_category: raw.category || 'Motorcycle club',
    categories: raw.category || 'Motorcycle club',
    closed_on: '',
    address: `${stateName}`,
    link: '',
    City: city,
    State: stateCode,
    stateName: stateName,
    citySlug: citySlug || stateCode,
    query: '',
    'query-02': ''
  };
}

async function transformData(): Promise<void> {
  const inputFile = path.join(__dirname, '../data/scraped-ridersinfo-raw.json');
  const outputFile = path.join(__dirname, '../data/scraped-ridersinfo-transformed.json');

  console.log('=== Transform RidersInfo Data ===\n');

  if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    console.error('Run the scraper first: npm run scrape:ridersinfo');
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
