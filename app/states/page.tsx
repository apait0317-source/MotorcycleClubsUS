import { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import SchemaMarkup from '@/components/SchemaMarkup';
import AdPlaceholder from '@/components/AdPlaceholder';
import { getAllStates } from '@/lib/data';
import { SITE_URL } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Browse Motorcycle Clubs by State',
  description: 'Find motorcycle clubs in all 50 US states. Browse our comprehensive directory of motorcycle clubs organized by state.',
  openGraph: {
    title: 'Browse Motorcycle Clubs by State',
    description: 'Find motorcycle clubs in all 50 US states.',
    url: `${SITE_URL}/states`,
  },
};

export default function StatesPage() {
  const states = getAllStates();

  const breadcrumbSchema = states.map((state, index) => ({
    name: state.name,
    url: `/state/${state.code}`,
    position: index + 1,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          Browse our comprehensive directory of motorcycle clubs across all 50 US states.
          Select a state to view all motorcycle clubs in that area.
        </p>
      </div>

      <AdPlaceholder size="banner" className="mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {states.map((state) => (
          <Link
            key={state.code}
            href={`/state/${state.code}`}
            className="bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition group"
          >
            <h2 className="font-semibold text-lg text-gray-900 group-hover:text-gray-700">
              {state.name}
            </h2>
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
              <span>{state.clubCount} clubs</span>
              <span>{state.cityCount} cities</span>
            </div>
            <div className="mt-3 text-sm text-gray-400 group-hover:text-gray-600 transition">
              View clubs →
            </div>
          </Link>
        ))}
      </div>

      <AdPlaceholder size="banner" className="mt-8" />
    </div>
  );
}
