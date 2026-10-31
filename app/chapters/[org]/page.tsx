import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { CHAPTER_ORGS, getChapterOrg } from '@/lib/chapter-orgs';
import { getChapterListings } from '@/lib/data';
import { fitTitle } from '@/lib/seo';
import { capitalizeCity, SITE_URL } from '@/lib/utils';

// One hub per national organization. It replaces a page per chapter, because
// each chapter page repeated the same organization blurb. This page carries no
// ads: it is a list of links, not a page that stands on its own text.

export const dynamicParams = false;

export function generateStaticParams() {
  return CHAPTER_ORGS.map((org) => ({ org: org.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ org: string }> }): Promise<Metadata> {
  const { org: slug } = await params;
  const org = getChapterOrg(slug);
  if (!org) return { title: 'Not Found' };
  const count = getChapterListings(org.slug).length;
  return {
    alternates: { canonical: `/chapters/${org.slug}` },
    title: fitTitle([`${org.name} Chapters by State`, `${org.short} Chapters by State`]),
    description: `${count} ${org.short} chapters listed by state and city, from the organization's own chapter list. ${org.about[0]}`.slice(0, 155).replace(/\s+\S*$/, '...'),
    openGraph: {
      title: `${org.name} Chapters by State`,
      url: `${SITE_URL}/chapters/${org.slug}`,
    },
  };
}

export default async function ChapterOrgPage({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const org = getChapterOrg(slug);
  if (!org) notFound();

  const chapters = getChapterListings(org.slug);
  const byState = new Map<string, typeof chapters>();
  for (const chapter of chapters) {
    byState.set(chapter.stateName, [...(byState.get(chapter.stateName) ?? []), chapter]);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: `${org.short} Chapters` }]} />

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{org.name} Chapters</h1>
      <div className="space-y-4 text-lg text-gray-600 mb-6">
        {org.about.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <p className="text-gray-600 mb-8">
        {chapters.length} chapters in {byState.size} states and territories, taken from the organization&apos;s chapter list.
        {org.website && (
          <>
            {' '}
            <a href={org.website} rel="noopener noreferrer" className="text-amber-700 hover:underline">Visit the organization&apos;s site</a>.
          </>
        )}{' '}
        Something wrong? <Link href="/contact" className="text-amber-700 hover:underline">Send a correction</Link>.
      </p>

      <div className="space-y-8">
        {[...byState.entries()].map(([stateName, list]) => (
          <section key={stateName} aria-labelledby={`state-${stateName}`}>
            <h2 id={`state-${stateName}`} className="text-xl font-bold text-gray-900 mb-3">{stateName}</h2>
            <ul className="divide-y divide-gray-200 border-y border-gray-200">
              {list.map((chapter) => {
                // Chapters that only point at the organization's own site add no link of their own.
                const ownSite = chapter.website && chapter.website !== org.website;
                return (
                  <li key={chapter.slug} className="py-3 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-gray-900">
                      <span className="font-medium">{chapter.name}</span>
                      <span className="text-gray-600">, {capitalizeCity(chapter.City)}</span>
                    </span>
                    {ownSite && (
                      <a href={chapter.website} rel="noopener noreferrer" className="text-sm text-amber-700 hover:underline">
                        Chapter page
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
