import { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import AdSenseLoader from '@/components/AdSenseLoader';
import { getIndexableCities, getAllStates, getCityClubCount, getListableClubsByState } from '@/lib/data';
import { capitalizeCity, SITE_URL } from '@/lib/utils';

export const metadata: Metadata = {
  alternates: { canonical: '/cities' },
  title: 'Browse Motorcycle Clubs by City',
  description: 'Find motorcycle clubs by city. Every city listed has two or more clubs, with websites and phone numbers where clubs publish them.',
  openGraph: {
    title: 'Browse Motorcycle Clubs by City',
    description: 'Find motorcycle clubs in cities across the United States.',
    url: `${SITE_URL}/cities`,
  },
};

export default function CitiesPage() {
  const cities = getIndexableCities().map((city) => ({ ...city, clubCount: getCityClubCount(city) }));
  const states = getAllStates().map((state) => ({ ...state, clubCount: getListableClubsByState(state.code).length }));

  // Group cities by state; only cities with two or more listed clubs get their own page.
  const citiesByState = states.map((state) => ({
    state,
    cities: cities.filter((city) => city.state === state.code).sort((a, b) => b.clubCount - a.clubCount || a.name.localeCompare(b.name)),
  })).filter((group) => group.cities.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdSenseLoader />
      <Breadcrumbs items={[{ label: 'All Cities' }]} />

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Motorcycle Clubs by City
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          {cities.length} cities with two or more listed motorcycle clubs. Cities with a single club are shown on
          their state page instead, so each city page here has a real choice to compare.
        </p>
      </div>

      <div className="space-y-12">
        {citiesByState.map(({ state, cities: stateCities }) => (
          <section key={state.code}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{state.name}</h2>
              <Link
                href={`/state/${state.code}`}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                View all {state.clubCount} clubs →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {stateCities.map((city) => (
                <Link
                  key={`${city.state}-${city.slug}`}
                  href={`/city/${city.state}/${city.slug}`}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-md transition"
                >
                  <span className="font-semibold text-gray-900 block">
                    {capitalizeCity(city.name)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {city.clubCount} clubs
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
