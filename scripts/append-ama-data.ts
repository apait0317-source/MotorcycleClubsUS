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

async function appendAMAData(): Promise<void> {
  const clubsFile = path.join(__dirname, '../data/clubs.json');
  const amaFile = path.join(__dirname, '../data/scraped-ama-transformed.json');

  console.log('=== Append AMA Data ===\n');

  // Load existing clubs
  const existingClubs: Club[] = JSON.parse(fs.readFileSync(clubsFile, 'utf-8'));
  console.log(`Existing clubs: ${existingClubs.length}`);

  // Load AMA clubs
  const amaClubs: Club[] = JSON.parse(fs.readFileSync(amaFile, 'utf-8'));
  console.log(`AMA clubs to add: ${amaClubs.length}`);

  // Create lookup for existing clubs (name + city + state)
  const existingKeys = new Set<string>();
  for (const club of existingClubs) {
    const key = `${club.name.toLowerCase()}-${club.City.toLowerCase()}-${club.State.toLowerCase()}`;
    existingKeys.add(key);
  }

  // Filter out duplicates
  const newClubs: Club[] = [];
  const duplicates: string[] = [];

  for (const club of amaClubs) {
    const key = `${club.name.toLowerCase()}-${club.City.toLowerCase()}-${club.State.toLowerCase()}`;
    if (existingKeys.has(key)) {
      duplicates.push(club.name);
    } else {
      newClubs.push(club);
      existingKeys.add(key); // Prevent duplicates within AMA data too
    }
  }

  console.log(`\nDuplicates found: ${duplicates.length}`);
  console.log(`New clubs to add: ${newClubs.length}`);

  if (newClubs.length === 0) {
    console.log('\nNo new clubs to add.');
    return;
  }

  // Append new clubs
  const allClubs = [...existingClubs, ...newClubs];

  // Sort by state then city then name
  allClubs.sort((a, b) => {
    if (a.State !== b.State) return a.State.localeCompare(b.State);
    if (a.City !== b.City) return a.City.localeCompare(b.City);
    return a.name.localeCompare(b.name);
  });

  // Save updated clubs
  fs.writeFileSync(clubsFile, JSON.stringify(allClubs, null, 2));

  console.log(`\n=== Complete ===`);
  console.log(`Total clubs now: ${allClubs.length}`);
  console.log(`Added: ${newClubs.length} new AMA clubs`);

  // Show sample of new clubs
  console.log('\nSample of added clubs:');
  for (const club of newClubs.slice(0, 5)) {
    console.log(`  - ${club.name} (${club.City}, ${club.State})`);
  }
  if (newClubs.length > 5) {
    console.log(`  ... and ${newClubs.length - 5} more`);
  }
}

appendAMAData().catch(console.error);
