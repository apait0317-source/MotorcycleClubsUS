import ClubComparison from '@/components/ClubComparison';
import { getMarketClubs } from '@/lib/markets';
import { toPublicComparisonRow } from '@/lib/market-projection';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import SchemaMarkup from '@/components/SchemaMarkup';
import AdSlot from '@/components/AdSlot';
import AdSenseLoader from '@/components/AdSenseLoader';
import AffiliateSection from '@/components/AffiliateSection';
import { getGuide, guides, guideWordCount } from '@/lib/guides';
import { getGuideAffiliateOffer } from '@/lib/affiliates';
import { getIndexableStates } from '@/lib/data';
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
      publishedTime: guide.published,
      modifiedTime: guide.updated,
    },
  };
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const affiliateOffer = getGuideAffiliateOffer(guide.slug);
  const comparisonRows = guide.marketId ? getMarketClubs(guide.marketId).map(toPublicComparisonRow).filter(row => row !== undefined) : [];
  const others = guides.filter((g) => g.slug !== guide.slug);
  const popularStates = [...getIndexableStates()].sort((a, b) => b.clubCount - a.clubCount).slice(0, 8);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    datePublished: guide.published,
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
      {comparisonRows.length > 0 && <SchemaMarkup type="itemList" name="Reviewed Bay Area motorcycle clubs" items={comparisonRows.map((row, index) => ({ name: row.name, url: row.profileHref, position: index + 1 }))} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <article className="lg:col-span-2">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{guide.title}</h1>
            <p className="text-sm text-gray-500">
              Updated {new Date(`${guide.updated}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })} · {guide.readingMinutes} min read
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
              {i === 0 && guide.marketId && comparisonRows.length > 0 && <>
                <ClubComparison rows={comparisonRows} marketId={guide.marketId} heading="Compare Bay Area clubs" />
                <nav aria-label="Bay Area next steps" className="flex flex-wrap gap-4 text-sm font-medium">
                  <Link href="/state/ca" className="text-amber-700 hover:underline">California directory</Link>
                  <Link href="/guides/how-to-join-a-motorcycle-club" className="text-amber-700 hover:underline">Prepare your first contact</Link>
                  <Link href="/guides/how-to-verify-a-motorcycle-club" className="text-amber-700 hover:underline">Verify a club and chapter</Link>
                </nav>
              </>}
              {affiliateOffer && section.heading === affiliateOffer.afterHeading && (
                <AffiliateSection title={affiliateOffer.title} products={affiliateOffer.products} compact className="mt-6" />
              )}
              {/* Fixed unit: after the second section. */}
              {i === 1 && <AdSlot placement="inline" className="mt-8" />}
            </section>
          ))}

          {guide.sources && guide.sources.length > 0 && (
            <section aria-label="Sources and further reading" className="border-t border-gray-200 pt-6 mt-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Sources and further reading</h2>
              <p className="text-gray-600 mb-3">These references explain the specific programs and guidance discussed here. Check the relevant club, organizer, or public agency for current requirements and conditions.</p>
              <ul className="space-y-2">
                {guide.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline">{source.title}</a>
                  </li>
                ))}
              </ul>
            </section>
          )}

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
          {/* Last in the column so it sticks without covering the blocks above. */}
          <AdSlot placement="sidebar" className="lg:sticky lg:top-20" />
        </aside>
      </div>
    </div>
  );
}
