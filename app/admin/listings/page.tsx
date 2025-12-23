'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Club {
  id: string;
  placeId: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  stateName: string;
  status: string;
  isVerified: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  claimedBy: {
    name: string | null;
    email: string;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function ListingsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchClubs();
  }, [statusFilter, featuredFilter]);

  const fetchClubs = async (page = 1, searchQuery = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (featuredFilter) params.append('featured', 'true');

      const res = await fetch(`/api/admin/listings?${params}`);
      if (res.ok) {
        const data = await res.json();
        setClubs(data.clubs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClubs(1, search);
  };

  const handleToggleFeatured = async (club: Club) => {
    try {
      const res = await fetch(`/api/admin/listings/${club.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !club.isFeatured }),
      });

      if (res.ok) {
        setClubs(clubs.map(c =>
          c.id === club.id ? { ...c, isFeatured: !c.isFeatured } : c
        ));
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedClub) return;

    try {
      const res = await fetch(`/api/admin/listings/${selectedClub.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setClubs(clubs.filter(c => c.id !== selectedClub.id));
        setShowDeleteModal(false);
        setSelectedClub(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete listing');
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Listings Management</h1>
        <Link
          href="/admin/listings/new"
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
        >
          + Add Listing
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search listings..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Search
            </button>
          </form>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.checked)}
              className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Featured only</span>
          </label>

          {pagination && (
            <span className="text-sm text-gray-500 ml-auto">
              {pagination.total} listings found
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Loading...
        </div>
      ) : clubs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No listings found.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Listing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clubs.map((club) => (
                  <tr key={club.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {club.isFeatured && (
                          <span className="text-yellow-500" title="Featured">⭐</span>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {club.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {club.city}, {club.state}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(club.status)}`}>
                          {club.status}
                        </span>
                        {club.isVerified && (
                          <span className="text-blue-500" title="Verified">✓</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {club.rating > 0 ? (
                        <span>⭐ {club.rating.toFixed(1)} ({club.reviewCount})</span>
                      ) : (
                        <span className="text-gray-400">No ratings</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {club.claimedBy ? (
                        <span>{club.claimedBy.name || club.claimedBy.email}</span>
                      ) : (
                        <span className="text-gray-400">Unclaimed</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleToggleFeatured(club)}
                        className={`mr-2 ${club.isFeatured ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600`}
                        title={club.isFeatured ? 'Remove from featured' : 'Add to featured'}
                      >
                        ⭐
                      </button>
                      <Link
                        href={`/clubs/${club.slug}`}
                        className="text-gray-600 hover:text-gray-900 mr-2"
                        title="View"
                        target="_blank"
                      >
                        👁️
                      </Link>
                      <Link
                        href={`/admin/listings/${club.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                        title="Edit"
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedClub(club);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: Math.min(pagination.pages, 10) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchClubs(page)}
                  className={`px-3 py-1 rounded ${
                    pagination.page === page
                      ? 'bg-purple-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              {pagination.pages > 10 && (
                <span className="px-3 py-1 text-gray-500">...</span>
              )}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedClub && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Listing?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{selectedClub.name}&quot;?
              This action cannot be undone and will remove all associated reviews and favorites.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedClub(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
