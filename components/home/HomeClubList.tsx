'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import type { PublicClub } from '@/lib/public-clubs';
import { capitalizeCity } from '@/lib/utils';

export default function HomeClubList({ clubs }: { clubs: PublicClub[] }) {
  const [start, setStart] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const listId = useId();
  const canRotate = clubs.length > 3;
  const move = (direction: number) => {
    setStart((current) => (current + direction + clubs.length) % clubs.length);
  };

  useEffect(() => {
    if (!canRotate || paused || hovered || focused) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer: ReturnType<typeof setInterval> | undefined;
    const updateTimer = () => {
      clearInterval(timer);
      timer = undefined;
      if (!preference.matches && !document.hidden) {
        timer = setInterval(() => {
          setStart((current) => (current + 1) % clubs.length);
        }, 7000);
      }
    };
    updateTimer();
    preference.addEventListener('change', updateTimer);
    document.addEventListener('visibilitychange', updateTimer);
    return () => {
      clearInterval(timer);
      preference.removeEventListener('change', updateTimer);
      document.removeEventListener('visibilitychange', updateTimer);
    };
  }, [canRotate, clubs.length, paused, hovered, focused, start]);

  const visible = Array.from({ length: Math.min(3, clubs.length) }, (_, index) => clubs[(start + index) % clubs.length]);

  return (
    <div
      role="region"
      aria-label="Featured club profiles"
      aria-roledescription={canRotate ? 'carousel' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
    >
    {canRotate && (
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">Discover {clubs.length} source-reviewed clubs</p>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Previous club" aria-controls={listId} onClick={() => move(-1)} className="min-h-11 min-w-11 rounded border border-gray-300 px-3 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2">←</button>
          <button type="button" aria-label={paused ? 'Resume club rotation' : 'Pause club rotation'} aria-pressed={paused} aria-controls={listId} onClick={() => setPaused((current) => !current)} className="min-h-11 rounded border border-gray-300 px-4 text-sm font-semibold hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2">{paused ? 'Resume' : 'Pause'}</button>
          <button type="button" aria-label="Next club" aria-controls={listId} onClick={() => move(1)} className="min-h-11 min-w-11 rounded border border-gray-300 px-3 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2">→</button>
        </div>
      </div>
    )}
    <ul id={listId} className="divide-y divide-gray-300 border-y border-gray-300">
      {visible.map((club) => (
        <li key={club.slug} className="home-club-row grid gap-3 py-6 md:grid-cols-[1fr_1.3fr_auto] md:items-start md:gap-8">
          <div className="min-w-0">
            <h3 className="text-lg font-bold leading-snug break-words"><Link className="hover:underline underline-offset-4" href={club.directoryHref || `/clubs/${club.slug}`}>{club.name}</Link></h3>
            <p className="mt-1 text-base text-gray-600">{capitalizeCity(club.City)}, {club.stateName}</p>
          </div>
          <div className="min-w-0">
            {club.summary && <p className="line-clamp-3 text-base leading-relaxed text-gray-700">{club.summary}</p>}
            <p className="mt-2 text-sm text-gray-600">Source-reviewed summary</p>
          </div>
          <Link href={club.directoryHref || `/clubs/${club.slug}`} className="home-link self-start whitespace-nowrap" aria-label={`View ${club.name} profile`}>View club <span aria-hidden="true">→</span></Link>
        </li>
      ))}
    </ul>
    </div>
  );
}
