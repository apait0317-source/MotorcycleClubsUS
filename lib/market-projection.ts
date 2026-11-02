import type { Club, ClubDiscovery } from './types';
import type { PublicComparisonRow } from './market-discovery';
import { approvedDiscoveryFacts } from './enrichment';
import { getClubBySlug, isListableClub } from './data';
import { markets } from './markets';

// Only this selected provenance crosses into client comparison props.
export function toPublicComparisonRow(club: Club): PublicComparisonRow | undefined {
  if (!isListableClub(club) || markets.some(market => market.heldSlugs.some(slug => getClubBySlug(slug)?.slug === club.slug))) return undefined;
  const facts = approvedDiscoveryFacts(club);
  const sources: PublicComparisonRow['sources'] = {};
  for (const key of Object.keys(facts) as (keyof ClubDiscovery)[]) {
    sources[key] = [...new Map(club.editorial!.evidence.filter(source => source.fields.includes(`discovery.${key}`))
      .map(source => [`${source.url}|${source.checkedAt}`, { url: source.url, checkedAt: source.checkedAt }])).values()];
  }
  return { id: club.place_id, slug: club.slug, name: club.name, city: club.City, state: club.State,
    profileHref: `/clubs/${club.slug}`, facts, sources };
}
