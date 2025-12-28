import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://ridersinfo.net/clubs/';
const DELAY_MS = 2000;
const MAX_RETRIES = 3;

interface RawClub {
  name: string;
  state: string;
  stateCode: string;
  website: string;
  description: string;
  category: string;
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

const OUTPUT_FILE = path.join(__dirname, '../data/scraped-ridersinfo-raw.json');

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
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

function getStateCode(stateName: string): string {
  const normalized = stateName.toLowerCase().trim();
  return STATE_CODES[normalized] || normalized.substring(0, 2);
}

function extractClubsFromPage(html: string): RawClub[] {
  const $ = cheerio.load(html);
  const clubs: RawClub[] = [];

  let currentState = '';
  let currentStateCode = '';

  // The page structure has state headers (h2 or h3) followed by club listings
  // Clubs are typically in lists or paragraphs with links

  $('h2, h3, h4').each((_, headerEl) => {
    const headerText = $(headerEl).text().trim().toUpperCase();

    // Check if this is a state header
    const stateMatch = Object.keys(STATE_CODES).find(state =>
      headerText.includes(state.toUpperCase())
    );

    if (stateMatch) {
      currentState = stateMatch.charAt(0).toUpperCase() + stateMatch.slice(1);
      currentStateCode = STATE_CODES[stateMatch];

      // Get all following elements until next header
      let $next = $(headerEl).next();

      while ($next.length && !$next.is('h2, h3, h4')) {
        // Look for club links and names
        $next.find('a').each((_, linkEl) => {
          const $link = $(linkEl);
          const name = $link.text().trim();
          const website = $link.attr('href') || '';

          // Skip navigation links and empty names
          if (name.length > 3 &&
              !name.toLowerCase().includes('click here') &&
              !name.toLowerCase().includes('back to top') &&
              !website.includes('#') &&
              !website.startsWith('/')) {

            // Get surrounding text for description
            const parentText = $link.parent().text().trim();
            const description = parentText.replace(name, '').trim();

            // Determine category from name
            let category = 'Motorcycle club';
            const lowerName = name.toLowerCase();
            if (lowerName.includes('trail') || lowerName.includes('dirt') || lowerName.includes('enduro')) {
              category = 'Off-road Motorcycle club';
            } else if (lowerName.includes('hog') || lowerName.includes('harley')) {
              category = 'Harley Owners Group';
            } else if (lowerName.includes('bmw')) {
              category = 'BMW Motorcycle club';
            } else if (lowerName.includes('race') || lowerName.includes('mx') || lowerName.includes('motocross')) {
              category = 'Racing club';
            } else if (lowerName.includes('veteran') || lowerName.includes('military')) {
              category = 'Veterans Motorcycle club';
            } else if (lowerName.includes('christian') || lowerName.includes('faith')) {
              category = 'Christian Motorcycle club';
            } else if (lowerName.includes('blue knight') || lowerName.includes('law enforcement')) {
              category = 'Law Enforcement Motorcycle club';
            }

            clubs.push({
              name,
              state: currentState,
              stateCode: currentStateCode,
              website: website.startsWith('http') ? website : (website ? `https://${website}` : ''),
              description: description.substring(0, 500),
              category,
              sourceUrl: BASE_URL
            });
          }
        });

        // Also look for plain text club names (without links)
        const listItems = $next.find('li');
        if (listItems.length) {
          listItems.each((_, liEl) => {
            const $li = $(liEl);
            // Skip if already processed via links
            if ($li.find('a').length === 0) {
              const text = $li.text().trim();
              if (text.length > 3 && text.length < 100) {
                clubs.push({
                  name: text,
                  state: currentState,
                  stateCode: currentStateCode,
                  website: '',
                  description: '',
                  category: 'Motorcycle club',
                  sourceUrl: BASE_URL
                });
              }
            }
          });
        }

        $next = $next.next();
      }
    }
  });

  // Also try a more generic approach - find all links that look like club websites
  $('a[href*=".com"], a[href*=".org"], a[href*=".net"]').each((_, el) => {
    const $link = $(el);
    const name = $link.text().trim();
    const href = $link.attr('href') || '';

    // Skip if we already have this club
    if (clubs.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      return;
    }

    // Check if this looks like a club name
    const lowerName = name.toLowerCase();
    if (name.length > 5 && name.length < 100 &&
        (lowerName.includes('mc') ||
         lowerName.includes('club') ||
         lowerName.includes('rider') ||
         lowerName.includes('association') ||
         lowerName.includes('m/c'))) {

      // Try to determine state from context
      const parentText = $link.parents('div, section, td').first().text();
      let foundState = '';
      let foundStateCode = '';

      for (const [state, code] of Object.entries(STATE_CODES)) {
        if (parentText.toLowerCase().includes(state)) {
          foundState = state.charAt(0).toUpperCase() + state.slice(1);
          foundStateCode = code;
          break;
        }
      }

      if (foundState) {
        clubs.push({
          name,
          state: foundState,
          stateCode: foundStateCode,
          website: href.startsWith('http') ? href : `https://${href}`,
          description: '',
          category: 'Motorcycle club',
          sourceUrl: BASE_URL
        });
      }
    }
  });

  return clubs;
}

async function scrapeRidersInfo(): Promise<void> {
  console.log('=== RidersInfo.net Scraper ===');
  console.log(`Source: ${BASE_URL}\n`);

  const html = await fetchWithRetry(BASE_URL);

  if (!html) {
    console.error('Failed to fetch the page');
    process.exit(1);
  }

  console.log('Parsing page content...\n');

  const clubs = extractClubsFromPage(html);

  // Remove duplicates based on name + state
  const uniqueClubs: RawClub[] = [];
  const seen = new Set<string>();

  for (const club of clubs) {
    const key = `${club.name.toLowerCase()}-${club.stateCode}`;
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

  // Stats
  const stateCount: Record<string, number> = {};
  for (const club of uniqueClubs) {
    stateCount[club.state] = (stateCount[club.state] || 0) + 1;
  }

  console.log('=== Scraping Complete ===\n');
  console.log(`Total unique clubs: ${uniqueClubs.length}`);
  console.log(`Clubs with websites: ${uniqueClubs.filter(c => c.website).length}`);

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

scrapeRidersInfo().catch(console.error);
