import manifest from '@/data/market-pilots.json';
import type { Club } from './types';
import { getAllClubs, getAllStates, getClubBySlug, isListableClub, clubAliases } from './data';
import { resolveClubSlug } from './club-aliases';
import { approvedDiscoveryFacts } from './enrichment';

export interface MarketDefinition {
  id: string;
  title: string;
  state: string;
  candidateSlugs: string[];
  heldSlugs: string[];
  guideSlug: string;
}

export function validateMarkets(value: unknown, records: Club[]): string[] {
  if (!Array.isArray(value)) return ['Markets must be an array'];
  const errors: string[] = [];
  const slugs = new Set(records.map(club => club.slug));
  const states = new Set(getAllStates().map(state => state.code));
  const ids = new Set<string>();
  for (const market of value) {
    if (!market || typeof market !== 'object' || Array.isArray(market)) { errors.push('Market must be an object'); continue; }
    for (const field of ['id', 'title', 'state', 'guideSlug']) if (typeof market[field] !== 'string' || !market[field].trim()) errors.push(`Market needs ${field}`);
    if (ids.has(market.id)) errors.push('Duplicate market id');
    ids.add(market.id);
    if (!states.has(market.state)) errors.push('Unknown market state');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(market.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(market.guideSlug)) errors.push('Invalid market slug');
    if (!Array.isArray(market.candidateSlugs) || !market.candidateSlugs.length) { errors.push('Market needs a cohort'); continue; }
    if (new Set(market.candidateSlugs).size !== market.candidateSlugs.length || market.candidateSlugs.some((slug: unknown) => typeof slug !== 'string' || !slugs.has(slug))) errors.push('Orphan or duplicate market candidate');
    const cohort = new Set(market.candidateSlugs.map((slug: string) => resolveClubSlug(slug, clubAliases)));
    if (!Array.isArray(market.heldSlugs) || new Set(market.heldSlugs).size !== market.heldSlugs.length || market.heldSlugs.some((slug: unknown) => typeof slug !== 'string' || !cohort.has(resolveClubSlug(slug, clubAliases)))) errors.push('Market holds must belong to its cohort');
  }
  return errors;
}

const errors = validateMarkets(manifest, getAllClubs());
if (errors.length) throw new Error(`Invalid market manifest: ${errors.join('; ')}`);
export const markets: MarketDefinition[] = manifest;

export function getMarketClubs(marketId: string): Club[] {
  const market = markets.find(entry => entry.id === marketId);
  if (!market) return [];
  const held = new Set(market.heldSlugs.map(slug => resolveClubSlug(slug, clubAliases)));
  const unique = new Map<string, Club>();
  for (const slug of market.candidateSlugs) {
    const club = getClubBySlug(slug);
    if (club && club.State === market.state && isListableClub(club) && !held.has(club.slug)) unique.set(club.slug, club);
  }
  return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getMarketGuideGate(clubs: Club[]): { eligible: boolean; organizationCount: number; cityCount: number; actionableCount: number } {
  const unique = [...new Map(clubs.filter(isListableClub).map(club => [club.slug, club])).values()];
  const organizationCount = unique.length;
  const cityCount = new Set(unique.map(club => `${club.State}/${club.City.trim().toLowerCase()}`)).size;
  const actionableCount = unique.filter(club => {
    const facts = approvedDiscoveryFacts(club);
    return facts.contactUrl && (facts.activities?.length || facts.membershipEligibility);
  }).length;
  return { eligible: organizationCount >= 5 && cityCount >= 3 && actionableCount >= 3, organizationCount, cityCount, actionableCount };
}
