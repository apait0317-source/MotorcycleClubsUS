import type { Club } from './types';

// Only the first row for a slug is routable. Approval consumers must use this
// same cohort, while retaining ambiguity checks for IDs across distinct slugs.
export function canonicalClubRecords(records: Club[]): Club[] {
  const seen = new Set<string>();
  return records.filter(club => {
    if (seen.has(club.slug)) return false;
    seen.add(club.slug);
    return true;
  });
}
