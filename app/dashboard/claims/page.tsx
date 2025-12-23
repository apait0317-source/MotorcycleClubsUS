import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Club Claims | Dashboard',
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const labels: Record<string, string> = {
    approved: 'Approved',
    pending: 'Under Review',
    rejected: 'Rejected',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  );
}

export default async function ClaimsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const claims = userId
    ? await prisma.clubClaim.findMany({
        where: { userId },
        include: { club: true },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Club Claims</h1>
        <p className="text-gray-600 mt-1">
          Track the status of your club ownership claims
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900 mb-1">How Club Claims Work</h3>
        <p className="text-sm text-blue-700">
          If you own or manage a motorcycle club listed in our directory, you can claim it to update the information and respond to reviews. Claims are reviewed within 2-3 business days.
        </p>
      </div>

      {claims.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No claims yet</h3>
          <p className="text-gray-500 mb-4">
            Own a motorcycle club? Search for it and submit a claim.
          </p>
          <Link
            href="/states"
            className="inline-flex items-center px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition"
          >
            Find Your Club
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <Link
                    href={`/clubs/${claim.club.slug}`}
                    className="font-semibold text-gray-900 hover:text-amber-600"
                  >
                    {claim.club.name}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {claim.club.city}, {claim.club.state}
                  </p>
                </div>
                <StatusBadge status={claim.status} />
              </div>

              <div className="text-sm text-gray-500 mb-2">
                Submitted on {new Date(claim.createdAt).toLocaleDateString()}
              </div>

              {claim.message && (
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {claim.message}
                </p>
              )}

              {claim.status === 'approved' && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <Link
                    href={`/dashboard/manage/${claim.club.slug}`}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Manage Club Listing →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
