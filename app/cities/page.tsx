import { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import AdPlaceholder from '@/components/AdPlaceholder';
import { getAllCities, getAllStates } from '@/lib/data';
import { capitalizeCity, SITE_URL } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Browse Motorcycle Clubs by City',
  description: 'Find motorcycle clubs in cities across the United States. Browse our comprehensive directory organized by city.',
  openGraph: {
    title: 'Browse Motorcycle Clubs by City',
    description: 'Find motorcycle clubs in cities across the United States.',
    url: `${SITE_URL}/cities`,
  },
};

export default function CitiesPage() {
  const cities = getAllCities();
  const states = getAllStates();

  // Group cities by state
  const citiesByState = states.map((state) => ({
    state,
    cities: cities.filter((city) => city.state === state.code),
  })).filter((group) => group.cities.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'All Cities' }]} />

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Motorcycle Clubs by City
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Browse motorcycle clubs in {cities.length} cities across the United States.
          Select a city to view all motorcycle clubs in that area.
        </p>
      </div>

      <AdPlaceholder size="banner" className="mb-8" />

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

      <AdPlaceholder size="banner" className="mt-8" />
    </div>
  );
}
