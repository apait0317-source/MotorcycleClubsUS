import * as fs from 'fs';
import * as path from 'path';

interface CSVRow {
  parentClub: string;
  chapterName: string;
  location: string;
  websiteUrl: string;
  facebookPage: string;
  instagramHandle: string;
  contactInfo: string;
  yearFounded: string;
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

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseLocation(location: string): { city: string; state: string; stateCode: string } | null {
  if (!location || location === 'United States') {
    return null;
  }

  // Handle "(Nomad)" locations
  if (location.includes('(Nomad)')) {
    const statePart = location.replace('(Nomad)', '').trim();
    const stateCode = STATE_CODES[statePart.toLowerCase()];
    if (stateCode) {
      return {
        city: 'nomad',
        state: statePart,
        stateCode: stateCode
      };
    }
    return null;
  }

  // Handle "City, State" format
  const parts = location.split(',').map(p => p.trim());

  if (parts.length >= 2) {
    const city = parts[0];
    const state = parts[parts.length - 1];
    const stateCode = STATE_CODES[state.toLowerCase()];

    if (stateCode) {
      return {
        city: city.toLowerCase(),
        state: state,
        stateCode: stateCode
      };
    }
  }

  // Handle state-only locations (e.g., "California", "New Hampshire")
  const stateCode = STATE_CODES[location.toLowerCase()];
  if (stateCode) {
    // Use state capital or major city as default
    const capitalCities: Record<string, string> = {
      'al': 'montgomery', 'ak': 'anchorage', 'az': 'phoenix', 'ar': 'little rock',
      'ca': 'sacramento', 'co': 'denver', 'ct': 'hartford', 'de': 'wilmington',
      'fl': 'tallahassee', 'ga': 'atlanta', 'hi': 'honolulu', 'id': 'boise',
      'il': 'springfield', 'in': 'indianapolis', 'ia': 'des moines', 'ks': 'topeka',
      'ky': 'frankfort', 'la': 'baton rouge', 'me': 'augusta', 'md': 'annapolis',
      'ma': 'boston', 'mi': 'lansing', 'mn': 'st. paul', 'ms': 'jackson',
      'mo': 'jefferson city', 'mt': 'helena', 'ne': 'lincoln', 'nv': 'carson city',
      'nh': 'concord', 'nj': 'trenton', 'nm': 'santa fe', 'ny': 'albany',
      'nc': 'raleigh', 'nd': 'bismarck', 'oh': 'columbus', 'ok': 'oklahoma city',
      'or': 'salem', 'pa': 'harrisburg', 'ri': 'providence', 'sc': 'columbia',
      'sd': 'pierre', 'tn': 'nashville', 'tx': 'austin', 'ut': 'salt lake city',
      'vt': 'montpelier', 'va': 'richmond', 'wa': 'olympia', 'wv': 'charleston',
      'wi': 'madison', 'wy': 'cheyenne', 'dc': 'washington'
    };

    return {
      city: capitalCities[stateCode] || location.toLowerCase(),
      state: location,
      stateCode: stateCode
    };
  }

  // Handle "Northern California" type locations
  if (location.toLowerCase().includes('california')) {
    return { city: 'sacramento', state: 'California', stateCode: 'ca' };
  }

  return null;
}

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

function generatePlaceId(parentClub: string, chapterName: string, stateCode: string): string {
  const hash = `${parentClub}-${chapterName}-${stateCode}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
  return `csv_${hash}_${Date.now().toString(36)}`;
}

function buildDescription(row: CSVRow): string {
  const parts: string[] = [];

  // Add chapter info
  if (row.chapterName && row.chapterName !== row.parentClub) {
    parts.push(`${row.chapterName} chapter of ${row.parentClub}.`);
  }

  // Add founding year
  if (row.yearFounded && row.yearFounded !== '') {
    const year = parseFloat(row.yearFounded);
    if (!isNaN(year) && year > 1900) {
      parts.push(`Founded in ${Math.floor(year)}.`);
    }
  }

  // Add contact info
  if (row.contactInfo && row.contactInfo !== '') {
    parts.push(`Contact: ${row.contactInfo}`);
  }

  // Add social links
  const socialLinks: string[] = [];
  if (row.facebookPage) {
    socialLinks.push(`Facebook: ${row.facebookPage}`);
  }
  if (row.instagramHandle) {
    socialLinks.push(`Instagram: ${row.instagramHandle}`);
  }
  if (socialLinks.length > 0) {
    parts.push(socialLinks.join(' | '));
  }

  return parts.join('\n\n');
}

function generateClubName(parentClub: string, chapterName: string): string {
  // If chapter name is same as parent or generic
  if (!chapterName || chapterName === parentClub) {
    return parentClub;
  }

  // If it's a location-based chapter name (e.g., "Austin" for "Bandidos MC")
  // Create name like "Bandidos MC - Austin"
  if (parentClub.includes('MC') || parentClub.includes('Association')) {
    return `${parentClub} - ${chapterName}`;
  }

  // For HOG chapters, CVMA chapters, etc.
  return `${chapterName}`;
}

function transformRow(row: CSVRow): TransformedClub | null {
  const location = parseLocation(row.location);

  if (!location) {
    // Skip entries without valid US location
    return null;
  }

  const clubName = generateClubName(row.parentClub, row.chapterName);
  const citySlug = generateCitySlug(location.city);
  const stateName = STATE_NAMES[location.stateCode];

  return {
    place_id: generatePlaceId(row.parentClub, row.chapterName, location.stateCode),
    name: clubName,
    slug: generateSlug(clubName, location.city, location.stateCode),
    description: buildDescription(row),
    reviews: 0,
    rating: 0,
    website: row.websiteUrl || '',
    phone: row.contactInfo && row.contactInfo.match(/[\d-]{7,}/) ? row.contactInfo : '',
    featured_image: '',
    main_category: 'Motorcycle club',
    categories: 'Motorcycle club',
    closed_on: '',
    address: row.location,
    link: '',
    City: location.city,
    State: location.stateCode,
    stateName: stateName,
    citySlug: citySlug,
    query: '',
    'query-02': ''
  };
}

async function importCSV(): Promise<void> {
  const csvFile = path.join(__dirname, '../public/usa_motorcycle_clubs_comprehensive_chapters.csv');
  const outputFile = path.join(__dirname, '../data/scraped-csv-chapters.json');

  console.log('=== Import CSV Chapters ===\n');

  if (!fs.existsSync(csvFile)) {
    console.error(`CSV file not found: ${csvFile}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvFile, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  console.log(`Total lines in CSV: ${lines.length}`);

  // Skip header
  const header = parseCSVLine(lines[0]);
  console.log(`Header columns: ${header.join(', ')}\n`);

  const clubs: TransformedClub[] = [];
  const skipped: string[] = [];
  const byParentClub: Record<string, number> = {};

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);

    if (fields.length < 3) {
      skipped.push(`Line ${i + 1}: Not enough fields`);
      continue;
    }

    const row: CSVRow = {
      parentClub: fields[0] || '',
      chapterName: fields[1] || '',
      location: fields[2] || '',
      websiteUrl: fields[3] || '',
      facebookPage: fields[4] || '',
      instagramHandle: fields[5] || '',
      contactInfo: fields[6] || '',
      yearFounded: fields[7] || ''
    };

    const club = transformRow(row);

    if (club) {
      clubs.push(club);
      byParentClub[row.parentClub] = (byParentClub[row.parentClub] || 0) + 1;
    } else {
      skipped.push(`${row.parentClub} - ${row.chapterName} (${row.location})`);
    }
  }

  // Sort by state then name
  clubs.sort((a, b) => {
    if (a.stateName !== b.stateName) {
      return a.stateName.localeCompare(b.stateName);
    }
    return a.name.localeCompare(b.name);
  });

  // Save transformed data
  fs.writeFileSync(outputFile, JSON.stringify(clubs, null, 2));

  console.log('=== Import Complete ===\n');
  console.log(`Imported: ${clubs.length} clubs`);
  console.log(`Skipped: ${skipped.length} entries\n`);

  console.log('Clubs by parent organization:');
  const sortedParents = Object.entries(byParentClub).sort((a, b) => b[1] - a[1]);
  for (const [parent, count] of sortedParents.slice(0, 15)) {
    console.log(`  ${parent}: ${count}`);
  }

  if (skipped.length > 0) {
    console.log(`\nSkipped entries (first 10):`);
    skipped.slice(0, 10).forEach(s => console.log(`  - ${s}`));
  }

  console.log(`\nOutput saved to: ${outputFile}`);
}

importCSV().catch(console.error);
