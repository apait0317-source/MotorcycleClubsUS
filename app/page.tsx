import { toPublicClub } from '@/lib/club-projection';
import type { Metadata } from 'next';
import Link from 'next/link';
import ClubCard from '@/components/ClubCard';
import SchemaMarkup from '@/components/SchemaMarkup';
import HeroSearch from '@/components/HeroSearch';
import AdSenseLoader from '@/components/AdSenseLoader';
import { getAllStates, getIndexableStates, getIndexableClubs, getIndexableCities, getCityClubCount, getExploreClubs, getSiteStats, getListableClubsByState, getStateSummary } from '@/lib/data';
import { attachImages } from '@/lib/images';
import { guides } from '@/lib/guides';
import { capitalizeCity } from '@/lib/utils';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage() {
  // The search dropdown offers every state that has any club on file.
  const searchStates = getAllStates()
    .filter((state) => getStateSummary(state.code).clubCount > 0)
    .map((state) => ({ ...state, clubCount: getListableClubsByState(state.code).length }));
  // The grid links only to state pages that are indexed, largest first.
  const gridStates = getIndexableStates()
    .map((state) => ({ ...state, clubCount: getListableClubsByState(state.code).length }))
    .sort((a, b) => b.clubCount - a.clubCount || a.name.localeCompare(b.name))
    .slice(0, 24);
  const stats = getSiteStats();

  const reviewed = getIndexableClubs();
  const exploreClubs = attachImages(getExploreClubs(8));
  const popularCities = getIndexableCities().map((city) => ({ ...city, clubCount: getCityClubCount(city) }))
    .sort((a, b) => b.clubCount - a.clubCount || a.name.localeCompare(b.name)).slice(0, 12);

  return (
    <>
      <AdSenseLoader />
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
              {reviewed.length} source-reviewed profiles, plus basic directory entries across {stats.stateCount} states and territories.
              Compare club activities, find published contacts, and prepare your questions before joining.
            </p>

            <HeroSearch states={searchStates} />

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
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Choose the riding, then compare the commitment</h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              A name, patch or Google rating cannot tell you whether a club fits your life. Start with the riding you
              want to do, then compare published activities, membership rules and the time you can commit. Use the
              reviewed summaries to make a shortlist. Ask each club about current requirements before applying.
            </p>
            <p>
              Full profiles have source-reviewed summaries. Basic entries on state pages have not completed that
              review and may be incomplete or outdated. Neither is an endorsement or an invitation to a private
              clubhouse. <Link href="/guides/how-to-verify-a-motorcycle-club" className="text-amber-700 hover:underline">Check the club and chapter</Link>
              {' '}before visiting, and use the <Link href="/guides/how-to-join-a-motorcycle-club" className="text-amber-700 hover:underline">first-contact checklist</Link>
              {' '}to compare dues, attendance, guest rides and bike requirements.
            </p>
            <p>
              <Link href="/about" className="text-amber-700 hover:underline">Read how information is checked</Link>.
              A reviewed summary does not mean every address, phone number or Google rating has been reverified.
              Corrections and basic listings are free.
            </p>
          </div>
        </div>
      </section>

      {/* More clubs. The data has no added date, so this is a selection, not a recency list. */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Source-reviewed club profiles</h2>
              <p className="text-gray-600 mt-1">Original summaries checked against named sources. Review scope is shown on each profile; current details still need confirmation.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {exploreClubs.map((club) => (
              <ClubCard key={club.place_id} club={toPublicClub(club)} />
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

      {/* Browse by State */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">Browse by State</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {gridStates.map((state) => (
              <Link
                key={state.code}
                href={`/state/${state.code}`}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-amber-300 hover:shadow-md transition text-center"
              >
                <span className="font-semibold text-gray-900">{state.name}</span>
                <span className="block text-sm text-gray-500 mt-1">{state.clubCount} reviewed profiles</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/states" className="inline-flex items-center px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition">
              All States and Basic Coverage
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">Cities with reviewed profiles to compare</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularCities.map((city) => (
              <Link
                key={`${city.state}-${city.slug}`}
                href={`/city/${city.state}/${city.slug}`}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-amber-300 hover:shadow-md transition"
              >
                <span className="font-semibold text-gray-900 block">{capitalizeCity(city.name)}</span>
                <span className="text-sm text-gray-500">{city.stateName}</span>
                <span className="block text-sm text-gray-400 mt-1">{city.clubCount} reviewed profiles</span>
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
              <div className="text-gray-400 mt-1">Directory Entries</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-amber-500">{stats.stateCount}</div>
              <div className="text-gray-400 mt-1">States and Territories</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-amber-500">{stats.cityCount.toLocaleString()}</div>
              <div className="text-gray-400 mt-1">Cities on File</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-amber-500">{reviewed.length}</div>
              <div className="text-gray-400 mt-1">Source-reviewed Profiles</div>
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
