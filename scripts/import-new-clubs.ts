import * as fs from 'fs';
import * as path from 'path';

interface Club {
  place_id: string;
  name: string;
  slug: string;
  City: string;
  State: string;
  [key: string]: unknown;
}

interface CuratedClub {
  name: string;
  city: string;
  state: string;
  category: string;
  description: string;
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
    .replace(/\s+/g, '-');
}

function transformCuratedClub(raw: CuratedClub): Club {
  const stateCode = raw.state.toLowerCase();
  const stateName = STATE_NAMES[stateCode] || raw.state;
  const city = raw.city.toLowerCase();

  return {
    place_id: `cur_${raw.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15)}_${Date.now().toString(36).substring(0, 6)}`,
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
    citySlug: generateCitySlug(city),
    query: '',
    'query-02': ''
  };
}

async function importAllNewClubs(): Promise<void> {
  const clubsFile = path.join(__dirname, '../data/clubs.json');
  const wowFile = path.join(__dirname, '../data/scraped-wow-transformed.json');
  const soberFile = path.join(__dirname, '../data/scraped-sober-riders-transformed.json');
  const curatedFile = path.join(__dirname, '../data/curated-clubs.json');

  console.log('=== Import All New Clubs ===\n');

  // Load existing clubs
  const existingClubs: Club[] = JSON.parse(fs.readFileSync(clubsFile, 'utf-8'));
  console.log(`Existing clubs: ${existingClubs.length}`);

  // Create lookup for existing clubs
  const existingKeys = new Set<string>();
  for (const club of existingClubs) {
    const key = `${club.name.toLowerCase()}-${club.City.toLowerCase()}-${club.State.toLowerCase()}`;
    existingKeys.add(key);
  }

  let totalAdded = 0;
  const allNewClubs: Club[] = [];

  // Import WOW clubs
  if (fs.existsSync(wowFile)) {
    const wowClubs: Club[] = JSON.parse(fs.readFileSync(wowFile, 'utf-8'));
    let wowAdded = 0;
    for (const club of wowClubs) {
      const key = `${club.name.toLowerCase()}-${club.City.toLowerCase()}-${club.State.toLowerCase()}`;
      if (!existingKeys.has(key)) {
        allNewClubs.push(club);
        existingKeys.add(key);
        wowAdded++;
      }
    }
    console.log(`Women On Wheels: ${wowAdded} new clubs`);
    totalAdded += wowAdded;
  }

  // Import Sober Riders clubs
  if (fs.existsSync(soberFile)) {
    const soberClubs: Club[] = JSON.parse(fs.readFileSync(soberFile, 'utf-8'));
    let soberAdded = 0;
    for (const club of soberClubs) {
      const key = `${club.name.toLowerCase()}-${club.City.toLowerCase()}-${club.State.toLowerCase()}`;
      if (!existingKeys.has(key)) {
        allNewClubs.push(club);
        existingKeys.add(key);
        soberAdded++;
      }
    }
    console.log(`Sober Riders MC: ${soberAdded} new clubs`);
    totalAdded += soberAdded;
  }

  // Import curated clubs
  if (fs.existsSync(curatedFile)) {
    const curatedRaw: CuratedClub[] = JSON.parse(fs.readFileSync(curatedFile, 'utf-8'));
    let curatedAdded = 0;
    for (const raw of curatedRaw) {
      const transformed = transformCuratedClub(raw);
      const key = `${transformed.name.toLowerCase()}-${transformed.City.toLowerCase()}-${transformed.State.toLowerCase()}`;
      if (!existingKeys.has(key)) {
        allNewClubs.push(transformed);
        existingKeys.add(key);
        curatedAdded++;
      }
    }
    console.log(`Curated clubs: ${curatedAdded} new clubs`);
    totalAdded += curatedAdded;
  }

  if (totalAdded === 0) {
    console.log('\nNo new clubs to add.');
    return;
  }

  // Combine and sort
  const finalClubs = [...existingClubs, ...allNewClubs];
  finalClubs.sort((a, b) => {
    if (a.State !== b.State) return a.State.localeCompare(b.State);
    if (a.City !== b.City) return a.City.localeCompare(b.City);
    return a.name.localeCompare(b.name);
  });

  // Save
  fs.writeFileSync(clubsFile, JSON.stringify(finalClubs, null, 2));

  console.log(`\n=== Import Complete ===`);
  console.log(`Total clubs now: ${finalClubs.length}`);
  console.log(`Added: ${totalAdded} new clubs`);
}

importAllNewClubs().catch(console.error);
