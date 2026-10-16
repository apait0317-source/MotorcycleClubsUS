import type { Metadata } from 'next';
import Link from 'next/link';
import ClubCard from '@/components/ClubCard';
import SchemaMarkup from '@/components/SchemaMarkup';
import HeroSearch from '@/components/HeroSearch';
import { getAllStates, getFeaturedClubs, getPopularCities, getTopRatedClubs, getRecentClubs, getSiteStats, getListableClubsByState } from '@/lib/data';
import { attachImages, clubHasImages } from '@/lib/images';
import { guides } from '@/lib/guides';
import { capitalizeCity, SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

function pickWithImagesFirst<T extends { place_id: string }>(list: T[], limit: number): T[] {
  const withImages = list.filter((c) => clubHasImages(c.place_id));
  const rest = list.filter((c) => !clubHasImages(c.place_id));
  return [...withImages, ...rest].slice(0, limit);
}

export default function HomePage() {
  const states = getAllStates().map((state) => ({ ...state, clubCount: getListableClubsByState(state.code).length }));
  const stats = getSiteStats();

  const topRatedClubs = attachImages(pickWithImagesFirst(getTopRatedClubs(100), 8));
  const shown = new Set(topRatedClubs.map((c) => c.place_id));
  const recentClubs = attachImages(pickWithImagesFirst(getRecentClubs(100).filter((c) => !shown.has(c.place_id)), 8));
  recentClubs.forEach((c) => shown.add(c.place_id));
  const featuredClubs = attachImages(pickWithImagesFirst(getFeaturedClubs(100).filter((c) => !shown.has(c.place_id)), 8));
  const popularCities = getPopularCities(12);
  const roundedClubCount = Math.floor(stats.clubCount / 100) * 100;

  return (
    <>
      <SchemaMarkup type="organization" />
      <SchemaMarkup type="website" />

      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Find Motorcycle Clubs
              <span className="block text-amber-500">Across the USA</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10">
              {roundedClubCount.toLocaleString()}+ motorcycle clubs, riding clubs, and veteran MCs in {stats.stateCount} states.
              Browse by state or city, check contact details, and learn how to join.
            </p>

            <HeroSearch states={states} />

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link
                href="/states"
                className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition"
              >
                Browse by State
              </Link>
              <Link
                href="/guides/how-to-join-a-motorcycle-club"
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition"
              >
                How to Join a Club
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What this directory is */}
      <section className="py-10 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">A directory built for riders looking for a club</h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              {SITE_NAME} lists traditional motorcycle clubs, riding clubs, brand owners groups, veteran and first
              responder clubs, women&apos;s clubs, ministries, recovery clubs, off-road clubs, and rider rights
              organizations across the United States. Each listing shows the club&apos;s type, city, website, and phone
              where the club has published them, so you can tell a three-piece-patch MC from a Saturday riding group
              before you reach out.
            </p>
            <p>
              Start with your state. Every state page opens with a short guide to that state&apos;s riding country, the
              roads and rallies clubs plan around, and where the clubs cluster, then lists the clubs by city. If you are
              new to club culture, the rider guides explain how clubs are organized, what prospecting involves, how to
              read a patch, and how to behave at a clubhouse or in a pack. Listings come from club websites, published
              charter lists, public business listings, and submissions from riders and club officers, and we correct
              them when a club tells us something has changed.
            </p>
          </div>
        </div>
      </section>

      {/* Top Rated Clubs */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Top Rated Clubs</h2>
              <p className="text-gray-600 mt-1">Highest public ratings with at least five reviews</p>
            </div>
            <Link href="/states" className="text-amber-600 hover:text-amber-700 font-medium transition flex items-center">
              View all
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topRatedClubs.map((club) => (
              <ClubCard key={club.place_id} club={club} />
            ))}
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">New to Clubs? Start Here</h2>
              <p className="text-gray-600 mt-1">How clubs work, what the patches mean, and how to approach one</p>
            </div>
            <Link href="/guides" className="text-amber-600 hover:text-amber-700 font-medium transition">All guides</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {guides.slice(0, 6).map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-amber-300 hover:shadow-md transition"
              >
                <span className="text-xs uppercase tracking-wider text-amber-600 font-semibold">{guide.readingMinutes} min read</span>
                <h3 className="text-lg font-bold text-gray-900 mt-2 mb-2">{guide.shortTitle}</h3>
                <p className="text-gray-600 text-sm line-clamp-3">{guide.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Added */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Recently Added</h2>
              <p className="text-gray-600 mt-1">New clubs added to the directory</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentClubs.map((club) => (
              <ClubCard key={club.place_id} club={club} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Clubs */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Clubs</h2>
              <p className="text-gray-600 mt-1">Well-reviewed clubs with ten or more public reviews</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredClubs.map((club) => (
              <ClubCard key={club.place_id} club={club} />
            ))}
          </div>
        </div>
      </section>

      {/* Browse by State */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">Browse by State</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {states.slice(0, 24).map((state) => (
              <Link
                key={state.code}
                href={`/state/${state.code}`}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-amber-300 hover:shadow-md transition text-center"
              >
                <span className="font-semibold text-gray-900">{state.name}</span>
                <span className="block text-sm text-gray-500 mt-1">{state.clubCount} clubs</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/states" className="inline-flex items-center px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition">
              View All States
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">Cities with the Most Clubs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularCities.map((city) => (
              <Link
                key={`${city.state}-${city.slug}`}
                href={`/city/${city.state}/${city.slug}`}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-amber-300 hover:shadow-md transition"
              >
                <span className="font-semibold text-gray-900 block">{capitalizeCity(city.name)}</span>
                <span className="text-sm text-gray-500">{city.stateName}</span>
                <span className="block text-sm text-gray-400 mt-1">{city.clubCount} clubs</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/cities" className="inline-flex items-center px-6 py-3 border-2 border-amber-500 text-amber-600 font-semibold rounded-lg hover:bg-amber-500 hover:text-white transition">
              View All Cities
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section: every figure computed from the data file */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-amber-500">{stats.clubCount.toLocaleString()}</div>
              <div className="text-gray-400 mt-1">Motorcycle Clubs</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-amber-500">{stats.stateCount}</div>
              <div className="text-gray-400 mt-1">States and DC</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-amber-500">{stats.cityCount.toLocaleString()}</div>
              <div className="text-gray-400 mt-1">Cities</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-amber-500">{stats.veteranClubCount}</div>
              <div className="text-gray-400 mt-1">Veteran Clubs</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Know a Club That&apos;s Not Listed?</h2>
          <p className="text-gray-600 mb-8">
            Send us the club name, city, and a website or contact. We review every submission before it goes live.
          </p>
          <Link href="/submit" className="inline-flex items-center px-8 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition">
            Submit a Club
          </Link>
        </div>
      </section>
    </>
  );
}
