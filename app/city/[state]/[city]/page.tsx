import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import ClubCard from '@/components/ClubCard';
import SchemaMarkup from '@/components/SchemaMarkup';
import AdSlot from '@/components/AdSlot';
import AffiliateSection from '@/components/AffiliateSection';
import { getAllCities, getCityBySlug, getStateByCode, isIndexableCity, getStateSummary, getListableClubsByCity, getThinClubsByCity } from '@/lib/data';
import { shouldInsertInFeedAd } from '@/lib/ads';
import { attachImages, sortForDisplay } from '@/lib/images';
import { capitalizeCity, SITE_URL } from '@/lib/utils';

interface PageProps {
  params: Promise<{ state: string; city: string }>;
}

export async function generateStaticParams() {
  return getAllCities().map((city) => ({ state: city.state, city: city.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state, city: citySlug } = await params;
  const city = getCityBySlug(state, citySlug);
  if (!city) return { title: 'City Not Found' };

  const cityName = capitalizeCity(city.name);
  const count = getListableClubsByCity(state, citySlug).length + getThinClubsByCity(state, citySlug).length;
  const indexable = isIndexableCity(city);

  return {
    title: `Motorcycle Clubs in ${cityName}, ${city.stateName}`,
    description: `${count} motorcycle ${count === 1 ? 'club' : 'clubs'} in ${cityName}, ${city.stateName}, with categories, websites, and phone numbers. Browse nearby cities and the full ${city.stateName} list.`,
    alternates: { canonical: `/city/${city.state}/${city.slug}` },
    // Cities with a single club duplicate that club's page; keep them out of the index.
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: {
      title: `Motorcycle Clubs in ${cityName}, ${city.stateName}`,
      description: `Find ${count} motorcycle clubs in ${cityName}, ${city.stateName}.`,
      url: `${SITE_URL}/city/${city.state}/${city.slug}`,
    },
  };
}

export default async function CityPage({ params }: PageProps) {
  const { state: stateCode, city: citySlug } = await params;
  const city = getCityBySlug(stateCode, citySlug);
  const state = getStateByCode(stateCode);
  if (!city || !state) notFound();

  const clubs = attachImages(sortForDisplay(getListableClubsByCity(stateCode, citySlug)));
  const thinClubs = getThinClubsByCity(stateCode, citySlug);
  const cityName = capitalizeCity(city.name);
  const summary = getStateSummary(stateCode);
  const nearbyCities = summary.topCities.filter((c) => c.slug !== citySlug).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: 'States', href: '/states' },
          { label: state.name, href: `/state/${state.code}` },
          { label: cityName },
        ]}
      />

      <SchemaMarkup
        type="breadcrumb"
        items={[
          { name: 'Home', url: '/' },
          { name: 'States', url: '/states' },
          { name: state.name, url: `/state/${state.code}` },
          { name: cityName, url: `/city/${city.state}/${city.slug}` },
        ]}
      />

      <div className="mb-8 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Motorcycle Clubs in {cityName}, {city.stateName}
        </h1>
        <p className="text-lg text-gray-600">
          {clubs.length + thinClubs.length} motorcycle {clubs.length + thinClubs.length === 1 ? 'club is' : 'clubs are'} listed in {cityName}.
          {' '}{state.name} has {summary.clubCount} clubs in {summary.cityCount} cities, so widen the search to the{' '}
          <Link href={`/state/${state.code}`} className="text-amber-700 hover:underline">full {state.name} list</Link>
          {' '}if none of these fit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {clubs.map((club, index) => (
              <React.Fragment key={club.place_id}>
                <ClubCard club={club} />
                {shouldInsertInFeedAd(index, clubs.length) && (
                  <div className="col-span-full">
                    <AdSlot placement="inline" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {clubs.length === 0 && thinClubs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No motorcycle clubs are listed in {cityName} yet.</p>
              <Link href="/submit" className="inline-block mt-4 text-amber-700 hover:underline">Submit one</Link>
            </div>
          )}

          {thinClubs.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Other clubs in {cityName}</h2>
              <p className="text-sm text-gray-500 mb-3">Clubs with limited public details on file. Names link to the club&apos;s own website where one is published.</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {thinClubs.map((club) => (
                  <li key={club.place_id}>
                    {club.website ? (
                      <a href={club.website} target="_blank" rel="noopener noreferrer nofollow" className="hover:text-amber-700">{club.name}</a>
                    ) : (
                      <span>{club.name}</span>
                    )}
                    {club.main_category && <span className="text-gray-400"> · {club.main_category}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {nearbyCities.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Other {state.name} cities with clubs</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {nearbyCities.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/city/${c.state}/${c.slug}`}
                    className="bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 hover:shadow-md transition text-center"
                  >
                    <span className="font-medium text-gray-900 text-sm">{capitalizeCity(c.name)}</span>
                    <span className="block text-xs text-gray-500 mt-1">{c.clubCount} clubs</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">New to clubs?</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/guides/how-to-join-a-motorcycle-club" className="text-amber-700 hover:underline">How to join a motorcycle club</Link></li>
              <li><Link href="/guides/types-of-motorcycle-clubs" className="text-amber-700 hover:underline">Types of motorcycle clubs</Link></li>
              <li><Link href="/guides/motorcycle-club-etiquette-and-patches" className="text-amber-700 hover:underline">Club etiquette and patches</Link></li>
            </ul>
          </div>
          <AffiliateSection />
          {/* Last in the column so it sticks without covering the blocks above. */}
          <div className="lg:sticky lg:top-20">
            <AdSlot placement="sidebar" />
          </div>
        </aside>
      </div>
    </div>
  );
}
