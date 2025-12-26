import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import Rating from '@/components/Rating';
import ClubCard from '@/components/ClubCard';
import ClubImage from '@/components/ClubImage';
import ClubActions from '@/components/ClubActions';
import ReviewForm from '@/components/ReviewForm';
import ReviewList from '@/components/ReviewList';
import SchemaMarkup from '@/components/SchemaMarkup';
import AdPlaceholder from '@/components/AdPlaceholder';
import AffiliateSection from '@/components/AffiliateSection';
import { getAllClubs, getClubBySlug, getRelatedClubs, getStateByCode } from '@/lib/data';
import { formatRating, formatReviews, capitalizeCity, SITE_URL } from '@/lib/utils';
import { prisma } from '@/lib/db';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  const clubs = getAllClubs();
  // Only pre-render top 100 clubs at build time, rest will be generated on-demand
  return clubs.slice(0, 100).map((club) => ({
    slug: club.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const club = getClubBySlug(slug);

  if (!club) {
    return { title: 'Club Not Found' };
  }

  const cityName = capitalizeCity(club.City);

  return {
    title: `${club.name} - ${cityName}, ${club.stateName}`,
    description: club.description || `${club.name} is a motorcycle club located in ${cityName}, ${club.stateName}. ${club.rating > 0 ? `Rated ${club.rating}/5 with ${club.reviews} reviews.` : ''}`,
    openGraph: {
      title: `${club.name} - Motorcycle Club in ${cityName}, ${club.stateName}`,
      description: club.description || `${club.name} motorcycle club in ${cityName}, ${club.stateName}.`,
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

  // Get the database club record for reviews and actions
  // Skip database queries during build to avoid connection limits
  let dbClub = null;
  if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV === 'production') {
    try {
      dbClub = await prisma.club.findUnique({
        where: { placeId: club.place_id },
      });
    } catch (error) {
      console.error('Database query failed:', error);
      // Continue without database features during build
    }
  }

  const state = getStateByCode(club.State);
  const relatedClubs = getRelatedClubs(club, 4);
  const cityName = capitalizeCity(club.City);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: 'States', href: '/states' },
          { label: club.stateName, href: `/state/${club.State}` },
          { label: cityName, href: `/city/${club.State}/${club.citySlug}` },
          { label: club.name },
        ]}
      />

      <SchemaMarkup type="localBusiness" club={club} />

      <SchemaMarkup
        type="breadcrumb"
        items={[
          { name: 'Home', url: '/' },
          { name: 'States', url: '/states' },
          { name: club.stateName, url: `/state/${club.State}` },
          { name: cityName, url: `/city/${club.State}/${club.citySlug}` },
          { name: club.name, url: `/clubs/${club.slug}` },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image */}
          <div className="relative h-64 md:h-96 bg-gray-100 rounded-xl overflow-hidden mb-6">
            <ClubImage src={club.featured_image} alt={club.name} priority />
            {club.main_category && (
              <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-700 text-sm font-medium px-3 py-1 rounded-full z-10">
                {club.main_category}
              </span>
            )}
          </div>

          {/* Club Info */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {club.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              {club.rating > 0 && (
                <div className="flex items-center gap-2">
                  <Rating rating={club.rating} size="md" />
                  <span className="font-semibold text-gray-900">
                    {formatRating(club.rating)}
                  </span>
                  <span className="text-gray-500">
                    ({formatReviews(club.reviews)})
                  </span>
                </div>
              )}
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">
                {cityName}, {club.stateName}
              </span>
            </div>

            {club.description && (
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                {club.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="mt-6">
              <ClubActions
                placeId={club.place_id}
                clubSlug={club.slug}
                clubName={club.name}
                isVerified={dbClub?.isVerified}
                isClaimed={!!dbClub?.claimedById}
              />
            </div>
          </div>

          <AdPlaceholder size="inline" className="mb-8" />

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
                    <a href={`tel:${club.phone}`} className="text-blue-600 hover:underline">
                      {club.phone}
                    </a>
                  </dd>
                </div>
              )}
              {club.website && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Website</dt>
                  <dd className="mt-1">
                    <a
                      href={club.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
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
                      <span
                        key={cat.trim()}
                        className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full"
                      >
                        {cat.trim()}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              {club.closed_on && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Hours</dt>
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
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  View on Google Maps
                </a>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          {dbClub && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <ReviewList clubId={dbClub.id} />
                </div>
                <div>
                  <ReviewForm clubId={dbClub.id} clubName={club.name} />
                </div>
              </div>
            </section>
          )}

          {/* Related Clubs */}
          {relatedClubs.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                More Clubs in {cityName}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedClubs.map((relatedClub) => (
                  <ClubCard key={relatedClub.place_id} club={relatedClub} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <AdPlaceholder size="sidebar" />
          <AffiliateSection />

          {/* Quick Links */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Explore More</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/city/${club.State}/${club.citySlug}`}
                  className="text-gray-600 hover:text-gray-900 transition flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  More clubs in {cityName}
                </Link>
              </li>
              <li>
                <Link
                  href={`/state/${club.State}`}
                  className="text-gray-600 hover:text-gray-900 transition flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  All clubs in {club.stateName}
                </Link>
              </li>
              <li>
                <Link
                  href="/states"
                  className="text-gray-600 hover:text-gray-900 transition flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Browse all states
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <AdPlaceholder size="banner" className="mt-8" />
    </div>
  );
}
