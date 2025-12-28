import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

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
}

async function syncToDatabase(): Promise<void> {
  const clubsFile = path.join(__dirname, '../data/clubs.json');

  console.log('=== Sync Clubs to Database ===\n');

  if (!fs.existsSync(clubsFile)) {
    console.error(`Clubs file not found: ${clubsFile}`);
    process.exit(1);
  }

  const clubs: Club[] = JSON.parse(fs.readFileSync(clubsFile, 'utf-8'));
  console.log(`Loaded ${clubs.length} clubs from JSON\n`);

  // Get existing clubs from database
  const existingClubs = await prisma.club.findMany({
    select: {
      placeId: true,
      slug: true,
      phone: true,
      website: true,
      description: true,
      googleMapsLink: true
    }
  });

  const existingByPlaceId = new Map(existingClubs.map(c => [c.placeId, c]));
  const existingBySlugs = new Set(existingClubs.map(c => c.slug));

  console.log(`Existing clubs in database: ${existingClubs.length}\n`);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  // Process in batches
  const BATCH_SIZE = 50;

  for (let i = 0; i < clubs.length; i += BATCH_SIZE) {
    const batch = clubs.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(clubs.length / BATCH_SIZE)}`);

    for (const club of batch) {
      try {
        const existing = existingByPlaceId.get(club.place_id);

        if (existing) {
          // Check if we need to update (enrich missing fields)
          const needsUpdate =
            (!existing.phone && club.phone) ||
            (!existing.website && club.website) ||
            (!existing.description && club.description) ||
            (!existing.googleMapsLink && club.link);

          if (needsUpdate) {
            await prisma.club.update({
              where: { placeId: club.place_id },
              data: {
                phone: club.phone || existing.phone || null,
                website: club.website || existing.website || null,
                description: club.description || existing.description || null,
                googleMapsLink: club.link || existing.googleMapsLink || null
              }
            });
            updated++;
          } else {
            skipped++;
          }
        } else {
          // Check slug uniqueness
          let uniqueSlug = club.slug;
          let counter = 2;
          while (existingBySlugs.has(uniqueSlug)) {
            uniqueSlug = `${club.slug}-${counter}`;
            counter++;
          }

          // Create new club
          await prisma.club.create({
            data: {
              placeId: club.place_id,
              slug: uniqueSlug,
              name: club.name,
              description: club.description || null,
              reviewCount: club.reviews || 0,
              rating: club.rating || 0,
              website: club.website || null,
              phone: club.phone || null,
              featuredImage: club.featured_image || null,
              mainCategory: club.main_category || 'Motorcycle club',
              categories: club.categories || null,
              closedOn: club.closed_on || null,
              address: club.address,
              googleMapsLink: club.link || null,
              city: club.City,
              citySlug: club.citySlug,
              state: club.State,
              stateName: club.stateName,
              status: 'active',
              isVerified: false,
              isFeatured: false
            }
          });

          existingBySlugs.add(uniqueSlug);
          created++;
        }
      } catch (error) {
        console.error(`  Error processing ${club.name}:`, error);
        errors++;
      }
    }
  }

  console.log('\n=== Sync Complete ===\n');
  console.log(`Created: ${created}`);
  console.log(`Updated (enriched): ${updated}`);
  console.log(`Skipped (no changes): ${skipped}`);
  console.log(`Errors: ${errors}`);

  // Verify final count
  const finalCount = await prisma.club.count();
  console.log(`\nTotal clubs in database: ${finalCount}`);

  await prisma.$disconnect();
}

syncToDatabase().catch(async (error) => {
  console.error('Sync failed:', error);
  await prisma.$disconnect();
  process.exit(1);
});
