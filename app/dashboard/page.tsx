import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const [favoritesCount, reviewsCount, claimsCount] = await Promise.all([
    userId ? prisma.favorite.count({ where: { userId } }) : 0,
    userId ? prisma.review.count({ where: { userId } }) : 0,
    userId ? prisma.clubClaim.count({ where: { userId } }) : 0,
  ]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Manage your favorites, reviews, and club listings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/dashboard/favorites"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-amber-300 hover:shadow-md transition"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{favoritesCount}</p>
              <p className="text-gray-500">Favorites</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/reviews"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-amber-300 hover:shadow-md transition"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{reviewsCount}</p>
              <p className="text-gray-500">Reviews</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/claims"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-amber-300 hover:shadow-md transition"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{claimsCount}</p>
              <p className="text-gray-500">Claims</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/submit-club"
          className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl hover:border-amber-400 transition"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Submit a New Club</h3>
              <p className="text-gray-600">Add a motorcycle club to our directory</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/settings"
          className="p-6 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-gray-400 transition"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
              <p className="text-gray-600">Update your profile and preferences</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

