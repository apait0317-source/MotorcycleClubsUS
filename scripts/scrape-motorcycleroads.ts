import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://www.motorcycleroads.com';
const CLUBS_URL = `${BASE_URL}/motorcycle-clubs`;
const DELAY_MS = 1500; // 1.5 seconds between requests
const MAX_RETRIES = 3;
const CHECKPOINT_INTERVAL = 50;

interface RawClub {
  referenceNumber: string;
  name: string;
  state: string;
  region: string;
  description: string;
  contactName: string;
  phone: string;
  email: string;
  website: string;
  latitude: number | null;
  longitude: number | null;
  sourceUrl: string;
}

interface ScrapedData {
  clubs: RawClub[];
  lastPage: number;
  lastClubIndex: number;
  totalPages: number;
  completedClubUrls: string[];
}

const OUTPUT_FILE = path.join(__dirname, '../data/scraped-clubs-raw.json');
const CHECKPOINT_FILE = path.join(__dirname, '../data/scrape-checkpoint.json');

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`  Fetching: ${url} (attempt ${attempt})`);
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
        throw error;
      }
      await delay(DELAY_MS * attempt); // Exponential backoff
    }
  }
  throw new Error('Max retries exceeded');
}

function loadCheckpoint(): ScrapedData | null {
  try {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      const data = fs.readFileSync(CHECKPOINT_FILE, 'utf-8');
      console.log('Loaded checkpoint, resuming from previous state...');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load checkpoint:', error);
  }
  return null;
}

function saveCheckpoint(data: ScrapedData): void {
  fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(data, null, 2));
  console.log(`  Checkpoint saved: ${data.clubs.length} clubs scraped`);
}

function saveResults(clubs: RawClub[]): void {
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(clubs, null, 2));
  console.log(`\nResults saved to ${OUTPUT_FILE}`);
}

async function getClubUrlsFromPage(pageNum: number): Promise<string[]> {
  const url = pageNum === 1 ? CLUBS_URL : `${CLUBS_URL}?page=${pageNum}`;
  const html = await fetchWithRetry(url);
  const $ = cheerio.load(html);

  const clubUrls: string[] = [];

  // Find all club links on the listing page
  $('a[href*="/motorcycle-clubs/"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.match(/\/motorcycle-clubs\/[a-z-]+\/[a-z0-9-]+$/i)) {
      const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
      if (!clubUrls.includes(fullUrl)) {
        clubUrls.push(fullUrl);
      }
    }
  });

  return clubUrls;
}

async function getTotalPages(): Promise<number> {
  const html = await fetchWithRetry(CLUBS_URL);
  const $ = cheerio.load(html);

  // Find pagination links to determine total pages
  let maxPage = 1;
  $('a[href*="page="]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const match = href.match(/page=(\d+)/);
    if (match) {
      const pageNum = parseInt(match[1], 10);
      if (pageNum > maxPage) maxPage = pageNum;
    }
  });

  // Also check for "Last" page link text
  const lastPageText = $('a:contains("Last")').attr('href');
  if (lastPageText) {
    const match = lastPageText.match(/page=(\d+)/);
    if (match) {
      const lastPage = parseInt(match[1], 10);
      if (lastPage > maxPage) maxPage = lastPage;
    }
  }

  return maxPage;
}

async function scrapeClubPage(url: string): Promise<RawClub | null> {
  try {
    const html = await fetchWithRetry(url);
    const $ = cheerio.load(html);

    const club: RawClub = {
      referenceNumber: '',
      name: '',
      state: '',
      region: '',
      description: '',
      contactName: '',
      phone: '',
      email: '',
      website: '',
      latitude: null,
      longitude: null,
      sourceUrl: url
    };

    // Extract club name from h1 or title
    club.name = $('h1').first().text().trim() ||
                $('title').text().split('|')[0].trim() ||
                $('h2').first().text().trim();

    // Extract reference number from page content
    const refMatch = html.match(/#(\d{5,})/);
    if (refMatch) {
      club.referenceNumber = refMatch[1];
    }

    // Extract state from URL path
    const urlParts = url.split('/');
    const stateSlug = urlParts[urlParts.length - 2];
    club.state = stateSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    // Look for location/region info
    const pageText = $('body').text();

    // Try to find contact info
    const phoneMatch = pageText.match(/(\d{3}[-.]?\d{3}[-.]?\d{4})/);
    if (phoneMatch) {
      club.phone = phoneMatch[1];
    }

    const emailMatch = pageText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    if (emailMatch) {
      club.email = emailMatch[1];
    }

    // Look for website links
    $('a[href^="http"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      if (!href.includes('motorcycleroads.com') &&
          !href.includes('facebook.com') &&
          !href.includes('twitter.com') &&
          !href.includes('google.com')) {
        if (!club.website) {
          club.website = href;
        }
      }
    });

    // Extract description - look for main content area
    const descriptionCandidates = [
      $('div.description').text(),
      $('div.content p').text(),
      $('article p').text(),
      $('main p').first().text()
    ];

    for (const candidate of descriptionCandidates) {
      if (candidate && candidate.length > 50) {
        club.description = candidate.trim().substring(0, 2000);
        break;
      }
    }

    // Try to extract coordinates from page
    const latMatch = html.match(/latitude['":\s]+([0-9.-]+)/i);
    const lngMatch = html.match(/longitude['":\s]+([0-9.-]+)/i);
    if (latMatch && lngMatch) {
      club.latitude = parseFloat(latMatch[1]);
      club.longitude = parseFloat(lngMatch[1]);
    }

    // Extract contact name
    const contactMatch = pageText.match(/Contact(?:\s+Name)?[:\s]+([A-Z][a-zA-Z]+\s+[A-Z][a-zA-Z]+)/);
    if (contactMatch) {
      club.contactName = contactMatch[1];
    }

    // Look for region info near location labels
    $('*:contains("Location")').each((_, el) => {
      const text = $(el).parent().text();
      if (text.length < 200 && text.includes(',')) {
        club.region = text.replace(/Location[:\s]*/i, '').trim().substring(0, 100);
      }
    });

    if (!club.name) {
      console.log(`  Warning: Could not extract club name from ${url}`);
      return null;
    }

    return club;
  } catch (error) {
    console.error(`  Failed to scrape ${url}:`, error);
    return null;
  }
}

async function scrapeAllClubs(): Promise<void> {
  console.log('=== Motorcycle Clubs Scraper ===');
  console.log(`Source: ${CLUBS_URL}\n`);

  // Load checkpoint or start fresh
  let scrapedData = loadCheckpoint() || {
    clubs: [],
    lastPage: 0,
    lastClubIndex: 0,
    totalPages: 0,
    completedClubUrls: []
  };

  const completedUrls = new Set(scrapedData.completedClubUrls);

  // Get total pages if not already known
  if (scrapedData.totalPages === 0) {
    console.log('Determining total pages...');
    scrapedData.totalPages = await getTotalPages();
    console.log(`Found ${scrapedData.totalPages} pages of clubs\n`);
    await delay(DELAY_MS);
  }

  // Collect all club URLs first
  console.log('Collecting club URLs from listing pages...');
  const allClubUrls: string[] = [];

  for (let page = scrapedData.lastPage + 1; page <= scrapedData.totalPages; page++) {
    console.log(`Page ${page}/${scrapedData.totalPages}`);

    try {
      const urls = await getClubUrlsFromPage(page);
      console.log(`  Found ${urls.length} clubs`);

      for (const url of urls) {
        if (!completedUrls.has(url) && !allClubUrls.includes(url)) {
          allClubUrls.push(url);
        }
      }

      scrapedData.lastPage = page;
      await delay(DELAY_MS);
    } catch (error) {
      console.error(`  Failed to fetch page ${page}:`, error);
      saveCheckpoint(scrapedData);
    }
  }

  console.log(`\nTotal unique club URLs to scrape: ${allClubUrls.length}\n`);

  // Scrape each club page
  let processed = 0;
  let failed = 0;

  for (let i = scrapedData.lastClubIndex; i < allClubUrls.length; i++) {
    const url = allClubUrls[i];
    processed++;

    console.log(`[${processed}/${allClubUrls.length}] Scraping club...`);

    const club = await scrapeClubPage(url);

    if (club) {
      scrapedData.clubs.push(club);
      completedUrls.add(url);
      scrapedData.completedClubUrls.push(url);
      console.log(`  ✓ ${club.name} (${club.state})`);
    } else {
      failed++;
      console.log(`  ✗ Failed to extract data`);
    }

    scrapedData.lastClubIndex = i + 1;

    // Save checkpoint periodically
    if (processed % CHECKPOINT_INTERVAL === 0) {
      saveCheckpoint(scrapedData);
    }

    await delay(DELAY_MS);
  }

  // Save final results
  saveResults(scrapedData.clubs);

  // Clean up checkpoint file
  if (fs.existsSync(CHECKPOINT_FILE)) {
    fs.unlinkSync(CHECKPOINT_FILE);
  }

  console.log('\n=== Scraping Complete ===');
  console.log(`Total clubs scraped: ${scrapedData.clubs.length}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success rate: ${((scrapedData.clubs.length / processed) * 100).toFixed(1)}%`);
}

// Run the scraper
scrapeAllClubs().catch(console.error);
