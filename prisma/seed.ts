import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ClubData {
  place_id: string;
  name: string;
  description?: string;
  reviews: number;
  rating: number;
  website?: string;
  phone?: string;
  featured_image?: string;
  main_category?: string;
  categories?: string;
  closed_on?: string;
  address: string;
  link?: string;
  City: string;
  citySlug: string;
  State: string;
  stateName: string;
  slug: string;
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Read clubs data from JSON file
  const clubsPath = path.join(__dirname, '..', 'data', 'clubs.json');
  const clubsRaw = fs.readFileSync(clubsPath, 'utf-8');
  const clubsData: ClubData[] = JSON.parse(clubsRaw);

  console.log(`📊 Found ${clubsData.length} clubs to seed`);

  // Clear existing clubs
  const deleted = await prisma.club.deleteMany();
  console.log(`🗑️  Cleared ${deleted.count} existing clubs`);

  // Track slugs to handle duplicates
  const usedSlugs = new Set<string>();
  let inserted = 0;
  let skipped = 0;

  // Insert clubs one by one to handle duplicates
  for (const club of clubsData) {
    let slug = club.slug;

    // If slug already used, add place_id suffix
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${club.place_id.slice(-8).toLowerCase()}`;
    }

    // Skip if still duplicate
    if (usedSlugs.has(slug)) {
      skipped++;
      continue;
    }

    usedSlugs.add(slug);

    try {
      await prisma.club.create({
        data: {
          placeId: club.place_id,
          slug: slug,
          name: club.name,
          description: club.description || null,
          reviewCount: club.reviews || 0,
          rating: club.rating || 0,
          website: club.website || null,
          phone: club.phone || null,
          featuredImage: club.featured_image || null,
          mainCategory: club.main_category || null,
          categories: club.categories || null,
          closedOn: club.closed_on || null,
          address: club.address || '',
          googleMapsLink: club.link || null,
          city: club.City,
          citySlug: club.citySlug,
          state: club.State.toLowerCase(),
          stateName: club.stateName,
          status: 'active',
          isVerified: false,
        },
      });
      inserted++;

      if (inserted % 100 === 0) {
        const progress = Math.round((inserted / clubsData.length) * 100);
        console.log(`⏳ Progress: ${progress}% (${inserted}/${clubsData.length})`);
      }
    } catch (error) {
      skipped++;
    }
  }

  console.log(`\n✅ Successfully seeded ${inserted} clubs!`);
  if (skipped > 0) {
    console.log(`⚠️  Skipped ${skipped} duplicate clubs`);
  }

  // Verify count
  const count = await prisma.club.count();
  console.log(`📊 Total clubs in database: ${count}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
