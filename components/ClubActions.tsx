'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ClubActionsProps {
  placeId: string;
  clubSlug: string;
  clubName: string;
  isVerified?: boolean;
  isClaimed?: boolean;
}

export default function ClubActions({
  placeId,
  clubSlug,
  clubName,
  isVerified = false,
  isClaimed = false,
}: ClubActionsProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dbClubId, setDbClubId] = useState<string | null>(null);

  // Get the database club ID from placeId
  useEffect(() => {
    const fetchClubId = async () => {
      try {
        const res = await fetch(`/api/clubs/${clubSlug}`);
        if (res.ok) {
          const club = await res.json();
          setDbClubId(club.id);
        }
      } catch (error) {
        console.error('Error fetching club:', error);
      }
    };
    fetchClubId();
  }, [clubSlug]);

  // Check if already favorited
  useEffect(() => {
    if (session?.user && dbClubId) {
      checkFavoriteStatus();
    }
  }, [session, dbClubId]);

  const checkFavoriteStatus = async () => {
    try {
      const res = await fetch('/api/favorites');
      if (res.ok) {
        const favorites = await res.json();
        const isFav = favorites.some((f: { clubId: string }) => f.clubId === dbClubId);
        setIsFavorited(isFav);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!dbClubId) return;

    setIsLoading(true);

    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const res = await fetch('/api/favorites', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId: dbClubId }),
      });

      if (res.ok) {
        setIsFavorited(!isFavorited);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Favorite Button */}
      <button
        onClick={handleFavoriteToggle}
        disabled={isLoading || !dbClubId}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
          isFavorited
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } ${isLoading || !dbClubId ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <svg
          className="w-5 h-5"
          fill={isFavorited ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span className="font-medium">
          {isLoading ? 'Saving...' : isFavorited ? 'Saved' : 'Save'}
        </span>
      </button>

      {/* Claim Button */}
      {isVerified || isClaimed ? (
        <div className="flex items-center gap-2 px-4 py-2 text-blue-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          <span className="font-medium">Verified</span>
        </div>
      ) : (
        <Link
          href={`/claim/${clubSlug}`}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z" />
          </svg>
          Claim This Club
        </Link>
      )}
    </div>
  );
}
