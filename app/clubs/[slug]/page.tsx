import ClubDiscoveryFacts from '@/components/ClubDiscoveryFacts';
import { toPublicComparisonRow } from '@/lib/market-projection';
import { getMarketClubs } from '@/lib/markets';
import { getGuide } from '@/lib/guides';
import { getVerifiedChapterOrgs, getVerifiedChapterProfile } from '@/lib/verified-chapters';
import { toPublicClub } from '@/lib/club-projection';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import Rating from '@/components/Rating';
import ClubCard from '@/components/ClubCard';
import { chapterOrgForId } from '@/lib/chapter-orgs';
import ClubImage from '@/components/ClubImage';
import ClubImageGallery from '@/components/ClubImageGallery';
import SchemaMarkup from '@/components/SchemaMarkup';
import AdSlot from '@/components/AdSlot';
import AdSenseLoader from '@/components/AdSenseLoader';
import AffiliateSection from '@/components/AffiliateSection';
import { getAllClubs, getClubBySlug, getRelatedClubs, isIndexableClub, isTemplateDescription, isIndexableCity, getCityBySlug } from '@/lib/data';
import { attachImages, getClubImages, sortForDisplay } from '@/lib/images';
import { correctionHref } from '@/lib/contact';
import { formatRating, formatReviews, capitalizeCity, SITE_URL } from '@/lib/utils';
import { clubMetaDescription, clubTitle } from '@/lib/seo';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Every club page is built ahead of time from data/clubs.json. Unknown slugs 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllClubs().map((club) => ({ slug: club.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const club = getClubBySlug(slug);

  if (!club) {
    return { title: 'Club Not Found' };
  }

  if (club.editorial?.listingStatus === 'excluded') {
    return {
      title: 'Listing unavailable',
      description: 'This entry is not included in the current motorcycle club directory.',
      alternates: { canonical: `/clubs/${club.slug}` },
      robots: { index: false, follow: true },
    };
  }

  const cityName = capitalizeCity(club.City);
  const indexable = isIndexableClub(club);

  const description = clubMetaDescription(club);

  return {
    title: clubTitle(club),
    alternates: { canonical: `/clubs/${club.slug}` },
    // Thin listings, dealers, venues, and bars stay reachable but out of the index.
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    description,
    openGraph: {
      title: `${club.name} - Motorcycle Club in ${cityName}, ${club.stateName}`,
      description,
      url: `${SITE_URL}/clubs/${club.slug}`,
      images: club.featured_image ? [{ url: club.featured_image }] : undefined,
    },
  };
}

export default async function ClubPage({ params }: PageProps) {
  const { slug } = await params;
  const club = getClubBySlug(slug);

  if (!club) {
    notFound();
  }
  if (club.slug !== slug) permanentRedirect(`/clubs/${club.slug}`);

  if (club.editorial?.listingStatus === 'excluded') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Listing unavailable</h1>
        <p className="text-gray-700 mb-4">
          This entry is not included in the current motorcycle club directory. This does not establish that an
          organization has closed. Browse the current profiles or contact us about a listing correction.
        </p>
        <div className="flex flex-wrap gap-6">
          <Link href="/states" className="text-amber-700 hover:underline">Browse current profiles</Link>
          <Link href={correctionHref(club.name, club.slug)} className="text-amber-700 hover:underline">Suggest a correction</Link>
        </div>
      </div>
    );
  }

  const comparisonRow = toPublicComparisonRow(club);
  const regionalGuide = getMarketClubs('sf-bay-area').some(row => row.slug === club.slug)
    ? getGuide('motorcycle-clubs-san-francisco-bay-area') : undefined;
  const parent = getVerifiedChapterOrgs().find(org => org.chapters.some(chapter =>
    chapter.existingClubSlug && getVerifiedChapterProfile(chapter)?.slug === club.slug));
  const images = getClubImages(club.place_id);
  const relatedClubs = attachImages(sortForDisplay(getRelatedClubs(club, 20)).slice(0, 4));
  const cityRecord = getCityBySlug(club.State, club.citySlug);
  const cityHasPage = cityRecord ? isIndexableCity(cityRecord) : false;
  const amaChartered = isTemplateDescription(club.description);
  const chapterOrg = chapterOrgForId(club.place_id);
  // Thin listings are noindex; they carry no ads either (low-value screens).
  const indexable = isIndexableClub(club);
  const showDescription = Boolean(club.description) && !amaChartered;
  const cityName = capitalizeCity(club.City);
  // A source used only to remove an unrelated website should not offer that
  // domain to visitors again as a reference link.
  const publicSourceUrls = club.editorial ? [...new Set(club.editorial.evidence
    .filter(source => !(club.editorial!.changes.website === '' && source.fields.every(field => field === 'website')))
    .map(source => source.url))] : [];
  // Most links are Google Maps listings, but AMA chapters link to the association's charter search.
  const linkLabel = /americanmotorcyclist\.com/i.test(club.link) ? 'View AMA charter listing' : 'View on Google Maps';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {indexable && <AdSenseLoader />}
      <Breadcrumbs
        items={[
          { label: 'States', href: '/states' },
          { label: club.stateName, href: `/state/${club.State}` },
          ...(cityHasPage ? [{ label: cityName, href: `/city/${club.State}/${club.citySlug}` }] : []),
          { label: club.name },
        ]}
      />

      <SchemaMarkup type="club" club={club} parentOrganization={parent ? { name: parent.name, url: `/chapters/${parent.slug}` } : undefined} />

      <SchemaMarkup
        type="breadcrumb"
        items={[
          { name: 'Home', url: '/' },
          { name: 'States', url: '/states' },
          { name: club.stateName, url: `/state/${club.State}` },
          ...(cityHasPage ? [{ name: cityName, url: `/city/${club.State}/${club.citySlug}` }] : []),
          { name: club.name, url: `/clubs/${club.slug}` },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {images.length > 0 ? (
            <div className="mb-6">
              <ClubImageGallery images={images} clubName={club.name} />
            </div>
          ) : (
            <div className="relative h-64 md:h-96 bg-gray-100 rounded-xl overflow-hidden mb-6">
              <ClubImage src={club.featured_image || club.featured_image_original} alt={club.name} priority />
              {club.main_category && (
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-700 text-sm font-medium px-3 py-1 rounded-full z-10">
                  {club.main_category}
                </span>
              )}
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{club.name}</h1>

            {chapterOrg && (
              <p className="text-gray-600 mb-4">
                A chapter of the {chapterOrg.name}.{' '}
                <Link href={`/chapters/${chapterOrg.slug}`} className="text-amber-700 hover:underline">
                  See all {chapterOrg.short} chapters
                </Link>
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-4">
              {club.rating > 0 && (
                <div className="flex items-center gap-2">
                  <Rating rating={club.rating} size="md" />
                  <span className="font-semibold text-gray-900">{formatRating(club.rating)}</span>
                  <span className="text-gray-500">({formatReviews(club.reviews, 'Google')})</span>
                </div>
              )}
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">
                {cityName}, {club.stateName}
              </span>
            </div>

            {showDescription && (
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{club.description}</p>
            )}
            {amaChartered && (
              <p className="text-gray-700 text-lg leading-relaxed">
                The source listing identifies {club.name} as an American Motorcyclist Association chartered organization.
                Charter types and event arrangements vary. Confirm current activity, membership requirements, event
                sanctioning, and insurance directly with the club.
              </p>
            )}

            {club.editorial && (
              <section aria-label="Information checked" className="mt-6 text-sm text-gray-600">
                <p>
                  Information checked: <time dateTime={club.editorial.verifiedAt}>
                    {new Date(`${club.editorial.verifiedAt}T00:00:00Z`).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
                    })}
                  </time>
                </p>
                <p>
                  Reviewed: {['organization identity', 'listing classification',
                    ...(['description', 'website', 'phone', 'name', 'location'] as const).filter((field) =>
                      Object.hasOwn(club.editorial!.changes, field)),
                  ].join(', ')}
                </p>
                <ul className="mt-2 space-y-1">
                  {publicSourceUrls.map((url) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noopener noreferrer nofollow external" className="text-amber-600 hover:text-amber-700 break-all">
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-6">
              <Link
                href={correctionHref(club.name, club.slug)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Suggest a correction
              </Link>
            </div>
          </div>

          {comparisonRow && <ClubDiscoveryFacts row={comparisonRow} />}
          {parent && <p className="mb-6 text-sm text-gray-600">A source-listed chapter of {parent.name}. <Link href={`/chapters/${parent.slug}`} className="text-amber-700 hover:underline">View the chapter directory and sources</Link>.</p>}
          {regionalGuide && <p className="mb-8 text-sm"><Link href={`/guides/${regionalGuide.slug}`} className="font-medium text-amber-700 hover:underline">Compare this club with other reviewed Bay Area clubs →</Link></p>}

          {/* Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Club Details</h2>
            <dl className="space-y-4">
              {club.address && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="text-gray-900 mt-1">{club.address}</dd>
                </div>
              )}
              {club.phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1">
                    <a href={`tel:${club.phone}`} className="text-blue-600 hover:underline">{club.phone}</a>
                  </dd>
                </div>
              )}
              {club.website && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Website</dt>
                  <dd className="mt-1">
                    <a href={club.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                      {club.website}
                    </a>
                  </dd>
                </div>
              )}
              {club.categories && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Categories</dt>
                  <dd className="mt-1 flex flex-wrap gap-2">
                    {club.categories.split(',').map((cat) => (
                      <span key={cat.trim()} className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full">
                        {cat.trim()}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              {amaChartered && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Affiliation</dt>
                  <dd className="text-gray-900 mt-1">American Motorcyclist Association chartered club</dd>
                </div>
              )}
              {club.closed_on && club.closed_on.trim().toLowerCase() !== 'open all days' && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Listed closed days</dt>
                  <dd className="text-gray-900 mt-1">{club.closed_on}</dd>
                </div>
              )}
            </dl>

            {club.link && (
              <div className="mt-6">
                <a
                  href={club.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  {linkLabel}
                </a>
              </div>
            )}
          </div>

          {/* In-content unit. On phones the sidebar unit sits at the page bottom, so this is the one readers reach. */}
          {indexable && <AdSlot placement="inline" className="mb-8" />}

          {relatedClubs.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related clubs in {club.stateName}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedClubs.map((relatedClub) => (
                  <ClubCard key={relatedClub.place_id} club={toPublicClub(relatedClub)} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar. The ad is last so it can stick without covering the links above it. */}
        <aside className="lg:col-span-1 space-y-6">
          {indexable && !chapterOrg && <AffiliateSection />}

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Explore More</h3>
            <ul className="space-y-3">
              {cityHasPage && (
                <li>
                  <Link href={`/city/${club.State}/${club.citySlug}`} className="text-gray-600 hover:text-gray-900 transition flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    More clubs in {cityName}
                  </Link>
                </li>
              )}
              <li>
                <Link href={`/state/${club.State}`} className="text-gray-600 hover:text-gray-900 transition flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  All clubs in {club.stateName}
                </Link>
              </li>
              <li>
                <Link href="/states" className="text-gray-600 hover:text-gray-900 transition flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Browse all states
                </Link>
              </li>
            </ul>
          </div>

          {indexable && <AdSlot placement="sidebar" className="lg:sticky lg:top-20" />}
        </aside>
      </div>
    </div>
  );
}
