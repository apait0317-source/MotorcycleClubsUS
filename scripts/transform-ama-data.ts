import * as fs from 'fs';
import * as path from 'path';

interface RawClub {
  name: string;
  type: string;
  city: string;
  state: string;
  phone: string;
  website: string;
  detailUrl: string;
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

const STATE_NAMES_SET = new Set(Object.values(STATE_NAMES).map(n => n.toLowerCase()));

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
  const hash = `ama-${name}-${city}-${state}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
  return `ama_${hash}_${Date.now().toString(36)}`;
}

function determineCategory(name: string, type: string): string {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('hog') || lowerName.includes('harley')) {
    return 'Harley Owners Group';
  } else if (lowerName.includes('bmw')) {
    return 'BMW Motorcycle club';
  } else if (lowerName.includes('ducati')) {
    return 'Ducati Owners club';
  } else if (lowerName.includes('honda')) {
    return 'Honda Riders club';
  } else if (lowerName.includes('indian')) {
    return 'Indian Motorcycle club';
  } else if (lowerName.includes('triumph')) {
    return 'Triumph Motorcycle club';
  } else if (lowerName.includes('women') || lowerName.includes("women's") || lowerName.includes('lady') || lowerName.includes('ladies')) {
    return "Women's Motorcycle club";
  } else if (lowerName.includes('veteran') || lowerName.includes('military') || lowerName.includes('combat') || lowerName.includes('legion')) {
    return 'Veterans Motorcycle club';
  } else if (lowerName.includes('christian') || lowerName.includes('faith') || lowerName.includes('ministry') || lowerName.includes('cma')) {
    return 'Christian Motorcycle club';
  } else if (lowerName.includes('blue knight') || lowerName.includes('law enforcement') || lowerName.includes('police')) {
    return 'Law Enforcement Motorcycle club';
  } else if (lowerName.includes('fire') || lowerName.includes('red knight')) {
    return 'Fire/Rescue Motorcycle club';
  } else if (lowerName.includes('abate')) {
    return 'Motorcycle Rights Organization';
  } else if (lowerName.includes('trail') || lowerName.includes('dirt') || lowerName.includes('enduro') || lowerName.includes('off-road')) {
    return 'Off-road Motorcycle club';
  } else if (lowerName.includes('touring') || lowerName.includes('tour')) {
    return 'Touring Motorcycle club';
  } else if (lowerName.includes('sport') || lowerName.includes('race') || lowerName.includes('racing')) {
    return 'Sport/Racing Motorcycle club';
  }

  return 'Motorcycle club';
}

function transformClub(raw: RawClub): TransformedClub | null {
  if (!raw.name || !raw.city || !raw.state) {
    return null;
  }

  const stateCode = raw.state.toLowerCase();
  const stateName = STATE_NAMES[stateCode] || raw.state;
  const city = raw.city.toLowerCase();

  // Skip if city is a state name
  if (STATE_NAMES_SET.has(city)) {
    return null;
  }

  const citySlug = generateCitySlug(city);
  const category = determineCategory(raw.name, raw.type);

  // Build description
  const description = `${raw.name} is an AMA-chartered motorcycle organization based in ${raw.city}, ${stateName}. ` +
    (raw.type ? `Chartered as: ${raw.type}.` : '');

  return {
    place_id: generatePlaceId(raw.name, raw.city, stateCode),
    name: raw.name.trim(),
    slug: generateSlug(raw.name, city, stateCode),
    description: description.trim(),
    reviews: 0,
    rating: 0,
    website: raw.website || '',
    phone: raw.phone || '',
    featured_image: '',
    main_category: category,
    categories: category,
    closed_on: '',
    address: `${raw.city}, ${stateName}`,
    link: raw.detailUrl || '',
    City: city,
    State: stateCode,
    stateName: stateName,
    citySlug: citySlug,
    query: '',
    'query-02': ''
  };
}

async function transformData(): Promise<void> {
  const inputFile = path.join(__dirname, '../data/scraped-ama-raw.json');
  const outputFile = path.join(__dirname, '../data/scraped-ama-transformed.json');

  console.log('=== Transform AMA Data ===\n');

  if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    console.error('Run the scraper first: npx tsx scripts/scrape-ama.ts');
    process.exit(1);
  }

  const rawData: RawClub[] = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  console.log(`Loaded ${rawData.length} raw clubs\n`);

  const transformedClubs: TransformedClub[] = [];
  const skipped: string[] = [];
  const stateCount: Record<string, number> = {};
  const categoryCount: Record<string, number> = {};

  for (const raw of rawData) {
    const transformed = transformClub(raw);

    if (transformed) {
      transformedClubs.push(transformed);
      stateCount[transformed.stateName] = (stateCount[transformed.stateName] || 0) + 1;
      categoryCount[transformed.main_category] = (categoryCount[transformed.main_category] || 0) + 1;
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

  console.log('\nClubs by category:');
  const sortedCats = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of sortedCats.slice(0, 10)) {
    console.log(`  ${cat}: ${count}`);
  }

  console.log('\nClubs by state (top 10):');
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
