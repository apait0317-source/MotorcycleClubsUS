import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://services.americanmotorcyclist.com/CharterAndEventSearch/Charter';
const DELAY_MS = 1500;
const MAX_RETRIES = 3;

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

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const OUTPUT_FILE = path.join(__dirname, '../data/scraped-ama-raw.json');
const CHECKPOINT_FILE = path.join(__dirname, '../data/ama-checkpoint.json');

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error(`  Attempt ${attempt} failed:`, error);
      if (attempt === retries) {
        return null;
      }
      await delay(DELAY_MS * attempt);
    }
  }
  return null;
}

function parseClubsFromPage(html: string, state: string, pageUrl: string): RawClub[] {
  const $ = cheerio.load(html);
  const clubs: RawClub[] = [];

  $('table.table tr').each((_, row) => {
    const $row = $(row);
    const cells = $row.find('td');

    if (cells.length >= 5) {
      const nameCell = $(cells[0]);
      const name = nameCell.find('a').text().trim() || nameCell.text().trim();
      const detailUrl = nameCell.find('a').attr('href') || '';
      const type = $(cells[1]).text().trim();
      const location = $(cells[2]).text().trim();
      const phone = $(cells[3]).text().trim();
      const websiteLink = $(cells[4]).find('a');
      const website = websiteLink.attr('href') || '';

      // Parse location (City, ST format)
      const locationParts = location.split(',').map(p => p.trim());
      const city = locationParts[0] || '';
      const stateCode = locationParts[1] || state;

      // Skip non-club types (we want motorcycle clubs)
      const clubTypes = ['Club Sanctioning', 'Club Non-Sanctioning', 'Club'];
      const isClub = clubTypes.some(t => type.toLowerCase().includes('club'));

      if (name && city && isClub) {
        clubs.push({
          name,
          type,
          city,
          state: stateCode.toUpperCase(),
          phone,
          website: website && website !== 'http://' ? website : '',
          detailUrl: detailUrl ? `https://services.americanmotorcyclist.com${detailUrl}` : '',
          sourceUrl: pageUrl
        });
      }
    }
  });

  return clubs;
}

function loadCheckpoint(): { stateIndex: number; clubs: RawClub[] } {
  try {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      const data = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf-8'));
      console.log(`Resuming from checkpoint: state ${US_STATES[data.stateIndex]}, ${data.clubs.length} clubs`);
      return data;
    }
  } catch (e) {
    console.log('No valid checkpoint found, starting fresh');
  }
  return { stateIndex: 0, clubs: [] };
}

function saveCheckpoint(stateIndex: number, clubs: RawClub[]): void {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({ stateIndex, clubs }, null, 2));
}

async function scrapeAMA(): Promise<void> {
  console.log('=== AMA Chartered Organizations Scraper ===');
  console.log(`Source: ${BASE_URL}\n`);

  const checkpoint = loadCheckpoint();
  let allClubs = checkpoint.clubs;
  let startIndex = checkpoint.stateIndex;

  for (let i = startIndex; i < US_STATES.length; i++) {
    const state = US_STATES[i];
    const url = `${BASE_URL}?state=${state}`;

    console.log(`Fetching ${state} (${i + 1}/${US_STATES.length})...`);

    const html = await fetchWithRetry(url);

    if (!html) {
      console.error(`  Failed to fetch ${state}`);
      saveCheckpoint(i, allClubs);
      continue;
    }

    const clubs = parseClubsFromPage(html, state, url);
    console.log(`  Found ${clubs.length} clubs`);

    allClubs.push(...clubs);

    // Save checkpoint after each state
    saveCheckpoint(i + 1, allClubs);

    // Rate limiting
    if (i < US_STATES.length - 1) {
      await delay(DELAY_MS);
    }
  }

  // Remove duplicates based on name + state
  const uniqueClubs: RawClub[] = [];
  const seen = new Set<string>();

  for (const club of allClubs) {
    const key = `${club.name.toLowerCase()}-${club.state}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueClubs.push(club);
    }
  }

  // Sort by state then name
  uniqueClubs.sort((a, b) => {
    if (a.state !== b.state) return a.state.localeCompare(b.state);
    return a.name.localeCompare(b.name);
  });

  // Save results
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(uniqueClubs, null, 2));

  // Clean up checkpoint
  if (fs.existsSync(CHECKPOINT_FILE)) {
    fs.unlinkSync(CHECKPOINT_FILE);
  }

  // Stats
  const stateCount: Record<string, number> = {};
  for (const club of uniqueClubs) {
    stateCount[club.state] = (stateCount[club.state] || 0) + 1;
  }

  console.log('\n=== Scraping Complete ===\n');
  console.log(`Total unique clubs: ${uniqueClubs.length}`);
  console.log(`Clubs with websites: ${uniqueClubs.filter(c => c.website).length}`);
  console.log(`Clubs with phone: ${uniqueClubs.filter(c => c.phone).length}`);

  console.log('\nClubs by state:');
  const sortedStates = Object.entries(stateCount).sort((a, b) => b[1] - a[1]);
  for (const [state, count] of sortedStates.slice(0, 15)) {
    console.log(`  ${state}: ${count}`);
  }
  if (sortedStates.length > 15) {
    console.log(`  ... and ${sortedStates.length - 15} more states`);
  }

  console.log(`\nResults saved to: ${OUTPUT_FILE}`);
}

scrapeAMA().catch(console.error);
