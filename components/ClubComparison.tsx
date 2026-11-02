'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { ACTIVITY_LABELS, KIND_LABELS, UNKNOWN_FACT, comparisonCoverage, filterComparisonRows, type PublicComparisonRow } from '@/lib/market-discovery';
import type { ClubKind, RidingActivity } from '@/lib/types';

export default function ClubComparison({ rows, marketId, heading }: { rows: PublicComparisonRow[]; marketId: string; heading: string }) {
  const id = useId();
  const [filters, setFilters] = useState<{ kind?: ClubKind; activity?: RidingActivity }>({});
  const shown = filterComparisonRows(rows, filters);
  const coverage = comparisonCoverage(rows);
  const kinds = Object.entries(KIND_LABELS).filter(([kind]) => rows.some(row => row.facts.kind === kind));
  const activities = Object.entries(ACTIVITY_LABELS).filter(([activity]) => rows.some(row => row.facts.activities?.includes(activity as RidingActivity)));

  return (
    <section aria-labelledby={`${id}-heading`} className="my-10 rounded-2xl border border-gray-200 bg-white overflow-hidden" data-market={marketId}>
      <div className="px-5 py-6 sm:px-6 bg-gray-50 border-b border-gray-200">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-2">Compare the riding and the commitment</p>
        <h2 id={`${id}-heading`} className="text-2xl font-bold text-gray-900">{heading}</h2>
        <p className="text-sm text-gray-600 mt-2 max-w-3xl">Selected clubs from a source-reviewed Bay Area pilot. This is a partial comparison. Read each club&apos;s published rules and confirm current arrangements before joining or visiting.</p>
        <Link href="/state/ca#directory" className="inline-block text-sm font-medium text-amber-700 hover:underline mt-2">Browse wider California coverage →</Link>
        <div className="flex flex-wrap items-end gap-4 mt-5">
          <div>
            <label htmlFor={`${id}-kind`} className="block text-sm font-medium text-gray-700 mb-1">Club type</label>
            <select id={`${id}-kind`} value={filters.kind ?? ''} onChange={event => setFilters({ ...filters, kind: event.target.value as ClubKind || undefined })} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-amber-600">
              <option value="">All published types</option>
              {kinds.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-activity`} className="block text-sm font-medium text-gray-700 mb-1">Riding activity</label>
            <select id={`${id}-activity`} value={filters.activity ?? ''} onChange={event => setFilters({ ...filters, activity: event.target.value as RidingActivity || undefined })} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-amber-600">
              <option value="">All published activities</option>
              {activities.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <button type="button" onClick={() => setFilters({})} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus-visible:outline-amber-600">Reset filters</button>
        </div>
        <p aria-live="polite" className="mt-4 text-sm font-semibold text-gray-800">{shown.length} of {rows.length} reviewed clubs shown</p>
        <p className="mt-1 text-xs text-gray-600">{coverage.missingKind} profiles have no published club type; {coverage.missingActivities} have no published riding activities. Unknown facts do not match a selected filter.</p>
      </div>
      {shown.length ? (
        <div role="region" aria-label={`${heading} comparison table`} tabIndex={0} className="overflow-x-auto focus-visible:outline-amber-600">
          <table className="w-full min-w-[1050px] text-sm text-left">
            <caption className="sr-only">Published club activities, membership and visiting information. Scroll horizontally to compare all fields.</caption>
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
              <tr>{['Club', 'Riding', 'Membership and bike requirements', 'Guests and next steps'].map(label => <th key={label} scope="col" className="px-5 py-4 font-semibold">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {shown.map(row => {
                const sources = [...new Map(Object.values(row.sources).flat().map(source => [source.url, source])).values()];
                return (
                  <tr key={row.id} className="align-top">
                    <th scope="row" className="px-5 py-5 w-1/5 font-normal">
                      <a href={row.profileHref} className="font-semibold text-gray-900 hover:text-amber-700 hover:underline">{row.name}</a>
                      <p className="text-gray-500 mt-1">{row.city}, {row.state.toUpperCase()}</p>
                      <p className="text-xs text-gray-600 mt-2">{row.facts.kind ? KIND_LABELS[row.facts.kind] : UNKNOWN_FACT}</p>
                    </th>
                    <td className="px-5 py-5 w-1/5 text-gray-700">{row.facts.activities?.length ? <ul className="space-y-1">{row.facts.activities.map(activity => <li key={activity}>{ACTIVITY_LABELS[activity]}</li>)}</ul> : UNKNOWN_FACT}</td>
                    <td className="px-5 py-5 w-[30%] text-gray-700"><p>{row.facts.membershipEligibility ?? UNKNOWN_FACT}</p><p className="mt-3"><span className="font-medium text-gray-900">Bike requirements: </span>{row.facts.bikeRequirements ?? UNKNOWN_FACT}</p></td>
                    <td className="px-5 py-5 w-[30%] text-gray-700">
                      <p>{row.facts.guestParticipation ?? UNKNOWN_FACT}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                        <a href={row.profileHref} className="font-medium text-amber-700 hover:underline">Full profile</a>
                        {row.facts.contactUrl && <a href={row.facts.contactUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-amber-700 hover:underline">Official contact / joining information ↗</a>}
                      </div>
                      {sources.length > 0 && <details className="mt-4 text-xs text-gray-500"><summary className="cursor-pointer hover:text-gray-900">Sources and review dates</summary><ul className="mt-2 space-y-2">{sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer nofollow external" className="break-all hover:underline">{source.url}</a><br />Checked <time dateTime={source.checkedAt}>{source.checkedAt}</time></li>)}</ul></details>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : <div className="p-6 text-gray-600"><p className="font-semibold text-gray-900">No reviewed clubs match both filters.</p><p className="mt-1">Reset the filters or try a different activity. A missing published fact does not mean a club offers or prohibits that activity.</p></div>}
    </section>
  );
}
