import * as fs from 'fs';
import * as path from 'path';

interface RawChapter {
  name: string;
  city: string;
  state: string;
  stateCode: string;
  director: string;
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

function generateSlug(name: string, city: string, state: string): string {
  return `${name}-${city}-${state}`
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

function generatePlaceId(name: string): string {
  const hash = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15);
  return `wow_${hash}_${Date.now().toString(36).substring(0, 6)}`;
}

function transformChapter(raw: RawChapter): TransformedClub {
  const fullName = `Women On Wheels - ${raw.name}`;
  const directorInfo = raw.director ? ` Director: ${raw.director}.` : '';

  return {
    place_id: generatePlaceId(raw.name),
    name: fullName,
    slug: generateSlug(fullName, raw.city, raw.stateCode),
    description: `${fullName} is a chapter of Women On Wheels, a not-for-profit international organization founded in 1982 that unites women motorcycle riders of all ages and skill levels.${directorInfo}`,
    reviews: 0,
    rating: 0,
    website: 'https://womenonwheels.org/',
    phone: '',
    featured_image: '',
    main_category: "Women's Motorcycle club",
    categories: "Women's Motorcycle club",
    closed_on: '',
    address: `${raw.city}, ${raw.state}`,
    link: '',
    City: raw.city.toLowerCase(),
    State: raw.stateCode.toLowerCase(),
    stateName: raw.state,
    citySlug: generateCitySlug(raw.city),
    query: '',
    'query-02': ''
  };
}

async function transformWOWData(): Promise<void> {
  const inputFile = path.join(__dirname, '../data/scraped-wow-raw.json');
  const outputFile = path.join(__dirname, '../data/scraped-wow-transformed.json');

  console.log('=== Transform WOW Data ===\n');

  const rawData: RawChapter[] = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  console.log(`Raw chapters: ${rawData.length}`);

  const transformed = rawData.map(transformChapter);

  fs.writeFileSync(outputFile, JSON.stringify(transformed, null, 2));
  console.log(`Transformed chapters: ${transformed.length}`);
  console.log(`Output: ${outputFile}`);

  // Show sample
  console.log('\nSample clubs:');
  for (const club of transformed.slice(0, 3)) {
    console.log(`  - ${club.name} (${club.address})`);
  }
}

transformWOWData().catch(console.error);
