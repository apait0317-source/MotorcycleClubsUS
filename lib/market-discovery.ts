import type { ClubDiscovery, ClubKind, RidingActivity } from './types';

export interface PublicComparisonRow {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  profileHref: string;
  facts: ClubDiscovery;
  sources: Partial<Record<keyof ClubDiscovery, { url: string; checkedAt: string }[]>>;
}

export const KIND_LABELS: Record<ClubKind, string> = {
  'traditional-mc': 'Motorcycle club (MC)', 'riding-club': 'Riding club', 'brand-owners': 'Brand / owners group',
  'offroad-racing': 'Off-road / racing club', advocacy: 'Rider advocacy', other: 'Other published kind',
};
export const ACTIVITY_LABELS: Record<RidingActivity, string> = {
  'road-social': 'Road / social riding', touring: 'Touring', 'adventure-dual-sport': 'Adventure / dual-sport',
  'trail-offroad': 'Trail / off-road', racing: 'Racing',
};
export const UNKNOWN_FACT = 'Not published in the sources reviewed';

export function filterComparisonRows(rows: PublicComparisonRow[], filters: { kind?: ClubKind; activity?: RidingActivity }): PublicComparisonRow[] {
  return rows.filter(row => (!filters.kind || row.facts.kind === filters.kind)
    && (!filters.activity || row.facts.activities?.includes(filters.activity)));
}

export function comparisonCoverage(rows: PublicComparisonRow[]): { missingKind: number; missingActivities: number } {
  return { missingKind: rows.filter(row => !row.facts.kind).length,
    missingActivities: rows.filter(row => !row.facts.activities?.length).length };
}
