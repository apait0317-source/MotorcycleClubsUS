'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Club {
  id: string;
  placeId: string;
  slug: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  state: string;
  stateName: string;
  phone: string | null;
  website: string | null;
  mainCategory: string | null;
  categories: string | null;
  closedOn: string | null;
  featuredImage: string | null;
  googleMapsLink: string | null;
  status: string;
  isVerified: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  claimedBy: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  submittedBy: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  _count: {
    userReviews: number;
    favorites: number;
    claims: number;
  };
}

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    stateName: '',
    phone: '',
    website: '',
    mainCategory: '',
    categories: '',
    closedOn: '',
    featuredImage: '',
    googleMapsLink: '',
    status: 'active',
    isVerified: false,
    isFeatured: false,
  });

  useEffect(() => {
    fetchClub();
  }, [id]);

  const fetchClub = async () => {
    try {
      const res = await fetch(`/api/admin/listings/${id}`);
      if (res.ok) {
        const data = await res.json();
        setClub(data);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          stateName: data.stateName || '',
          phone: data.phone || '',
          website: data.website || '',
          mainCategory: data.mainCategory || '',
          categories: data.categories || '',
          closedOn: data.closedOn || '',
          featuredImage: data.featuredImage || '',
          googleMapsLink: data.googleMapsLink || '',
          status: data.status || 'active',
          isVerified: data.isVerified || false,
          isFeatured: data.isFeatured || false,
        });
      } else {
        alert('Failed to load club');
        router.push('/admin/listings');
      }
    } catch (error) {
      console.error('Error fetching club:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Listing updated successfully');
        router.push('/admin/listings');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update listing');
      }
    } catch (error) {
      console.error('Error updating club:', error);
      alert('Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!club) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        Club not found
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/admin/listings"
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
          >
            ← Back to Listings
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
        </div>
        <Link
          href={`/clubs/${club.slug}`}
          target="_blank"
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          View Live →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Club Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State Code *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                  required
                  maxLength={2}
                  placeholder="e.g., CA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State Name *
                </label>
                <input
                  type="text"
                  value={formData.stateName}
                  onChange={(e) => setFormData({ ...formData, stateName: e.target.value })}
                  required
                  placeholder="e.g., California"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Category
                </label>
                <input
                  type="text"
                  value={formData.mainCategory}
                  onChange={(e) => setFormData({ ...formData, mainCategory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categories (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.categories}
                  onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                  placeholder="e.g., Harley Davidson, Cruisers"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hours/Closed On
                </label>
                <input
                  type="text"
                  value={formData.closedOn}
                  onChange={(e) => setFormData({ ...formData, closedOn: e.target.value })}
                  placeholder="e.g., Closed on Mondays"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Maps Link
                </label>
                <input
                  type="url"
                  value={formData.googleMapsLink}
                  onChange={(e) => setFormData({ ...formData, googleMapsLink: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="md:col-span-2 flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVerified}
                    onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                    className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Verified</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Link
                href="/admin/listings"
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Rating</span>
                <span className="font-medium">
                  {club.rating > 0 ? `⭐ ${club.rating.toFixed(1)}` : 'No ratings'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reviews</span>
                <span className="font-medium">{club._count.userReviews}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Favorites</span>
                <span className="font-medium">{club._count.favorites}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Claims</span>
                <span className="font-medium">{club._count.claims}</span>
              </div>
            </div>
          </div>

          {/* Owner Info */}
          {club.claimedBy && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Claimed By</h3>
              <p className="text-gray-700">{club.claimedBy.name || 'No name'}</p>
              <p className="text-gray-500 text-sm">{club.claimedBy.email}</p>
            </div>
          )}

          {/* Submitted By */}
          {club.submittedBy && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Submitted By</h3>
              <p className="text-gray-700">{club.submittedBy.name || 'No name'}</p>
              <p className="text-gray-500 text-sm">{club.submittedBy.email}</p>
            </div>
          )}

          {/* IDs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Identifiers</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">ID:</span>
                <span className="ml-2 text-gray-700 font-mono">{club.id}</span>
              </div>
              <div>
                <span className="text-gray-500">Place ID:</span>
                <span className="ml-2 text-gray-700 font-mono text-xs break-all">{club.placeId}</span>
              </div>
              <div>
                <span className="text-gray-500">Slug:</span>
                <span className="ml-2 text-gray-700 font-mono">{club.slug}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
