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
    <form onSubmit={handleSearch} role="search" aria-label="Find a motorcycle club">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto] md:items-end">
        <div className="min-w-0">
          <label htmlFor="hero-state" className="mb-2 block text-sm font-semibold uppercase tracking-wider">State</label>
          <select id="hero-state" value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="min-h-12 w-full min-w-0 rounded-sm border border-gray-500 bg-white px-4 py-3 text-base text-asphalt">
            <option value="">All states</option>
            {states.map((state) => <option key={state.code} value={state.code}>{state.name}</option>)}
          </select>
        </div>
        <div className="min-w-0">
          <label htmlFor="hero-query" className="mb-2 block text-sm font-semibold uppercase tracking-wider">City or club name</label>
          <input id="hero-query" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the directory" className="min-h-12 w-full min-w-0 rounded-sm border border-gray-500 bg-white px-4 py-3 text-base text-asphalt placeholder:text-gray-600" />
        </div>
        <button type="submit" className="brand-button w-full md:min-w-44">Find clubs <span aria-hidden="true">→</span></button>
      </div>
    </form>
  );
}
