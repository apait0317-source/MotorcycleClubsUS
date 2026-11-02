import Link from 'next/link';
import Breadcrumbs from './Breadcrumbs';
import { getAllStates, getIndexableStates } from '@/lib/data';
import { getVerifiedChapterProfile, type VerifiedChapterOrg } from '@/lib/verified-chapters';
import { capitalizeCity } from '@/lib/utils';

export default function VerifiedChapterHub({ org }: { org: VerifiedChapterOrg }) {
  const states = getAllStates();
  const indexableStates = new Set(getIndexableStates().map((state) => state.code));
  const groups = states.map((state) => ({
    ...state,
    chapters: org.chapters.filter((chapter) => chapter.state === state.code)
      .sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name)),
  })).filter((state) => state.chapters.length > 0);
  const sources = new Map(org.sources.map((source) => [source.url, source]));
  const cityStates = new Set(groups.map((group) => group.code));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Chapter directories', href: '/chapters' }, { label: `${org.short} Chapters` }]} />
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{org.name} Chapters</h1>
      <div className="space-y-4 text-lg text-gray-600 mb-6">
        {org.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
      <p className="text-gray-600 mb-6">
        {org.chapters.length > 0
          ? `${org.chapters.length} source-listed US chapter locations in ${groups.length} states.`
          : 'City-level chapter coverage pending.'}
        {org.website && <> <a href={org.website} rel="noopener noreferrer" className="text-amber-700 hover:underline">Visit the organization&apos;s site</a>.</>}
        {' '}<Link href="/contact" className="text-amber-700 hover:underline">Send a correction</Link>.
      </p>

      <section aria-label="Coverage limitations" className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Coverage limitations</h2>
        {org.coverageNotes.map((note) => <p key={note} className="text-gray-600 mb-2">{note}</p>)}
        <p className="text-sm text-gray-600">A city listing does not establish a public clubhouse address or permission to visit. Confirm details through the chapter&apos;s public contact page.</p>
      </section>

      {groups.length > 0 && (
        <nav aria-label={`${org.short} chapters by state`} className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Chapters by state</h2>
          <ul className="grid sm:grid-cols-2 gap-2">
            {groups.map((group) => (
              <li key={group.code}><a href={`#state-${group.code}`} className="text-amber-700 hover:underline">{group.name}</a> ({group.chapters.length})</li>
            ))}
          </ul>
        </nav>
      )}

      <div className="space-y-8 mb-10">
        {groups.map((group) => (
          <section key={group.code} aria-labelledby={`state-${group.code}`}>
            <h2 id={`state-${group.code}`} className="text-xl font-bold text-gray-900 mb-3">{group.name}</h2>
            {indexableStates.has(group.code) && <Link href={`/state/${group.code}`} className="inline-block text-sm text-amber-700 hover:underline mb-3">All {group.name} clubs</Link>}
            <ul className="divide-y divide-gray-200 border-y border-gray-200">
              {group.chapters.map((chapter) => {
                const profile = getVerifiedChapterProfile(chapter);
                const source = sources.get(chapter.sourceUrl)!;
                return (
                  <li key={chapter.id} className="py-4">
                    <p className="text-gray-900"><span className="font-semibold">{chapter.name}</span>, {capitalizeCity(chapter.city)}</p>
                    <p className="text-sm text-gray-600 mt-1">{chapter.address ? `Public address: ${chapter.address}` : 'City only; no public street address reviewed.'}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-2">
                      <a href={source.url} rel="noopener noreferrer" className="text-amber-700 hover:underline">Chapter source</a>
                      <span className="text-gray-500">Checked <time dateTime={source.checkedAt}>{source.checkedAt}</time></span>
                      {chapter.website && chapter.website !== org.website && chapter.website !== chapter.sourceUrl && <a href={chapter.website} rel="noopener noreferrer" className="text-amber-700 hover:underline">Chapter page</a>}
                      {chapter.mapsUrl && <a href={chapter.mapsUrl} rel="noopener noreferrer" className="text-amber-700 hover:underline">View source map</a>}
                      {profile && <Link href={`/clubs/${profile.slug}`} className="text-amber-700 hover:underline">Detailed club profile</Link>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {org.stateCoverage && org.stateCoverage.length > 0 && (
        <section aria-label="States listed by the organization" className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-3">States listed by the organization</h2>
          <p className="text-gray-600 mb-4">These sources name a state but establish no city locations for these entries. State listings are separate from the chapter locations above.</p>
          <ul className="space-y-3 text-sm">
            {org.stateCoverage.map((entry) => {
              const state = states.find((item) => item.code === entry.state)!;
              const source = sources.get(entry.sourceUrl)!;
              return (
                <li key={entry.state} id={cityStates.has(entry.state) ? undefined : `state-${entry.state}`}>
                  <span className="font-semibold text-gray-900">{state.name}</span>
                  {' '}<a href={source.url} rel="noopener noreferrer" className="text-amber-700 hover:underline">State source</a>
                  <span className="text-gray-500">; checked <time dateTime={source.checkedAt}>{source.checkedAt}</time></span>
                  {indexableStates.has(entry.state) && <> · <Link href={`/state/${entry.state}`} className="text-amber-700 hover:underline">All {state.name} clubs</Link></>}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-label="Sources and review dates" className="border-t border-gray-200 pt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Sources and review dates</h2>
        <p className="text-gray-600 mb-4">These public sources support the organization context and chapter locations above. Review dates describe when the sources were checked.</p>
        <ul className="space-y-3 text-sm">
          {org.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} rel="noopener noreferrer" className="text-amber-700 hover:underline break-all">{source.url}</a>
              <span className="block text-gray-600">Checked <time dateTime={source.checkedAt}>{source.checkedAt}</time></span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
