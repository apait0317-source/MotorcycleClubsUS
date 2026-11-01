import { clubContentScore, isListableClub } from './data';
import type { Club } from './types';

export interface AuditCandidate {
  placeId: string;
  expectedName: string;
  slug: string;
  state: string;
  score: number;
  descriptionPoints: number;
  website: string;
  missingFields: string[];
  potentialScoreAfterDescription: number;
}

export interface ContentAudit {
  recordCount: number;
  listableCount: number;
  listableScoreHistogram: Record<number, number>;
  listableAtLeastFive: number;
  missingDescriptionCount: number;
  missingWebsiteAndPhoneCount: number;
  records: { placeId: string; slug: string; score: number; listable: boolean; editorialStatus: string }[];
  candidates: AuditCandidate[];
}

/** Read-only snapshot of the effective (already deduplicated) club cohort. */
export function auditContent(clubs: Club[]): ContentAudit {
  const listable = clubs.filter(isListableClub);
  const histogram: Record<number, number> = {};
  for (const club of listable) {
    const score = clubContentScore(club);
    histogram[score] = (histogram[score] || 0) + 1;
  }
  const candidates = listable.filter(club => clubContentScore(club) < 5).map(club => {
    const score = clubContentScore(club);
    // Ask the scorer for the marginal credit, so its description rules stay authoritative.
    const descriptionPoints = score - clubContentScore({ ...club, description: '' });
    return {
      placeId: club.place_id, expectedName: club.name, slug: club.slug, state: club.State,
      score, descriptionPoints, website: club.website,
      missingFields: [
        ...(descriptionPoints < 2 ? ['description'] : []),
        ...(!club.website ? ['website'] : []), ...(!club.phone ? ['phone'] : []),
      ],
      potentialScoreAfterDescription: score - descriptionPoints + 2,
    };
  }).sort((a, b) => Number(Boolean(b.website)) - Number(Boolean(a.website))
    || Number(b.potentialScoreAfterDescription >= 5) - Number(a.potentialScoreAfterDescription >= 5)
    || a.score - b.score || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
  return {
    recordCount: clubs.length, listableCount: listable.length, listableScoreHistogram: histogram,
    listableAtLeastFive: listable.filter(club => clubContentScore(club) >= 5).length,
    missingDescriptionCount: listable.filter(club => !club.description?.trim()).length,
    missingWebsiteAndPhoneCount: listable.filter(club => !club.website && !club.phone).length,
    records: clubs.map(club => ({
      placeId: club.place_id, slug: club.slug, score: clubContentScore(club), listable: isListableClub(club),
      editorialStatus: club.editorial?.listingStatus || 'unreviewed',
    })),
    candidates,
  };
}
