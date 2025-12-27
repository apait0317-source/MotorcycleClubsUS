import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CSVClub {
  place_id: string;
  name: string;
  featured_image: string;
  images: string; // JSON string
}

interface ImageSource {
  url: string;
  type: string;
  order: number;
}

interface ProcessingReport {
  totalClubs: number;
  processedClubs: number;
  totalImages: number;
  successfulDownloads: number;
  failedDownloads: number;
  skippedClubs: string[];
  failedImages: Array<{
    club: string;
    url: string;
    error: string;
  }>;
}

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'clubs');
const CSV_FILE = path.join(process.cwd(), 'public', 'all-task-1.csv');
const CONCURRENT_DOWNLOADS = 3;
const DELAY_MS = 200;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_RETRIES = 2;

const report: ProcessingReport = {
  totalClubs: 0,
  processedClubs: 0,
  totalImages: 0,
  successfulDownloads: 0,
  failedDownloads: 0,
  skippedClubs: [],
  failedImages: [],
};

function generateSeoFilename(clubName: string, placeId: string, imageIndex: number): string {
  let slug = clubName.toLowerCase()
    .replace(/[^a-z0-9\s_]/g, '')  // Remove special chars
    .replace(/\s+/g, '_')           // Spaces to underscores
    .replace(/_+/g, '_')            // Collapse consecutive underscores
    .replace(/^_+|_+$/g, '');       // Trim edges

  // Handle empty slug
  if (!slug) {
    slug = 'club';
  }

  const placeIdSuffix = placeId.slice(-8);
  const imageNumber = imageIndex > 0 ? `_${imageIndex + 1}` : '';

  return `${slug}_${placeIdSuffix}${imageNumber}.webp`;
}

function parseClubImages(club: CSVClub): ImageSource[] {
  const sources: ImageSource[] = [];

  // Add featured image as primary
  if (club.featured_image && club.featured_image.trim()) {
    sources.push({
      url: club.featured_image.trim(),
      type: 'featured',
      order: 0
    });
  }

  // Parse images JSON array
  if (club.images && club.images.trim()) {
    try {
      const imagesArray = JSON.parse(club.images);
      if (Array.isArray(imagesArray)) {
        imagesArray.forEach((img, idx) => {
          // Skip if it's the same as featured_image or invalid
          if (img.link && img.link.trim() && img.link !== club.featured_image) {
            sources.push({
              url: img.link.trim(),
              type: img.about || 'All',
              order: idx + 1
            });
          }
        });
      }
    } catch (error) {
      console.error(`Failed to parse images JSON for ${club.name}:`, error);
    }
  }

  return sources;
}

async function downloadWithRetry(url: string, retries = MAX_RETRIES): Promise<Buffer | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Validate size
      if (buffer.length > MAX_FILE_SIZE) {
        throw new Error('Image too large (>10MB)');
      }

      return buffer;
    } catch (error) {
      if (attempt === retries) {
        console.error(`Failed after ${retries + 1} attempts: ${error}`);
        return null;
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
  return null;
}

async function downloadAndConvert(
  url: string,
  filename: string
): Promise<{ success: boolean; width?: number; height?: number; size?: number }> {
  try {
    const buffer = await downloadWithRetry(url);
    if (!buffer) {
      return { success: false };
    }

    const webpBuffer = await sharp(buffer)
      .resize(800, 600, {
        fit: 'cover',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true });

    const outputPath = path.join(IMAGES_DIR, filename);
    fs.writeFileSync(outputPath, webpBuffer.data);

    return {
      success: true,
      width: webpBuffer.info.width,
      height: webpBuffer.info.height,
      size: webpBuffer.info.size
    };
  } catch (error) {
    console.error(`Conversion error: ${error}`);
    return { success: false };
  }
}

async function loadCSVData(): Promise<CSVClub[]> {
  return new Promise((resolve, reject) => {
    const clubs: CSVClub[] = [];

    fs.createReadStream(CSV_FILE)
      .pipe(csv())
      .on('data', (row) => {
        clubs.push(row);
      })
      .on('end', () => {
        resolve(clubs);
      })
      .on('error', reject);
  });
}

async function getClubsNeedingImages(): Promise<Set<string>> {
  const clubs = await prisma.club.findMany({
    where: {
      OR: [
        { featuredImage: null },
        { featuredImage: '' }
      ]
    },
    select: { placeId: true }
  });
  return new Set(clubs.map(c => c.placeId));
}

async function saveImageRecords(
  clubPlaceId: string,
  images: Array<{
    url: string;
    filename: string;
    type: string;
    order: number;
    width?: number;
    height?: number;
    size?: number;
  }>
) {
  const club = await prisma.club.findUnique({
    where: { placeId: clubPlaceId }
  });

  if (!club) {
    throw new Error(`Club not found: ${clubPlaceId}`);
  }

  // Create image records in transaction
  await prisma.$transaction(
    images.map((img, idx) =>
      prisma.image.create({
        data: {
          clubId: club.id,
          url: img.url,
          filename: img.filename,
          isPrimary: idx === 0,
          displayOrder: img.order,
          imageType: img.type,
          width: img.width,
          height: img.height,
          fileSize: img.size
        }
      })
    )
  );

  // Update club's featuredImage field for backward compatibility
  if (images.length > 0) {
    await prisma.club.update({
      where: { id: club.id },
      data: { featuredImage: `/images/clubs/${images[0].filename}` }
    });
  }
}

async function processClub(club: CSVClub): Promise<void> {
  console.log(`\n📋 Processing: ${club.name}`);

  const imageSources = parseClubImages(club);

  if (imageSources.length === 0) {
    console.log(`  ⚪ No images found`);
    report.skippedClubs.push(club.name);
    return;
  }

  console.log(`  Found ${imageSources.length} image(s)`);

  const successfulImages: Array<{
    url: string;
    filename: string;
    type: string;
    order: number;
    width?: number;
    height?: number;
    size?: number;
  }> = [];

  for (let i = 0; i < imageSources.length; i++) {
    const source = imageSources[i];
    const filename = generateSeoFilename(club.name, club.place_id, i);

    console.log(`  ⬇️  Downloading ${i + 1}/${imageSources.length}: ${filename}`);
    report.totalImages++;

    const result = await downloadAndConvert(source.url, filename);

    if (result.success) {
      console.log(`  ✅ Success: ${filename}`);
      report.successfulDownloads++;
      successfulImages.push({
        url: source.url,
        filename,
        type: source.type,
        order: source.order,
        width: result.width,
        height: result.height,
        size: result.size
      });
    } else {
      console.log(`  ❌ Failed: ${filename}`);
      report.failedDownloads++;
      report.failedImages.push({
        club: club.name,
        url: source.url,
        error: 'Download or conversion failed'
      });
    }
  }

  // Save to database if we got at least one image
  if (successfulImages.length > 0) {
    try {
      await saveImageRecords(club.place_id, successfulImages);
      console.log(`  💾 Saved ${successfulImages.length} image(s) to database`);
      report.processedClubs++;
    } catch (error) {
      console.error(`  ❌ Database error: ${error}`);
    }
  }
}

async function processBatch(clubs: CSVClub[]): Promise<void> {
  for (let i = 0; i < clubs.length; i += CONCURRENT_DOWNLOADS) {
    const batch = clubs.slice(i, i + CONCURRENT_DOWNLOADS);
    await Promise.all(batch.map(processClub));

    // Delay between batches
    if (i + CONCURRENT_DOWNLOADS < clubs.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }
}

async function main() {
  console.log('🏍️  Motorcycle Club Multi-Image Downloader\n');
  console.log('━'.repeat(60));

  // Ensure output directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log('✅ Created images directory');
  }

  // Load CSV data
  console.log('\n📂 Loading CSV data...');
  const csvClubs = await loadCSVData();
  console.log(`✅ Loaded ${csvClubs.length} clubs from CSV`);

  // Get clubs needing images from database
  console.log('\n🔍 Finding clubs without images...');
  const clubsNeedingImages = await getClubsNeedingImages();
  console.log(`✅ Found ${clubsNeedingImages.size} clubs without images`);

  // Filter CSV clubs to only those needing images
  const clubsToProcess = csvClubs.filter(club =>
    clubsNeedingImages.has(club.place_id)
  );

  report.totalClubs = clubsToProcess.length;

  if (clubsToProcess.length === 0) {
    console.log('\n✨ All clubs already have images!');
    await prisma.$disconnect();
    return;
  }

  console.log(`\n📥 Will process ${clubsToProcess.length} clubs`);
  console.log('━'.repeat(60));

  // Process clubs
  await processBatch(clubsToProcess);

  // Print final report
  console.log('\n' + '━'.repeat(60));
  console.log('📊 FINAL REPORT');
  console.log('━'.repeat(60));
  console.log(`Total clubs: ${report.totalClubs}`);
  console.log(`Processed clubs: ${report.processedClubs}`);
  console.log(`Skipped clubs: ${report.skippedClubs.length}`);
  console.log(`Total images: ${report.totalImages}`);
  console.log(`Successful downloads: ${report.successfulDownloads}`);
  console.log(`Failed downloads: ${report.failedDownloads}`);
  console.log(`Success rate: ${((report.successfulDownloads / report.totalImages) * 100).toFixed(1)}%`);

  if (report.failedImages.length > 0) {
    console.log(`\n❌ Failed images: ${report.failedImages.length}`);
    const failedLog = path.join(process.cwd(), 'scripts', 'failed-images.json');
    fs.writeFileSync(failedLog, JSON.stringify(report.failedImages, null, 2));
    console.log(`   Saved to: ${failedLog}`);
  }

  console.log('\n✅ Done!');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  prisma.$disconnect();
  process.exit(1);
});
