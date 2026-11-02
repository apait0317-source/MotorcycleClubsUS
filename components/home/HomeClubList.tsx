import Link from 'next/link';
import type { PublicClub } from '@/lib/public-clubs';
import { capitalizeCity } from '@/lib/utils';

export default function HomeClubList({ clubs }: { clubs: PublicClub[] }) {
  return (
    <ul className="divide-y divide-gray-300 border-y border-gray-300">
      {clubs.map((club) => (
        <li key={club.place_id} className="grid gap-3 py-6 md:grid-cols-[1fr_1.3fr_auto] md:items-start md:gap-8">
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
  );
}
