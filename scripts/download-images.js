const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const sharp = require('sharp');

const clubsPath = path.join(__dirname, '..', 'data', 'clubs.json');
const outputDir = path.join(__dirname, '..', 'public', 'images', 'clubs');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Load clubs data
const clubs = JSON.parse(fs.readFileSync(clubsPath, 'utf-8'));

// Filter clubs with images
const clubsWithImages = clubs.filter(club =>
  club.featured_image &&
  club.featured_image.startsWith('http') &&
  !club.featured_image.startsWith('/images/')
);

console.log(`Found ${clubsWithImages.length} clubs with external images to download`);

// Download function with retry
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const chunks = [];

    const request = protocol.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        downloadImage(response.headers.location)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Convert to WebP and save
async function processAndSaveImage(buffer, filepath) {
  try {
    await sharp(buffer)
      .resize(800, 600, { fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filepath);
    return true;
  } catch (err) {
    console.error(`Sharp error: ${err.message}`);
    return false;
  }
}

// Process images in batches
async function downloadAllImages() {
  const batchSize = 5;
  let downloaded = 0;
  let failed = 0;
  const failedClubs = [];

  for (let i = 0; i < clubsWithImages.length; i += batchSize) {
    const batch = clubsWithImages.slice(i, i + batchSize);

    const promises = batch.map(async (club) => {
      // Create proper filename from place_id
      const filename = `${club.place_id}.webp`;
      const filepath = path.join(outputDir, filename);

      // Skip if already downloaded
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        if (stats.size > 1000) {
          downloaded++;
          return { success: true, skipped: true, club };
        }
      }

      try {
        const buffer = await downloadImage(club.featured_image);
        const success = await processAndSaveImage(buffer, filepath);

        if (success) {
          downloaded++;
          return { success: true, club };
        } else {
          failed++;
          failedClubs.push({ slug: club.slug, name: club.name, error: 'Sharp processing failed' });
          return { success: false };
        }
      } catch (err) {
        failed++;
        failedClubs.push({ slug: club.slug, name: club.name, error: err.message });
        return { success: false, error: err.message };
      }
    });

    await Promise.all(promises);

    const progress = Math.round((i + batch.length) / clubsWithImages.length * 100);
    console.log(`Progress: ${progress}% (${downloaded} downloaded, ${failed} failed)`);
  }

  console.log('\n=== Download Complete ===');
  console.log(`Successfully downloaded: ${downloaded}`);
  console.log(`Failed: ${failed}`);

  if (failedClubs.length > 0) {
    const failedPath = path.join(__dirname, 'failed-images.json');
    fs.writeFileSync(failedPath, JSON.stringify(failedClubs, null, 2));
    console.log(`Failed clubs saved to: ${failedPath}`);
  }

  // Update clubs.json with local image paths
  console.log('\nUpdating clubs.json with local image paths...');

  const updatedClubs = clubs.map(club => {
    // Check for the webp file with the place_id name
    const filename = `${club.place_id}.webp`;
    const localPath = path.join(outputDir, filename);

    if (fs.existsSync(localPath)) {
      const stats = fs.statSync(localPath);
      if (stats.size > 1000) {
        return {
          ...club,
          featured_image_original: club.featured_image_original || club.featured_image,
          featured_image: `/images/clubs/${filename}`
        };
      }
    }
    return club;
  });

  fs.writeFileSync(clubsPath, JSON.stringify(updatedClubs, null, 2));
  console.log('Updated clubs.json with local image paths');

  // Count how many have local images now
  const withLocalImages = updatedClubs.filter(c => c.featured_image?.startsWith('/images/')).length;
  console.log(`Clubs with local images: ${withLocalImages}/${updatedClubs.length}`);
}

downloadAllImages().catch(console.error);
