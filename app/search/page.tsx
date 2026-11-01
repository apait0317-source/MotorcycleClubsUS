import { Suspense } from 'react';
import SearchResults from '@/components/SearchResults';
import { getMotorcycleClubs, getAllStates } from '@/lib/data';
import { toPublicClub } from '@/lib/public-clubs';

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
      <SearchResults clubs={getMotorcycleClubs().map(toPublicClub)} states={getAllStates()} />
    </Suspense>
  );
}
