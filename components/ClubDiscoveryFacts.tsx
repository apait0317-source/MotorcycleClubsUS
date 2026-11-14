import { ACTIVITY_LABELS, KIND_LABELS, hasVisitorInformation, UNKNOWN_FACT, type PublicComparisonRow } from '@/lib/market-discovery';
import type { MarketId } from '@/lib/analytics';
import TrackedClubLink from './TrackedClubLink';

export default function ClubDiscoveryFacts({ row, marketId }: { row: PublicComparisonRow; marketId?: MarketId }) {
  if (!Object.keys(row.facts).length) return null;
  const items = [
    ['Club type', row.facts.kind ? KIND_LABELS[row.facts.kind] : UNKNOWN_FACT, 'kind'],
    ['Riding activities', row.facts.activities?.map(activity => ACTIVITY_LABELS[activity]).join(', ') || UNKNOWN_FACT, 'activities'],
    ['Membership eligibility', row.facts.membershipEligibility ?? UNKNOWN_FACT, 'membershipEligibility'],
    ['Bike requirements', row.facts.bikeRequirements ?? UNKNOWN_FACT, 'bikeRequirements'],
    ['Guest participation', row.facts.guestParticipation ?? UNKNOWN_FACT, 'guestParticipation'],
  ] as const;
  return <section data-visitor-details={hasVisitorInformation(row.facts) ? 'published' : undefined} aria-label="Published riding and membership information" className="my-8 rounded-xl border border-gray-200 p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Riding and membership</h2>
    <dl className="space-y-5">{items.map(([label, value, field]) => <div key={field}><dt className="text-sm font-semibold text-gray-900">{label}</dt><dd className="mt-1 text-gray-700">{value}
      {row.sources[field]?.map(source => <span key={`${source.url}/${source.checkedAt}`} className="block text-xs text-gray-500 mt-1"><a href={source.url} target="_blank" rel="noopener noreferrer nofollow external" className="text-amber-700 hover:underline">Published source</a> · Checked <time dateTime={source.checkedAt}>{source.checkedAt}</time></span>)}
    </dd></div>)}</dl>
    {row.facts.contactUrl && <TrackedClubLink href={row.facts.contactUrl} interaction={{ name: 'club_official_contact', clubId: row.id, surface: 'profile', marketId }} target="_blank" rel="noopener noreferrer" className="inline-block mt-5 rounded-lg bg-amber-600 px-4 py-3 font-semibold text-white hover:bg-amber-700">Official contact / joining information ↗</TrackedClubLink>}
  </section>;
}
