import * as fs from 'fs';
import * as path from 'path';

interface Club {
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

interface State {
  code: string;
  name: string;
  clubCount: number;
  cityCount: number;
}

interface City {
  name: string;
  slug: string;
  state: string;
  stateName: string;
  clubCount: number;
}

// Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*(mc|m\.c\.|motorcycle club|riding club|riders club|chapter|#\d+)\s*/gi, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function similarityScore(name1: string, name2: string): number {
  const norm1 = normalizeName(name1);
  const norm2 = normalizeName(name2);

  if (norm1 === norm2) return 1;

  const distance = levenshteinDistance(norm1, norm2);
  const maxLength = Math.max(norm1.length, norm2.length);

  if (maxLength === 0) return 0;

  return 1 - (distance / maxLength);
}

function findMatchingClub(newClub: Club, existingClubs: Club[]): Club | null {
  const SIMILARITY_THRESHOLD = 0.8;

  // First try exact slug match
  const exactMatch = existingClubs.find(c => c.slug === newClub.slug);
  if (exactMatch) return exactMatch;

  // Then try fuzzy name match within same state
  const stateClubs = existingClubs.filter(c => c.State === newClub.State);

  let bestMatch: Club | null = null;
  let bestScore = 0;

  for (const existing of stateClubs) {
    const score = similarityScore(newClub.name, existing.name);
    if (score > bestScore && score >= SIMILARITY_THRESHOLD) {
      bestScore = score;
      bestMatch = existing;
    }
  }

  if (bestMatch) {
    console.log(`  Matched: "${newClub.name}" -> "${bestMatch.name}" (${(bestScore * 100).toFixed(1)}%)`);
  }

  return bestMatch;
}

function enrichClub(existing: Club, newClub: Club): { club: Club; enriched: boolean } {
  let enriched = false;
  const updated = { ...existing };

  // Enrich missing fields
  if (!existing.phone && newClub.phone) {
    updated.phone = newClub.phone;
    enriched = true;
  }

  if (!existing.website && newClub.website) {
    updated.website = newClub.website;
    enriched = true;
  }

  if (!existing.description && newClub.description) {
    updated.description = newClub.description;
    enriched = true;
  }

  if (!existing.link && newClub.link) {
    updated.link = newClub.link;
    enriched = true;
  }

  return { club: updated, enriched };
}

function generateUniqueSlug(baseSlug: string, existingSlugs: Set<string>): string {
  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  while (existingSlugs.has(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}

function recalculateStateCounts(clubs: Club[], states: State[]): State[] {
  const stateCounts: Record<string, number> = {};
  const stateCities: Record<string, Set<string>> = {};

  for (const club of clubs) {
    const stateCode = club.State.toLowerCase();
    stateCounts[stateCode] = (stateCounts[stateCode] || 0) + 1;

    if (!stateCities[stateCode]) {
      stateCities[stateCode] = new Set();
    }
    stateCities[stateCode].add(club.citySlug);
  }

  return states.map(state => ({
    ...state,
    clubCount: stateCounts[state.code] || 0,
    cityCount: stateCities[state.code]?.size || 0
  }));
}

function recalculateCityCounts(clubs: Club[], existingCities: City[]): City[] {
  const cityCounts: Record<string, number> = {};
  const cityInfo: Record<string, { name: string; state: string; stateName: string }> = {};

  for (const club of clubs) {
    const key = `${club.State}-${club.citySlug}`;
    cityCounts[key] = (cityCounts[key] || 0) + 1;

    if (!cityInfo[key]) {
      cityInfo[key] = {
        name: club.City,
        state: club.State,
        stateName: club.stateName
      };
    }
  }

  // Merge existing cities with new ones
  const allCities: City[] = [];
  const seenKeys = new Set<string>();

  // First add existing cities with updated counts
  for (const city of existingCities) {
    const key = `${city.state}-${city.slug}`;
    seenKeys.add(key);

    allCities.push({
      ...city,
      clubCount: cityCounts[key] || city.clubCount
    });
  }

  // Add new cities
  for (const [key, info] of Object.entries(cityInfo)) {
    if (!seenKeys.has(key)) {
      // Split only on first dash to preserve multi-part slugs like "san-diego"
      const dashIndex = key.indexOf('-');
      const state = key.substring(0, dashIndex);
      const slug = key.substring(dashIndex + 1);
      allCities.push({
        name: info.name,
        slug: slug,
        state: state,
        stateName: info.stateName,
        clubCount: cityCounts[key]
      });
    }
  }

  return allCities.sort((a, b) => {
    if (a.state !== b.state) return a.state.localeCompare(b.state);
    return a.name.localeCompare(b.name);
  });
}

async function mergeData(): Promise<void> {
  const existingClubsFile = path.join(__dirname, '../data/clubs.json');
  const statesFile = path.join(__dirname, '../data/states.json');
  const citiesFile = path.join(__dirname, '../data/cities.json');

  // Check for source file argument or use default
  const sourceArg = process.argv[2];

  // Possible source files to merge
  const sourceFiles = [
    path.join(__dirname, '../data/scraped-clubs-transformed.json'),
    path.join(__dirname, '../data/scraped-riderclubs-transformed.json'),
    path.join(__dirname, '../data/scraped-ridersinfo-transformed.json'),
    path.join(__dirname, '../data/scraped-cvma-transformed.json'),
    path.join(__dirname, '../data/scraped-ama-transformed.json'),
  ];

  // If specific source provided, use that
  let scrapedClubsFile: string;
  if (sourceArg) {
    scrapedClubsFile = path.join(__dirname, '../data', sourceArg);
  } else {
    // Find the most recently modified source file
    const existingSourceFiles = sourceFiles.filter(f => fs.existsSync(f));
    if (existingSourceFiles.length === 0) {
      console.error('No scraped data files found. Run a scraper first.');
      process.exit(1);
    }
    // Get the most recently modified file
    scrapedClubsFile = existingSourceFiles.reduce((latest, current) => {
      const latestTime = fs.statSync(latest).mtime.getTime();
      const currentTime = fs.statSync(current).mtime.getTime();
      return currentTime > latestTime ? current : latest;
    });
  }

  console.log('=== Merge Club Data ===\n');
  console.log(`Source: ${path.basename(scrapedClubsFile)}\n`);

  // Load existing data
  if (!fs.existsSync(existingClubsFile)) {
    console.error(`Existing clubs file not found: ${existingClubsFile}`);
    process.exit(1);
  }

  if (!fs.existsSync(scrapedClubsFile)) {
    console.error(`Scraped clubs file not found: ${scrapedClubsFile}`);
    console.error('Run a scraper and transformer first.');
    process.exit(1);
  }

  const existingClubs: Club[] = JSON.parse(fs.readFileSync(existingClubsFile, 'utf-8'));
  const scrapedClubs: Club[] = JSON.parse(fs.readFileSync(scrapedClubsFile, 'utf-8'));
  const states: State[] = JSON.parse(fs.readFileSync(statesFile, 'utf-8'));
  const cities: City[] = JSON.parse(fs.readFileSync(citiesFile, 'utf-8'));

  console.log(`Existing clubs: ${existingClubs.length}`);
  console.log(`Scraped clubs: ${scrapedClubs.length}\n`);

  // Track slugs for uniqueness
  const existingSlugs = new Set(existingClubs.map(c => c.slug));
  const existingPlaceIds = new Set(existingClubs.map(c => c.place_id));

  // Merge results
  const mergedClubs: Club[] = [...existingClubs];
  let newClubsAdded = 0;
  let existingClubsEnriched = 0;
  let skippedDuplicates = 0;

  for (const scraped of scrapedClubs) {
    // Skip if place_id already exists
    if (existingPlaceIds.has(scraped.place_id)) {
      skippedDuplicates++;
      continue;
    }

    // Look for matching club by name
    const matchIndex = mergedClubs.findIndex(c => {
      const match = findMatchingClub(scraped, [c]);
      return match !== null;
    });

    if (matchIndex >= 0) {
      // Enrich existing club
      const { club, enriched } = enrichClub(mergedClubs[matchIndex], scraped);
      mergedClubs[matchIndex] = club;

      if (enriched) {
        existingClubsEnriched++;
        console.log(`  Enriched: ${club.name}`);
      }
    } else {
      // Add as new club with unique slug
      const uniqueSlug = generateUniqueSlug(scraped.slug, existingSlugs);
      existingSlugs.add(uniqueSlug);
      existingPlaceIds.add(scraped.place_id);

      mergedClubs.push({
        ...scraped,
        slug: uniqueSlug
      });

      newClubsAdded++;
      console.log(`  Added: ${scraped.name} (${scraped.stateName})`);
    }
  }

  // Sort merged clubs
  mergedClubs.sort((a, b) => {
    if (a.stateName !== b.stateName) return a.stateName.localeCompare(b.stateName);
    if (a.City !== b.City) return a.City.localeCompare(b.City);
    return a.name.localeCompare(b.name);
  });

  // Recalculate state and city counts
  const updatedStates = recalculateStateCounts(mergedClubs, states);
  const updatedCities = recalculateCityCounts(mergedClubs, cities);

  // Save merged data
  fs.writeFileSync(existingClubsFile, JSON.stringify(mergedClubs, null, 2));
  fs.writeFileSync(statesFile, JSON.stringify(updatedStates, null, 2));
  fs.writeFileSync(citiesFile, JSON.stringify(updatedCities, null, 2));

  console.log('\n=== Merge Complete ===\n');
  console.log(`Total clubs: ${mergedClubs.length}`);
  console.log(`New clubs added: ${newClubsAdded}`);
  console.log(`Existing clubs enriched: ${existingClubsEnriched}`);
  console.log(`Duplicates skipped: ${skippedDuplicates}`);
  console.log(`\nTotal states: ${updatedStates.length}`);
  console.log(`Total cities: ${updatedCities.length}`);

  // Show new clubs by state
  const newByState: Record<string, number> = {};
  for (const club of scrapedClubs) {
    if (!existingPlaceIds.has(club.place_id)) {
      newByState[club.stateName] = (newByState[club.stateName] || 0) + 1;
    }
  }

  if (Object.keys(newByState).length > 0) {
    console.log('\nNew clubs by state:');
    const sortedNew = Object.entries(newByState).sort((a, b) => b[1] - a[1]);
    for (const [state, count] of sortedNew.slice(0, 10)) {
      console.log(`  ${state}: ${count}`);
    }
  }

  console.log('\nFiles updated:');
  console.log(`  - ${existingClubsFile}`);
  console.log(`  - ${statesFile}`);
  console.log(`  - ${citiesFile}`);
}

mergeData().catch(console.error);
