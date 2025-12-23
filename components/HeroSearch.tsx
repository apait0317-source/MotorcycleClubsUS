'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface State {
  code: string;
  name: string;
  clubCount: number;
}

interface HeroSearchProps {
  states: State[];
}

export default function HeroSearch({ states }: HeroSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedState && !query.trim()) {
      // If only state selected, go to state page
      router.push(`/state/${selectedState}`);
    } else if (query.trim()) {
      // If search query entered, go to search with optional state filter
      const searchParams = new URLSearchParams();
      searchParams.set('q', query.trim());
      if (selectedState) {
        searchParams.set('state', selectedState);
      }
      router.push(`/search?${searchParams.toString()}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* State Dropdown */}
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent sm:w-44"
        >
          <option value="" className="text-gray-900">All States</option>
          {states.map((state) => (
            <option key={state.code} value={state.code} className="text-gray-900">
              {state.name}
            </option>
          ))}
        </select>

        {/* Search Input */}
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clubs, cities..."
            className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>
    </form>
  );
}
