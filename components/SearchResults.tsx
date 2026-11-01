'use client';

import { useSearchParams } from 'next/navigation';
import Breadcrumbs from './Breadcrumbs';
import ClubCard from './ClubCard';
import { filterPublicClubs, type PublicClub } from '@/lib/public-clubs';
import type { State } from '@/lib/types';

export default function SearchResults({ clubs, states }: { clubs: PublicClub[]; states: State[] }) {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  // The home page search box passes the chosen state as ?state=xx.
  const state = states.find((entry) => entry.code === (searchParams.get('state') || '').toLowerCase());
  const results = query ? filterPublicClubs(clubs, query, state?.code) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Search Results' }]} />

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Search Results
        </h1>
        {query && (
          <p className="text-lg text-gray-600">
            {results.length} results for &quot;{query}&quot;{state ? <> in {state.name}</> : null}
          </p>
        )}
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((club) => (
            <ClubCard key={club.place_id} club={club} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          {query ? (
            <>
              <p className="text-gray-500 text-lg mb-4">
                No motorcycle clubs found matching &quot;{query}&quot;
              </p>
              <p className="text-gray-400">
                Try searching for a different club name, city, or state.
              </p>
            </>
          ) : (
            <p className="text-gray-500 text-lg">
              Enter a search term to find motorcycle clubs.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

