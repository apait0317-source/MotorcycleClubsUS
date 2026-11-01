import { clubContentScore, hasSourceBackedDescription, isChapterListing, isListableClub, isMotorcycleClub, MIN_CLUB_SCORE_FOR_INDEX } from './data';
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
  sourceBackedDescription: boolean;
  previouslyScoreEligible: boolean;
}

export interface ContentAudit {
  recordCount: number;
  listableCount: number;
  listableScoreHistogram: Record<number, number>;
  listableAtLeastFive: number;
  missingDescriptionCount: number;
  missingWebsiteAndPhoneCount: number;
  eligibleRecordCount: number;
  sourceBackedDescriptionCount: number;
  unsupportedDescriptionCount: number;
  previouslyScoreEligibleCount: number;
  demotedCount: number;
  records: { placeId: string; slug: string; score: number; listable: boolean; editorialStatus: string; sourceBackedDescription: boolean; previouslyScoreEligible: boolean }[];
  candidates: AuditCandidate[];
}

/** Read-only snapshot of the effective (already deduplicated) club cohort. */
export function auditContent(clubs: Club[]): ContentAudit {
  const listable = clubs.filter(isListableClub);
  const eligible = clubs.filter(club => isMotorcycleClub(club) && !isChapterListing(club));
  const previouslyScoreEligible = (club: Club) => isMotorcycleClub(club) && !isChapterListing(club)
    && clubContentScore(club) >= MIN_CLUB_SCORE_FOR_INDEX;
  const histogram: Record<number, number> = {};
  for (const club of listable) {
    const score = clubContentScore(club);
    histogram[score] = (histogram[score] || 0) + 1;
  }
  const candidates = eligible.filter(club => !hasSourceBackedDescription(club)).map(club => {
    const score = clubContentScore(club);
    // Ask the scorer for the marginal credit, so its description rules stay authoritative.
    const descriptionPoints = score - clubContentScore({ ...club, description: '' });
    return {
      placeId: club.place_id, expectedName: club.name, slug: club.slug, state: club.State,
      score, descriptionPoints, website: club.website,
      missingFields: [
        'description',
        ...(!club.website ? ['website'] : []), ...(!club.phone ? ['phone'] : []),
      ],
      potentialScoreAfterDescription: score - descriptionPoints + 2,
      sourceBackedDescription: false,
      previouslyScoreEligible: previouslyScoreEligible(club),
    };
  }).sort((a, b) => Number(Boolean(b.website)) - Number(Boolean(a.website))
    || Number(b.potentialScoreAfterDescription >= 5) - Number(a.potentialScoreAfterDescription >= 5)
    || a.score - b.score || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
  return {
    recordCount: clubs.length, listableCount: listable.length, listableScoreHistogram: histogram,
    listableAtLeastFive: listable.filter(club => clubContentScore(club) >= 5).length,
    missingDescriptionCount: listable.filter(club => !club.description?.trim()).length,
    missingWebsiteAndPhoneCount: listable.filter(club => !club.website && !club.phone).length,
    eligibleRecordCount: eligible.length,
    sourceBackedDescriptionCount: eligible.filter(hasSourceBackedDescription).length,
    unsupportedDescriptionCount: candidates.length,
    previouslyScoreEligibleCount: eligible.filter(previouslyScoreEligible).length,
    demotedCount: eligible.filter(club => previouslyScoreEligible(club) && !isListableClub(club)).length,
    records: clubs.map(club => ({
      placeId: club.place_id, slug: club.slug, score: clubContentScore(club), listable: isListableClub(club),
      editorialStatus: club.editorial?.listingStatus || 'unreviewed',
      sourceBackedDescription: hasSourceBackedDescription(club),
      previouslyScoreEligible: previouslyScoreEligible(club),
    })),
    candidates,
  };
}
