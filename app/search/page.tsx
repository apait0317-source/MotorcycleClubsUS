'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import ClubCard from '@/components/ClubCard';
import AdPlaceholder from '@/components/AdPlaceholder';
import { searchClubs } from '@/lib/data';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const results = query ? searchClubs(query) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Search Results' }]} />

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Search Results
        </h1>
        {query && (
          <p className="text-lg text-gray-600">
            {results.length} results for &quot;{query}&quot;
          </p>
        )}
      </div>

      <AdPlaceholder size="banner" className="mb-8" />

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

      <AdPlaceholder size="banner" className="mt-8" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
