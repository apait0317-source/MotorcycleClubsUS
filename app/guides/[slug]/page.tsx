import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import SchemaMarkup from '@/components/SchemaMarkup';
import AdSlot from '@/components/AdSlot';
import AdSenseLoader from '@/components/AdSenseLoader';
import AffiliateSection from '@/components/AffiliateSection';
import { getGuide, guides, guideWordCount } from '@/lib/guides';
import { getAllStates } from '@/lib/data';
import { SITE_NAME, SITE_URL } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: 'Guide Not Found' };
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/guides/${guide.slug}`,
      type: 'article',
      publishedTime: guide.updated,
      modifiedTime: guide.updated,
    },
  };
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const others = guides.filter((g) => g.slug !== guide.slug);
  const popularStates = [...getAllStates()].sort((a, b) => b.clubCount - a.clubCount).slice(0, 8);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    datePublished: guide.updated,
    dateModified: guide.updated,
    wordCount: guideWordCount(guide),
    mainEntityOfPage: `${SITE_URL}/guides/${guide.slug}`,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` } },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdSenseLoader />
      <Breadcrumbs items={[{ label: 'Guides', href: '/guides' }, { label: guide.shortTitle }]} />
      <SchemaMarkup
        type="breadcrumb"
        items={[
          { name: 'Home', url: '/' },
          { name: 'Guides', url: '/guides' },
          { name: guide.shortTitle, url: `/guides/${guide.slug}` },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <article className="lg:col-span-2">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{guide.title}</h1>
            <p className="text-sm text-gray-500">
              Updated {new Date(guide.updated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · {guide.readingMinutes} min read
            </p>
          </header>

          {guide.sections.map((section, i) => (
            <section key={i} className="mb-8">
              {section.heading && <h2 className="text-2xl font-bold text-gray-900 mb-3">{section.heading}</h2>}
              {section.paragraphs?.map((p, j) => (
                <p key={j} className="text-gray-700 text-lg leading-relaxed mb-4">{p}</p>
              ))}
              {section.list && (
                <ul className="list-disc pl-6 space-y-2 text-gray-700 text-lg">
                  {section.list.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              )}
              {/* Fixed unit: after the second section. */}
              {i === 1 && <AdSlot placement="inline" className="mt-8" />}
            </section>
          ))}

          <nav className="border-t border-gray-200 pt-6 mt-10" aria-label="More guides">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">More guides</h2>
            <ul className="space-y-2">
              {others.map((g) => (
                <li key={g.slug}>
                  <Link href={`/guides/${g.slug}`} className="text-amber-700 hover:underline">{g.title}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </article>

        <aside className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Find clubs by state</h3>
            <ul className="grid grid-cols-2 gap-2">
              {popularStates.map((s) => (
                <li key={s.code}>
                  <Link href={`/state/${s.code}`} className="text-gray-700 hover:text-amber-700 text-sm">{s.name}</Link>
                </li>
              ))}
            </ul>
            <Link href="/states" className="inline-block mt-4 text-sm font-medium text-amber-700 hover:underline">All states</Link>
          </div>
          <AffiliateSection />
          {/* Last in the column so it sticks without covering the blocks above. */}
          <AdSlot placement="sidebar" className="lg:sticky lg:top-20" />
        </aside>
      </div>
    </div>
  );
}
