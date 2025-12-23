import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Favorites | Dashboard',
};

export default async function FavoritesPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const favorites = userId
    ? await prisma.favorite.findMany({
        where: { userId },
        include: { club: true },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Favorites</h1>
        <p className="text-gray-600 mt-1">
          Clubs you&apos;ve saved for later
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No favorites yet</h3>
          <p className="text-gray-500 mb-4">
            Browse clubs and click the heart icon to save them here
          </p>
          <Link
            href="/states"
            className="inline-flex items-center px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition"
          >
            Browse Clubs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-amber-300 transition"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.5 12a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm-11 0a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm11 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm-11 0a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/clubs/${favorite.club.slug}`}
                    className="font-semibold text-gray-900 hover:text-amber-600 truncate block"
                  >
                    {favorite.club.name}
                  </Link>
                  <p className="text-sm text-gray-500 truncate">
                    {favorite.club.city}, {favorite.club.state}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {favorite.club.rating > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    {favorite.club.rating.toFixed(1)}
                  </div>
                )}
                <Link
                  href={`/clubs/${favorite.club.slug}`}
                  className="px-3 py-1.5 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
