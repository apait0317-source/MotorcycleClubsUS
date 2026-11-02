import { parseRiderClubListings, type RawRiderClub as RawClub } from './lib/riderclubs-parser';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://www.riderclubs.com';
const DELAY_MS = 2000; // 2 seconds between requests (being extra safe)
const MAX_RETRIES = 3;

// Major US cities to scrape (organized by state)
const US_CITIES: { state: string; stateCode: string; cities: string[] }[] = [
  { state: 'Alabama', stateCode: 'al', cities: ['birmingham', 'montgomery', 'mobile', 'huntsville'] },
  { state: 'Alaska', stateCode: 'ak', cities: ['anchorage', 'fairbanks', 'juneau'] },
  { state: 'Arizona', stateCode: 'az', cities: ['phoenix', 'tucson', 'mesa', 'scottsdale', 'chandler'] },
  { state: 'Arkansas', stateCode: 'ar', cities: ['little-rock', 'fort-smith', 'fayetteville'] },
  { state: 'California', stateCode: 'ca', cities: ['los-angeles', 'san-francisco', 'san-diego', 'san-jose', 'sacramento', 'fresno', 'oakland', 'long-beach', 'bakersfield', 'anaheim', 'santa-ana', 'riverside', 'stockton', 'irvine'] },
  { state: 'Colorado', stateCode: 'co', cities: ['denver', 'colorado-springs', 'aurora', 'fort-collins', 'boulder'] },
  { state: 'Connecticut', stateCode: 'ct', cities: ['bridgeport', 'new-haven', 'hartford', 'stamford'] },
  { state: 'Delaware', stateCode: 'de', cities: ['wilmington', 'dover', 'newark'] },
  { state: 'Florida', stateCode: 'fl', cities: ['miami', 'orlando', 'tampa', 'jacksonville', 'fort-lauderdale', 'st-petersburg', 'hialeah', 'tallahassee', 'cape-coral', 'fort-myers', 'daytona-beach'] },
  { state: 'Georgia', stateCode: 'ga', cities: ['atlanta', 'augusta', 'columbus', 'savannah', 'athens', 'macon'] },
  { state: 'Hawaii', stateCode: 'hi', cities: ['honolulu', 'pearl-city', 'hilo'] },
  { state: 'Idaho', stateCode: 'id', cities: ['boise', 'meridian', 'nampa', 'idaho-falls'] },
  { state: 'Illinois', stateCode: 'il', cities: ['chicago', 'aurora', 'naperville', 'rockford', 'joliet', 'springfield'] },
  { state: 'Indiana', stateCode: 'in', cities: ['indianapolis', 'fort-wayne', 'evansville', 'south-bend', 'carmel'] },
  { state: 'Iowa', stateCode: 'ia', cities: ['des-moines', 'cedar-rapids', 'davenport', 'sioux-city'] },
  { state: 'Kansas', stateCode: 'ks', cities: ['wichita', 'overland-park', 'kansas-city', 'topeka', 'olathe'] },
  { state: 'Kentucky', stateCode: 'ky', cities: ['louisville', 'lexington', 'bowling-green', 'owensboro'] },
  { state: 'Louisiana', stateCode: 'la', cities: ['new-orleans', 'baton-rouge', 'shreveport', 'lafayette'] },
  { state: 'Maine', stateCode: 'me', cities: ['portland', 'lewiston', 'bangor'] },
  { state: 'Maryland', stateCode: 'md', cities: ['baltimore', 'frederick', 'rockville', 'gaithersburg', 'annapolis'] },
  { state: 'Massachusetts', stateCode: 'ma', cities: ['boston', 'worcester', 'springfield', 'cambridge', 'lowell'] },
  { state: 'Michigan', stateCode: 'mi', cities: ['detroit', 'grand-rapids', 'warren', 'sterling-heights', 'ann-arbor', 'lansing', 'flint'] },
  { state: 'Minnesota', stateCode: 'mn', cities: ['minneapolis', 'saint-paul', 'rochester', 'duluth', 'bloomington'] },
  { state: 'Mississippi', stateCode: 'ms', cities: ['jackson', 'gulfport', 'southaven', 'biloxi'] },
  { state: 'Missouri', stateCode: 'mo', cities: ['kansas-city', 'saint-louis', 'springfield', 'columbia', 'independence'] },
  { state: 'Montana', stateCode: 'mt', cities: ['billings', 'missoula', 'great-falls', 'bozeman'] },
  { state: 'Nebraska', stateCode: 'ne', cities: ['omaha', 'lincoln', 'bellevue', 'grand-island'] },
  { state: 'Nevada', stateCode: 'nv', cities: ['las-vegas', 'henderson', 'reno', 'north-las-vegas', 'sparks'] },
  { state: 'New Hampshire', stateCode: 'nh', cities: ['manchester', 'nashua', 'concord', 'derry'] },
  { state: 'New Jersey', stateCode: 'nj', cities: ['newark', 'jersey-city', 'paterson', 'elizabeth', 'trenton', 'clifton'] },
  { state: 'New Mexico', stateCode: 'nm', cities: ['albuquerque', 'las-cruces', 'rio-rancho', 'santa-fe'] },
  { state: 'New York', stateCode: 'ny', cities: ['new-york', 'buffalo', 'rochester', 'yonkers', 'syracuse', 'albany'] },
  { state: 'North Carolina', stateCode: 'nc', cities: ['charlotte', 'raleigh', 'greensboro', 'durham', 'winston-salem', 'fayetteville', 'wilmington'] },
  { state: 'North Dakota', stateCode: 'nd', cities: ['fargo', 'bismarck', 'grand-forks', 'minot'] },
  { state: 'Ohio', stateCode: 'oh', cities: ['columbus', 'cleveland', 'cincinnati', 'toledo', 'akron', 'dayton'] },
  { state: 'Oklahoma', stateCode: 'ok', cities: ['oklahoma-city', 'tulsa', 'norman', 'broken-arrow', 'edmond'] },
  { state: 'Oregon', stateCode: 'or', cities: ['portland', 'eugene', 'salem', 'gresham', 'hillsboro', 'bend'] },
  { state: 'Pennsylvania', stateCode: 'pa', cities: ['philadelphia', 'pittsburgh', 'allentown', 'reading', 'erie', 'scranton'] },
  { state: 'Rhode Island', stateCode: 'ri', cities: ['providence', 'warwick', 'cranston', 'pawtucket'] },
  { state: 'South Carolina', stateCode: 'sc', cities: ['charleston', 'columbia', 'north-charleston', 'mount-pleasant', 'greenville', 'myrtle-beach'] },
  { state: 'South Dakota', stateCode: 'sd', cities: ['sioux-falls', 'rapid-city', 'aberdeen', 'sturgis'] },
  { state: 'Tennessee', stateCode: 'tn', cities: ['nashville', 'memphis', 'knoxville', 'chattanooga', 'clarksville'] },
  { state: 'Texas', stateCode: 'tx', cities: ['houston', 'san-antonio', 'dallas', 'austin', 'fort-worth', 'el-paso', 'arlington', 'corpus-christi', 'plano', 'lubbock', 'laredo'] },
  { state: 'Utah', stateCode: 'ut', cities: ['salt-lake-city', 'west-valley-city', 'provo', 'west-jordan', 'orem', 'sandy'] },
  { state: 'Vermont', stateCode: 'vt', cities: ['burlington', 'essex', 'south-burlington', 'colchester'] },
  { state: 'Virginia', stateCode: 'va', cities: ['virginia-beach', 'norfolk', 'chesapeake', 'richmond', 'newport-news', 'alexandria', 'hampton', 'roanoke'] },
  { state: 'Washington', stateCode: 'wa', cities: ['seattle', 'spokane', 'tacoma', 'vancouver', 'bellevue', 'kent', 'everett'] },
  { state: 'West Virginia', stateCode: 'wv', cities: ['charleston', 'huntington', 'morgantown', 'parkersburg'] },
  { state: 'Wisconsin', stateCode: 'wi', cities: ['milwaukee', 'madison', 'green-bay', 'kenosha', 'racine'] },
  { state: 'Wyoming', stateCode: 'wy', cities: ['cheyenne', 'casper', 'laramie', 'gillette'] },
];

const OUTPUT_FILE = path.join(__dirname, '../data/scraped-riderclubs-raw.json');

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

      if (response.status === 404) {
        return null; // City not found, skip
      }

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

async function scrapeCity(stateInfo: { state: string; stateCode: string }, city: string): Promise<RawClub[]> {
  const stateSlug = stateInfo.state.toLowerCase().replace(/\s+/g, '-');
  const url = `${BASE_URL}/motorcycle-clubs/united-states/${stateSlug}/${city}`;

  const html = await fetchWithRetry(url);
  if (!html) {
    return [];
  }

  return parseRiderClubListings(html);
}

async function scrapeAllCities(): Promise<void> {
  console.log('=== RiderClubs.com Scraper ===');
  console.log(`Source: ${BASE_URL}/motorcycle-clubs/united-states\n`);

  const allClubs: RawClub[] = [];
  const seenSources = new Set<string>();
  let citiesProcessed = 0;
  let citiesWithClubs = 0;

  const totalCities = US_CITIES.reduce((acc, s) => acc + s.cities.length, 0);

  for (const stateInfo of US_CITIES) {
    console.log(`\n${stateInfo.state}:`);

    for (const city of stateInfo.cities) {
      citiesProcessed++;
      process.stdout.write(`  ${city} (${citiesProcessed}/${totalCities})... `);

      const clubs = await scrapeCity(stateInfo, city);

      if (clubs.length > 0) {
        citiesWithClubs++;
        let newClubs = 0;

        for (const club of clubs) {
          const key = club.sourceUrl;
          if (!seenSources.has(key)) {
            seenSources.add(key);
            allClubs.push(club);
            newClubs++;
          }
        }

        console.log(`${clubs.length} found (${newClubs} new)`);
      } else {
        console.log('no structured US candidates');
      }

      await delay(DELAY_MS);
    }
  }

  // Save results
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allClubs, null, 2));

  console.log('\n=== Scraping Complete ===');
  console.log(`Cities processed: ${citiesProcessed}`);
  console.log(`Cities with clubs: ${citiesWithClubs}`);
  console.log(`Total unique clubs: ${allClubs.length}`);
  console.log(`\nResults saved to: ${OUTPUT_FILE}`);
}

scrapeAllCities().catch(console.error);
