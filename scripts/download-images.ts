import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

interface Club {
  place_id: string;
  name: string;
  slug: string;
  featured_image: string;
}

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'clubs');
const DATA_FILE = path.join(process.cwd(), 'data', 'clubs.json');
const CONCURRENT_DOWNLOADS = 5;
const DELAY_MS = 100; // Delay between batches to avoid rate limiting

async function downloadImage(url: string): Promise<Buffer | null> {
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
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`Failed to download: ${error}`);
    return null;
  }
}

async function convertToWebP(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(800, 600, {
      fit: 'cover',
      withoutEnlargement: true
    })
    .webp({ quality: 80 })
    .toBuffer();
}

async function processClub(club: Club): Promise<boolean> {
  const outputPath = path.join(IMAGES_DIR, `${club.place_id}.webp`);

  // Skip if already exists
  if (fs.existsSync(outputPath)) {
    return true;
  }

  // Skip if no image URL
  if (!club.featured_image || club.featured_image.trim() === '') {
    console.log(`⚪ No image: ${club.name}`);
    return false;
  }

  try {
    console.log(`⬇️  Downloading: ${club.name}`);
    const imageBuffer = await downloadImage(club.featured_image);

    if (!imageBuffer) {
      console.log(`❌ Failed to download: ${club.name}`);
      return false;
    }

    console.log(`🔄 Converting: ${club.name}`);
    const webpBuffer = await convertToWebP(imageBuffer);

    fs.writeFileSync(outputPath, webpBuffer);
    console.log(`✅ Saved: ${club.place_id}.webp`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${club.name}:`, error);
    return false;
  }
}

async function processBatch(clubs: Club[]): Promise<number> {
  const results = await Promise.all(clubs.map(processClub));
  return results.filter(Boolean).length;
}

async function main() {
  console.log('🏍️  Motorcycle Club Image Downloader\n');

  // Ensure output directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  // Load clubs data
  const clubsData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as Club[];
  console.log(`📊 Found ${clubsData.length} clubs\n`);

  // Filter clubs with images
  const clubsWithImages = clubsData.filter(
    (club) => club.featured_image && club.featured_image.trim() !== ''
  );
  console.log(`📷 ${clubsWithImages.length} clubs have images\n`);

  // Check already downloaded
  const existingImages = fs.readdirSync(IMAGES_DIR);
  const existingPlaceIds = new Set(
    existingImages.map((f) => f.replace('.webp', '').replace('.jpg', ''))
  );

  const clubsToDownload = clubsWithImages.filter(
    (club) => !existingPlaceIds.has(club.place_id)
  );
  console.log(`⬇️  ${clubsToDownload.length} images to download\n`);

  if (clubsToDownload.length === 0) {
    console.log('✅ All images already downloaded!');
    return;
  }

  // Process in batches
  let successCount = 0;
  let batchNum = 0;

  for (let i = 0; i < clubsToDownload.length; i += CONCURRENT_DOWNLOADS) {
    batchNum++;
    const batch = clubsToDownload.slice(i, i + CONCURRENT_DOWNLOADS);
    console.log(`\n📦 Batch ${batchNum} (${i + 1}-${Math.min(i + CONCURRENT_DOWNLOADS, clubsToDownload.length)} of ${clubsToDownload.length})`);

    const batchSuccess = await processBatch(batch);
    successCount += batchSuccess;

    // Delay between batches
    if (i + CONCURRENT_DOWNLOADS < clubsToDownload.length) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  console.log(`\n✅ Complete! Downloaded ${successCount} of ${clubsToDownload.length} images`);
  console.log(`📁 Images saved to: ${IMAGES_DIR}`);
}

main().catch(console.error);
