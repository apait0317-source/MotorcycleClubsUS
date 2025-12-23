import Link from 'next/link';
import { prisma } from '@/lib/db';

export default async function AdminDashboard() {
  const [
    pendingSubmissions,
    pendingClaims,
    pendingReviews,
    totalClubs,
    featuredClubs,
    totalUsers,
    totalMessages,
    totalNotifications,
  ] = await Promise.all([
    prisma.club.count({ where: { status: 'pending' } }),
    prisma.clubClaim.count({ where: { status: 'pending' } }),
    prisma.review.count({ where: { status: 'pending' } }),
    prisma.club.count(),
    prisma.club.count({ where: { isFeatured: true } }),
    prisma.user.count(),
    prisma.message.count(),
    prisma.notification.count(),
  ]);

  const stats = [
    {
      label: 'Pending Submissions',
      value: pendingSubmissions,
      href: '/admin/submissions',
      color: 'bg-amber-500',
      icon: '📝',
    },
    {
      label: 'Pending Claims',
      value: pendingClaims,
      href: '/admin/claims',
      color: 'bg-blue-500',
      icon: '🏳️',
    },
    {
      label: 'Pending Reviews',
      value: pendingReviews,
      href: '/admin/reviews',
      color: 'bg-purple-500',
      icon: '⭐',
    },
    {
      label: 'Total Users',
      value: totalUsers,
      href: '/admin/users',
      color: 'bg-green-500',
      icon: '👥',
    },
    {
      label: 'Total Listings',
      value: totalClubs,
      href: '/admin/listings',
      color: 'bg-indigo-500',
      icon: '📍',
    },
    {
      label: 'Featured Listings',
      value: featuredClubs,
      href: '/admin/listings?featured=true',
      color: 'bg-yellow-500',
      icon: '⭐',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Queue</h2>
          <div className="space-y-3">
            <Link
              href="/admin/submissions"
              className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition"
            >
              <span className="font-medium text-amber-800">Pending Submissions</span>
              <span className="px-3 py-1 bg-amber-500 text-white text-sm font-bold rounded-full">
                {pendingSubmissions}
              </span>
            </Link>
            <Link
              href="/admin/claims"
              className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              <span className="font-medium text-blue-800">Pending Claims</span>
              <span className="px-3 py-1 bg-blue-500 text-white text-sm font-bold rounded-full">
                {pendingClaims}
              </span>
            </Link>
            <Link
              href="/admin/reviews"
              className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
            >
              <span className="font-medium text-purple-800">Pending Reviews</span>
              <span className="px-3 py-1 bg-purple-500 text-white text-sm font-bold rounded-full">
                {pendingReviews}
              </span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/users"
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <span className="text-2xl mb-2">👥</span>
              <span className="text-sm font-medium text-gray-700">Manage Users</span>
            </Link>
            <Link
              href="/admin/listings"
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <span className="text-2xl mb-2">📍</span>
              <span className="text-sm font-medium text-gray-700">Manage Listings</span>
            </Link>
            <Link
              href="/admin/messages"
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <span className="text-2xl mb-2">✉️</span>
              <span className="text-sm font-medium text-gray-700">Send Messages</span>
              <span className="text-xs text-gray-500">{totalMessages} sent</span>
            </Link>
            <Link
              href="/admin/notifications"
              className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <span className="text-2xl mb-2">🔔</span>
              <span className="text-sm font-medium text-gray-700">Notifications</span>
              <span className="text-xs text-gray-500">{totalNotifications} sent</span>
            </Link>
            <Link
              href="/admin/listings/new"
              className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition col-span-2"
            >
              <span className="text-2xl mb-2">➕</span>
              <span className="text-sm font-medium text-green-700">Add New Listing</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
