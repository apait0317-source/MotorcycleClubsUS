import Link from 'next/link';
import ClubCard from '@/components/ClubCard';
import AdPlaceholder from '@/components/AdPlaceholder';
import SchemaMarkup from '@/components/SchemaMarkup';
import HeroSearch from '@/components/HeroSearch';
import { getAllStates, getFeaturedClubs, getPopularCities, getTopRatedClubs, getRecentClubs } from '@/lib/data';
import { capitalizeCity } from '@/lib/utils';

export default function HomePage() {
  const states = getAllStates();
  const featuredClubs = getFeaturedClubs(8);
  const popularCities = getPopularCities(12);
  const topRatedClubs = getTopRatedClubs(8);
  const recentClubs = getRecentClubs(8);

  return (
    <>
      <SchemaMarkup type="organization" />

      {/* Hero Section with Search */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Find Motorcycle Clubs
              <span className="block text-amber-500">Across the USA</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10">
              Discover over 975+ motorcycle clubs in all 50 states. Connect with fellow riders
              and find your community.
            </p>

            {/* Hero Search */}
            <HeroSearch states={states} />

            {/* Quick Links */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link
                href="/states"
                className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition"
              >
                Browse by State
              </Link>
              <Link
                href="/cities"
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition"
              >
                Browse by City
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdPlaceholder size="banner" />
      </div>

      {/* Top Rated Clubs */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Top Rated Clubs
              </h2>
              <p className="text-gray-600 mt-1">Highest rated clubs across the country</p>
            </div>
            <Link
              href="/states"
              className="text-amber-600 hover:text-amber-700 font-medium transition flex items-center"
            >
              View all
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Recently Added */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Recently Added
              </h2>
              <p className="text-gray-600 mt-1">New clubs added to our directory</p>
            </div>
            <Link
              href="/states"
              className="text-amber-600 hover:text-amber-700 font-medium transition flex items-center"
            >
              View all
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentClubs.map((club) => (
              <ClubCard key={club.place_id} club={club} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Clubs */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Featured Clubs
              </h2>
              <p className="text-gray-600 mt-1">Popular clubs with great ratings</p>
            </div>
            <Link
              href="/states"
              className="text-amber-600 hover:text-amber-700 font-medium transition flex items-center"
            >
              View all
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredClubs.map((club) => (
              <ClubCard key={club.place_id} club={club} />
            ))}
          </div>
        </div>
      </section>

      {/* Browse by State */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            Browse by State
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {states.slice(0, 24).map((state) => (
              <Link
                key={state.code}
                href={`/state/${state.code}`}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-amber-300 hover:shadow-md transition text-center"
              >
                <span className="font-semibold text-gray-900">{state.name}</span>
                <span className="block text-sm text-gray-500 mt-1">
                  {state.clubCount} clubs
                </span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/states"
              className="inline-flex items-center px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition"
            >
              View All States
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            Popular Cities
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularCities.map((city) => (
              <Link
                key={`${city.state}-${city.slug}`}
                href={`/city/${city.state}/${city.slug}`}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-amber-300 hover:shadow-md transition"
              >
                <span className="font-semibold text-gray-900 block">
                  {capitalizeCity(city.name)}
                </span>
                <span className="text-sm text-gray-500">
                  {city.stateName}
                </span>
                <span className="block text-sm text-gray-400 mt-1">
                  {city.clubCount} clubs
                </span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/cities"
              className="inline-flex items-center px-6 py-3 border-2 border-amber-500 text-amber-600 font-semibold rounded-lg hover:bg-amber-500 hover:text-white transition"
            >
              View All Cities
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-amber-500">975+</div>
              <div className="text-gray-400 mt-1">Motorcycle Clubs</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-amber-500">51</div>
              <div className="text-gray-400 mt-1">States Covered</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-amber-500">527</div>
              <div className="text-gray-400 mt-1">Cities</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-amber-500">4.5+</div>
              <div className="text-gray-400 mt-1">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Know a Club That&apos;s Not Listed?
          </h2>
          <p className="text-gray-600 mb-8">
            Help us grow our directory by submitting motorcycle clubs in your area.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center px-8 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Submit a Club
          </Link>
        </div>
      </section>

      {/* Bottom Ad */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdPlaceholder size="banner" />
      </div>
    </>
  );
}
