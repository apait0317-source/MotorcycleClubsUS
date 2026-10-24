import { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import SchemaMarkup from '@/components/SchemaMarkup';
import AdSenseLoader from '@/components/AdSenseLoader';
import { getIndexableStates, getListableClubsByState } from '@/lib/data';
import { SITE_URL } from '@/lib/utils';

// Counted from the data, so the copy stays true when coverage changes.
const stateCount = getIndexableStates().length;

export const metadata: Metadata = {
  alternates: { canonical: '/states' },
  title: 'Browse Motorcycle Clubs by State',
  description: `Find motorcycle clubs in ${stateCount} states and territories. Pick a state to see its clubs by city, with websites and phone numbers where clubs publish them.`,
  openGraph: {
    title: 'Browse Motorcycle Clubs by State',
    description: `Find motorcycle clubs in ${stateCount} states and territories.`,
    url: `${SITE_URL}/states`,
  },
};

export default async function StatesPage() {
  const states = getIndexableStates();

  // Listable club counts per state, matching the cards on each state page.
  const statesWithCounts = states.map(state => {
    const stateClubs = getListableClubsByState(state.code);
    return {
      ...state,
      actualClubCount: stateClubs.length,
      actualCityCount: new Set(stateClubs.map((club) => club.citySlug)).size,
    };
  });

  const breadcrumbSchema = states.map((state, index) => ({
    name: state.name,
    url: `/state/${state.code}`,
    position: index + 1,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdSenseLoader />
      <Breadcrumbs items={[{ label: 'All States' }]} />

      <SchemaMarkup
        type="itemList"
        name="US States with Motorcycle Clubs"
        items={breadcrumbSchema}
      />

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Motorcycle Clubs by State
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          Every state page opens with a short guide to that state&apos;s riding country, the roads and rallies clubs plan around, and where the clubs cluster, followed by the full list of clubs and cities.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {statesWithCounts.map((state) => (
          <Link
            key={state.code}
            href={`/state/${state.code}`}
            className="bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition group"
          >
            <h2 className="font-semibold text-lg text-gray-900 group-hover:text-gray-700">
              {state.name}
            </h2>
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
              <span>{state.actualClubCount} clubs</span>
              <span>{state.actualCityCount} {state.actualCityCount === 1 ? 'city' : 'cities'}</span>
            </div>
            <div className="mt-3 text-sm text-gray-400 group-hover:text-gray-600 transition">
              View clubs →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
