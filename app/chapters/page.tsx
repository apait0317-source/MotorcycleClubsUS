import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { CHAPTER_ORGS } from '@/lib/chapter-orgs';
import { getChapterListings } from '@/lib/data';
import { getVerifiedChapterOrgs } from '@/lib/verified-chapters';
import { fitTitle } from '@/lib/seo';

export const metadata: Metadata = {
  title: fitTitle(['Motorcycle Club Chapter Directories']),
  description: 'Browse motorcycle club chapter directories by organization and state, with public contact links, sources and coverage notes.',
  alternates: { canonical: '/chapters' },
};

export default function ChaptersPage() {
  const reviewed = getVerifiedChapterOrgs();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Chapter directories' }]} />
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Motorcycle Club Chapter Directories</h1>
      <p className="text-lg text-gray-600 mb-8">Browse chapters by organization, then by state. Some chapters publish only a city or region rather than a public street address. Each directory explains its coverage and links to public contact information where available.</p>
      {reviewed.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sourced US chapter directories</h2>
          <p className="text-gray-600 mb-4">These directories retain public evidence and review dates. They cover supported city locations; gaps and regional entries are explained on each organization&apos;s page.</p>
          <ul className="divide-y divide-gray-200">
            {reviewed.map((org) => (
              <li key={org.slug} className="py-4">
                <Link href={`/chapters/${org.slug}`} className="font-semibold text-amber-700 hover:underline">{org.name}</Link>
                <p className="text-sm text-gray-600 mt-1">{org.chapters.length > 0 ? `${org.chapters.length} source-listed chapter locations` : 'City-level chapter coverage pending'}{org.stateCoverage?.length ? `; ${org.stateCoverage.length} states named by public sources` : ''}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">More organization directories</h2>
        <p className="text-gray-600 mb-4">These existing directories group chapter listings by state and city. Use the chapter or organization&apos;s own page to confirm details.</p>
        <ul className="divide-y divide-gray-200">
          {CHAPTER_ORGS.map((org) => (
            <li key={org.slug} className="py-4">
              <Link href={`/chapters/${org.slug}`} className="font-semibold text-amber-700 hover:underline">{org.name}</Link>
              <p className="text-sm text-gray-600 mt-1">{getChapterListings(org.slug).length} chapter listings</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
