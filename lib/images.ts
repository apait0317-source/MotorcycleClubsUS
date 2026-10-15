import type { Club, ClubImageRef } from './types';
import manifestData from '@/data/images.json';

// place_id -> ordered list of filenames under /public/images/clubs.
// Built by scripts/build-image-manifest.ts.
const manifest = manifestData as Record<string, string[]>;

export function getClubImages(placeId: string): ClubImageRef[] {
  const files = manifest[placeId];
  if (!files || files.length === 0) return [];
  return files.map((filename, index) => ({
    filename,
    isPrimary: index === 0,
    displayOrder: index,
  }));
}

export function clubHasImages(placeId: string): boolean {
  return Boolean(manifest[placeId]?.length);
}

export function attachImages<T extends Club>(clubs: T[]): T[] {
  return clubs.map((club) => ({ ...club, images: getClubImages(club.place_id) }));
}

// Clubs with a local photo first, then by rating and review count.
export function sortForDisplay<T extends Club>(clubs: T[]): T[] {
  return [...clubs].sort((a, b) => {
    const imgDiff = Number(clubHasImages(b.place_id)) - Number(clubHasImages(a.place_id));
    if (imgDiff !== 0) return imgDiff;
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.reviews - a.reviews;
  });
}

export function countClubsWithImages(): number {
  return Object.keys(manifest).length;
}

export function getPrimaryImagePath(club: Club): string | undefined {
  const local = manifest[club.place_id]?.[0];
  if (local) return `/images/clubs/${local}`;
  return club.featured_image || undefined;
}
