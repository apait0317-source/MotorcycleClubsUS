'use client';

import { useState, useEffect } from 'react';

interface Claim {
  id: string;
  status: string;
  businessEmail: string | null;
  message: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
  club: {
    name: string;
    city: string;
    state: string;
  };
}

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    fetchClaims();
  }, [filter]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/claims?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setClaims(data);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/admin/claims', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });

      if (res.ok) {
        fetchClaims();
      }
    } catch (error) {
      console.error('Error updating claim:', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Club Claims</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'pending'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Loading...
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No {filter === 'pending' ? 'pending ' : ''}claims found.
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{claim.club.name}</h3>
                  <p className="text-sm text-gray-500">
                    {claim.club.city}, {claim.club.state}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  claim.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : claim.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {claim.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Claimed by:</span>
                  <p className="font-medium">{claim.user.name || 'N/A'}</p>
                  <p className="text-gray-600">{claim.user.email}</p>
                </div>
                <div>
                  <span className="text-gray-500">Business Email:</span>
                  <p className="font-medium">{claim.businessEmail || 'Not provided'}</p>
                </div>
              </div>

              {claim.message && (
                <div className="mb-4">
                  <span className="text-sm text-gray-500">Message:</span>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded mt-1">{claim.message}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Submitted: {new Date(claim.createdAt).toLocaleDateString()}
                </span>
                {claim.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(claim.id, 'approve')}
                      className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(claim.id, 'reject')}
                      className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
