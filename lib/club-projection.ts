import type { Club } from './types';
import type { PublicClub } from './public-clubs';
import { isListableClub } from './data';
import { chapterOrgForId } from './chapter-orgs';

// Called only by server pages. Client search receives this allowlist, never the review object.
export function toPublicClub(club: Club): PublicClub {
  const promoted = isListableClub(club);
  const chapter = chapterOrgForId(club.place_id);
  return {
    place_id: club.place_id,
    name: club.name,
    reviews: club.reviews,
    rating: club.rating,
    featured_image: club.featured_image,
    main_category: club.main_category,
    address: club.address,
    City: club.City,
    State: club.State,
    stateName: club.stateName,
    slug: club.slug,
    directoryHref: promoted ? `/clubs/${club.slug}`
      : chapter ? `/chapters/${chapter.slug}#${club.slug}` : `/state/${club.State}#${club.slug}`,
    summary: promoted ? club.description : undefined,
    images: club.images?.map(({ filename, isPrimary, displayOrder }) => ({ filename, isPrimary, displayOrder })),
  };
}
