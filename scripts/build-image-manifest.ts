/**
 * Builds data/images.json: a static map of club place_id -> local image filenames.
 *
 * Image files in public/images/clubs follow the pattern produced by
 * scripts/download-club-images.ts:
 *   {name_slug}_{last 8 chars of place_id}[_{n}].webp
 *
 * The site reads this manifest at build time, so listing pages do not need a
 * database connection to show photos.
 *
 * Run: pnpm images:manifest
 */
import fs from 'fs';
import path from 'path';

interface ClubRow { place_id: string; name: string }

const ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(ROOT, 'public', 'images', 'clubs');
const CLUBS_JSON = path.join(ROOT, 'data', 'clubs.json');
const OUT = path.join(ROOT, 'data', 'images.json');

function nameSlug(clubName: string): string {
  const slug = clubName
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  return slug || 'club';
}

const clubs: ClubRow[] = JSON.parse(fs.readFileSync(CLUBS_JSON, 'utf8'));
const files = fs.readdirSync(IMAGES_DIR).filter((f) => f.endsWith('.webp'));

// Index clubs by exact "{slug}_{suffix}" key, and by suffix alone as a fallback.
const byKey = new Map<string, string>();
const bySuffix = new Map<string, string[]>();
for (const club of clubs) {
  const suffix = club.place_id.slice(-8);
  byKey.set(`${nameSlug(club.name)}_${suffix}`, club.place_id);
  const list = bySuffix.get(suffix) || [];
  list.push(club.place_id);
  bySuffix.set(suffix, list);
}

const manifest: Record<string, string[]> = {};
let matched = 0;
const orphans: string[] = [];

for (const file of files) {
  const base = file.replace(/\.webp$/, '');
  const m = base.match(/^(.*)_(\d+)$/);
  const stem = m && m[1].length > 8 ? m[1] : base; // strip trailing _n
  const order = m && m[1].length > 8 ? parseInt(m[2], 10) : 1;

  let placeId = byKey.get(stem);
  if (!placeId) {
    const suffix = stem.slice(-8);
    const candidates = bySuffix.get(suffix);
    if (candidates && candidates.length === 1) placeId = candidates[0];
  }
  if (!placeId) {
    orphans.push(file);
    continue;
  }
  matched++;
  const list = manifest[placeId] || [];
  list.push(`${String(order).padStart(3, '0')}|${file}`);
  manifest[placeId] = list;
}

// Sort by image order and strip the sort prefix.
for (const id of Object.keys(manifest)) {
  manifest[id] = manifest[id].sort().map((s) => s.split('|')[1]);
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(OUT, JSON.stringify(sorted, null, 0));

console.log(`files: ${files.length}, matched: ${matched}, orphans: ${orphans.length}`);
console.log(`clubs with images: ${Object.keys(sorted).length}`);
if (orphans.length) console.log(`first orphans: ${orphans.slice(0, 5).join(', ')}`);
