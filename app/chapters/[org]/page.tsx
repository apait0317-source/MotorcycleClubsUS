import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { CHAPTER_ORGS, getChapterOrg } from '@/lib/chapter-orgs';
import { getChapterListings, getIndexableStates } from '@/lib/data';
import { fitTitle } from '@/lib/seo';
import { capitalizeCity, SITE_URL } from '@/lib/utils';
import type { Club } from '@/lib/types';

// One hub per national organization. It replaces a page per chapter, because
// each chapter page repeated the same organization blurb. This page carries no
// ads: it is a list of links, not a page that stands on its own text. It prints
// the chapter name, city, and link only, so no person is named on it.

export const dynamicParams = false;

export function generateStaticParams() {
  return CHAPTER_ORGS.map((org) => ({ org: org.slug }));
}

interface StateGroup {
  code: string;
  name: string;
  chapters: Club[];
}

function groupByState(chapters: Club[]): StateGroup[] {
  const groups = new Map<string, StateGroup>();
  for (const chapter of chapters) {
    const group = groups.get(chapter.State) ?? { code: chapter.State, name: chapter.stateName, chapters: [] };
    group.chapters.push(chapter);
    groups.set(chapter.State, group);
  }
  return [...groups.values()];
}

/** Says where a chapter link goes, so a Facebook group is not labelled "website". */
function linkLabel(url: string): string {
  try {
    return /(^|\.)facebook\.com$/i.test(new URL(url).hostname) ? 'Facebook page' : 'Chapter website';
  } catch {
    return 'Chapter website';
  }
}

export async function generateMetadata({ params }: { params: Promise<{ org: string }> }): Promise<Metadata> {
  const { org: slug } = await params;
  const org = getChapterOrg(slug);
  if (!org) return { title: 'Not Found' };
  const chapters = getChapterListings(org.slug);
  const stateCount = groupByState(chapters).length;
  const hasOwnLinks = chapters.some((chapter) => chapter.website && chapter.website !== org.website);
  return {
    alternates: { canonical: `/chapters/${org.slug}` },
    ...(org.index ? {} : { robots: { index: false, follow: true } }),
    title: fitTitle([`${org.name} Chapters by State`, `${org.short} Chapters by State`]),
    description: `${chapters.length} ${org.short} chapters in ${stateCount} states, listed by state and city${hasOwnLinks ? ", with a link to each chapter's own page where it has one" : ''}.`,
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
  const groups = groupByState(chapters);
  const indexableStates = new Set(getIndexableStates().map((state) => state.code));

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
        {chapters.length} chapters in {groups.length} states, compiled from public sources.
        {org.website && (
          <>
            {' '}
            <a href={org.website} rel="noopener noreferrer" className="text-amber-700 hover:underline">Visit the organization&apos;s site</a>.
          </>
        )}{' '}
        Something wrong? <Link href="/contact" className="text-amber-700 hover:underline">Send a correction</Link>.
      </p>

      <nav aria-label={`${org.short} chapters by state`} className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Chapters by state</h2>
        <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-gray-700">
          {groups.map((group) => (
            <li key={group.code}>
              <a href={`#state-${group.code}`} className="text-amber-700 hover:underline">{group.name}</a>
              {' '}({group.chapters.length}):{' '}
              <span className="text-gray-600">
                {[...new Set(group.chapters.map((chapter) => capitalizeCity(chapter.City)))].join(', ')}
              </span>
              {indexableStates.has(group.code) && (
                <>
                  {' '}
                  <Link href={`/state/${group.code}`} className="text-sm text-gray-500 hover:underline">All {group.name} clubs</Link>
                </>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group.code} aria-labelledby={`state-${group.code}`}>
            <h2 id={`state-${group.code}`} className="text-xl font-bold text-gray-900 mb-3">{group.name}</h2>
            <ul className="divide-y divide-gray-200 border-y border-gray-200">
              {group.chapters.map((chapter) => {
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
                        {linkLabel(chapter.website)}
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
