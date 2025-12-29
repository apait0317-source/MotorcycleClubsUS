import * as fs from 'fs';
import * as path from 'path';

interface RawChapter {
  chapterId: string;
  subChapter: string;
  city: string;
  state: string;
  stateCode: string;
  website: string;
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

function generatePlaceId(chapterId: string, subChapter: string, stateCode: string): string {
  const hash = `cvma-${chapterId}-${subChapter}-${stateCode}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
  return `cvma_${hash}_${Date.now().toString(36)}`;
}

function transformChapter(raw: RawChapter): TransformedClub | null {
  if (!raw.city || !raw.stateCode) {
    return null;
  }

  const stateCode = raw.stateCode.toLowerCase();
  const stateName = STATE_NAMES[stateCode] || raw.state;
  const city = raw.city.toLowerCase();
  const citySlug = generateCitySlug(city);

  // Generate chapter name
  const chapterNum = raw.subChapter ? `${raw.chapterId}-${raw.subChapter}` : raw.chapterId;
  const name = `CVMA Chapter ${chapterNum}`;

  // Build description
  const description = `Combat Veterans Motorcycle Association Chapter ${chapterNum}. ` +
    `A veterans motorcycle club serving ${raw.city}, ${stateName}. ` +
    `CVMA is a 501(c)(19) veterans charity supporting those who have defended our country.`;

  return {
    place_id: generatePlaceId(raw.chapterId, raw.subChapter, stateCode),
    name: name,
    slug: generateSlug(name, city, stateCode),
    description: description,
    reviews: 0,
    rating: 0,
    website: raw.website || '',
    phone: '',
    featured_image: '',
    main_category: 'Veterans Motorcycle club',
    categories: 'Veterans Motorcycle club',
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

async function transformData(): Promise<void> {
  const inputFile = path.join(__dirname, '../data/scraped-cvma-raw.json');
  const outputFile = path.join(__dirname, '../data/scraped-cvma-transformed.json');

  console.log('=== Transform CVMA Data ===\n');

  if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    console.error('Run the scraper first: npx tsx scripts/scrape-cvma.ts');
    process.exit(1);
  }

  const rawData: RawChapter[] = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  console.log(`Loaded ${rawData.length} raw chapters\n`);

  const transformedClubs: TransformedClub[] = [];
  const skipped: string[] = [];
  const stateCount: Record<string, number> = {};

  for (const raw of rawData) {
    const transformed = transformChapter(raw);

    if (transformed) {
      transformedClubs.push(transformed);
      stateCount[transformed.stateName] = (stateCount[transformed.stateName] || 0) + 1;
    } else {
      skipped.push(`${raw.chapterId}-${raw.subChapter}`);
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
  console.log(`Transformed: ${transformedClubs.length} chapters`);
  console.log(`Skipped: ${skipped.length} chapters`);

  if (skipped.length > 0) {
    console.log(`\nSkipped chapters: ${skipped.slice(0, 10).join(', ')}${skipped.length > 10 ? '...' : ''}`);
  }

  console.log('\nChapters by state:');
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
