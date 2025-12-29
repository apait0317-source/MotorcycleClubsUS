import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://www.combatvet.us/chapters';
const DELAY_MS = 2000;
const MAX_RETRIES = 3;
const ITEMS_PER_PAGE = 20;

interface RawChapter {
  chapterId: string;
  subChapter: string;
  city: string;
  state: string;
  stateCode: string;
  website: string;
  sourceUrl: string;
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

const STATE_ABBREVS: Record<string, string> = {
  'al': 'alabama', 'ak': 'alaska', 'az': 'arizona', 'ar': 'arkansas',
  'ca': 'california', 'co': 'colorado', 'ct': 'connecticut', 'de': 'delaware',
  'fl': 'florida', 'ga': 'georgia', 'hi': 'hawaii', 'id': 'idaho',
  'il': 'illinois', 'in': 'indiana', 'ia': 'iowa', 'ks': 'kansas',
  'ky': 'kentucky', 'la': 'louisiana', 'me': 'maine', 'md': 'maryland',
  'ma': 'massachusetts', 'mi': 'michigan', 'mn': 'minnesota', 'ms': 'mississippi',
  'mo': 'missouri', 'mt': 'montana', 'ne': 'nebraska', 'nv': 'nevada',
  'nh': 'new hampshire', 'nj': 'new jersey', 'nm': 'new mexico', 'ny': 'new york',
  'nc': 'north carolina', 'nd': 'north dakota', 'oh': 'ohio', 'ok': 'oklahoma',
  'or': 'oregon', 'pa': 'pennsylvania', 'ri': 'rhode island', 'sc': 'south carolina',
  'sd': 'south dakota', 'tn': 'tennessee', 'tx': 'texas', 'ut': 'utah',
  'vt': 'vermont', 'va': 'virginia', 'wa': 'washington', 'wv': 'west virginia',
  'wi': 'wisconsin', 'wy': 'wyoming', 'dc': 'district of columbia'
};

const OUTPUT_FILE = path.join(__dirname, '../data/scraped-cvma-raw.json');
const CHECKPOINT_FILE = path.join(__dirname, '../data/cvma-checkpoint.json');

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

function getStateCode(stateInput: string): string {
  const normalized = stateInput.toLowerCase().trim();

  // Check if it's already a code
  if (STATE_ABBREVS[normalized]) {
    return normalized;
  }

  // Check if it's a full name
  if (STATE_CODES[normalized]) {
    return STATE_CODES[normalized];
  }

  return '';
}

function getStateName(stateCode: string): string {
  const code = stateCode.toLowerCase();
  const name = STATE_ABBREVS[code];
  if (name) {
    return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  return stateCode;
}

function parseChaptersFromPage(html: string, pageUrl: string): RawChapter[] {
  const $ = cheerio.load(html);
  const chapters: RawChapter[] = [];

  // Find table rows with chapter data (rows have class row0 or row1)
  $('table#chapterList tbody tr').each((_, row) => {
    const $row = $(row);
    const cells = $row.find('td');

    // Expected columns: ID, AppID, ChapterID, SubChapter, City, StateName, StateCode, Website, TaxID, Bylaws, Date, CreatedBy, Published
    if (cells.length >= 8) {
      // Extract data from cells (0-indexed)
      const chapterIdCell = $(cells[2]).text().trim(); // Chapter ID is in column 2
      const subChapterCell = $(cells[3]).text().trim(); // Sub chapter is in column 3
      const cityCell = $(cells[4]).text().trim(); // City is in column 4
      const stateNameCell = $(cells[5]).text().trim(); // State name is in column 5
      const stateCodeCell = $(cells[6]).text().trim(); // State code is in column 6
      const websiteCell = $(cells[7]).text().trim(); // Website is in column 7

      // Skip if missing essential data
      if (!cityCell || !stateCodeCell) {
        return;
      }

      const stateCode = stateCodeCell.toLowerCase();

      // Only include US chapters (valid state codes)
      if (STATE_ABBREVS[stateCode]) {
        chapters.push({
          chapterId: chapterIdCell,
          subChapter: subChapterCell,
          city: cityCell,
          state: stateNameCell,
          stateCode: stateCode,
          website: websiteCell.startsWith('http') ? websiteCell : (websiteCell ? `https://${websiteCell}` : ''),
          sourceUrl: pageUrl
        });
      }
    }
  });

  return chapters;
}

function loadCheckpoint(): { page: number; chapters: RawChapter[] } {
  try {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      const data = JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf-8'));
      console.log(`Resuming from checkpoint: page ${data.page}, ${data.chapters.length} chapters`);
      return data;
    }
  } catch (e) {
    console.log('No valid checkpoint found, starting fresh');
  }
  return { page: 0, chapters: [] };
}

function saveCheckpoint(page: number, chapters: RawChapter[]): void {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify({ page, chapters }, null, 2));
}

async function scrapeCVMA(): Promise<void> {
  console.log('=== CVMA Chapter Scraper ===');
  console.log(`Source: ${BASE_URL}\n`);

  const checkpoint = loadCheckpoint();
  let allChapters = checkpoint.chapters;
  let startPage = checkpoint.page;

  // Scrape pages (10 pages with 20 items each)
  const maxPages = 10;

  for (let page = startPage; page < maxPages; page++) {
    const start = page * ITEMS_PER_PAGE;
    const url = `${BASE_URL}?start=${start}`;

    console.log(`Fetching page ${page + 1}/${maxPages} (start=${start})...`);

    const html = await fetchWithRetry(url);

    if (!html) {
      console.error(`Failed to fetch page ${page + 1}`);
      saveCheckpoint(page, allChapters);
      continue;
    }

    const chapters = parseChaptersFromPage(html, url);
    console.log(`  Found ${chapters.length} chapters`);

    allChapters.push(...chapters);

    // Save checkpoint after each page
    saveCheckpoint(page + 1, allChapters);

    // Rate limiting
    if (page < maxPages - 1) {
      await delay(DELAY_MS);
    }
  }

  // Remove duplicates based on chapter ID + sub chapter + state
  const uniqueChapters: RawChapter[] = [];
  const seen = new Set<string>();

  for (const chapter of allChapters) {
    const key = `${chapter.chapterId}-${chapter.subChapter}-${chapter.stateCode}`.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueChapters.push(chapter);
    }
  }

  // Sort by state then city
  uniqueChapters.sort((a, b) => {
    if (a.state !== b.state) return a.state.localeCompare(b.state);
    return a.city.localeCompare(b.city);
  });

  // Save results
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(uniqueChapters, null, 2));

  // Clean up checkpoint
  if (fs.existsSync(CHECKPOINT_FILE)) {
    fs.unlinkSync(CHECKPOINT_FILE);
  }

  // Stats
  const stateCount: Record<string, number> = {};
  for (const chapter of uniqueChapters) {
    stateCount[chapter.state] = (stateCount[chapter.state] || 0) + 1;
  }

  console.log('\n=== Scraping Complete ===\n');
  console.log(`Total unique chapters: ${uniqueChapters.length}`);
  console.log(`Chapters with websites: ${uniqueChapters.filter(c => c.website).length}`);

  console.log('\nChapters by state:');
  const sortedStates = Object.entries(stateCount).sort((a, b) => b[1] - a[1]);
  for (const [state, count] of sortedStates.slice(0, 15)) {
    console.log(`  ${state}: ${count}`);
  }
  if (sortedStates.length > 15) {
    console.log(`  ... and ${sortedStates.length - 15} more states`);
  }

  console.log(`\nResults saved to: ${OUTPUT_FILE}`);
}

scrapeCVMA().catch(console.error);
