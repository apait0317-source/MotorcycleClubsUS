'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Club {
  id: string;
  name: string;
  city: string;
  state: string;
  slug: string;
  isVerified: boolean;
  claimedById: string | null;
}

export default function ClaimClubPage({ params }: { params: { slug: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClub();
  }, [params.slug]);

  const fetchClub = async () => {
    try {
      const res = await fetch(`/api/clubs/${params.slug}`);
      if (res.ok) {
        const data = await res.json();
        setClub(data);
      } else {
        setError('Club not found');
      }
    } catch (err) {
      setError('Failed to load club');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session?.user || !club) {
      router.push(`/login?callbackUrl=/claim/${params.slug}`);
      return;
    }

    setFormStatus('loading');
    setError('');

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clubId: club.id,
          businessEmail: formData.get('businessEmail'),
          message: formData.get('message'),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit claim');
      }

      setFormStatus('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setFormStatus('error');
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Club Not Found</h1>
        <p className="text-gray-600 mb-6">The club you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/states"
          className="inline-flex items-center px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition"
        >
          Browse Clubs
        </Link>
      </div>
    );
  }

  if (club.claimedById) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Claimed</h1>
        <p className="text-gray-600 mb-6">
          {club.name} has already been claimed by another user.
        </p>
        <Link
          href={`/clubs/${club.slug}`}
          className="inline-flex items-center px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition"
        >
          View Club
        </Link>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Claim {club.name}</h1>
        <p className="text-gray-600 mb-6">Sign in to claim this club listing</p>
        <Link
          href={`/login?callbackUrl=/claim/${params.slug}`}
          className="inline-flex items-center px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition"
        >
          Sign In to Continue
        </Link>
      </div>
    );
  }

  if (formStatus === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Claim Submitted!</h1>
        <p className="text-gray-600 mb-6">
          We&apos;ll review your claim for {club.name} and get back to you within 2-3 business days.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard/claims"
            className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition"
          >
            View My Claims
          </Link>
          <Link
            href={`/clubs/${club.slug}`}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            Back to Club
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Claim {club.name}</h1>
      <p className="text-gray-600 mb-8">
        Verify that you own or manage this club to update its information and respond to reviews.
      </p>

      {/* Club Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-8">
        <h2 className="font-semibold text-gray-900">{club.name}</h2>
        <p className="text-gray-600">{club.city}, {club.state}</p>
      </div>

      {formStatus === 'error' && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Email */}
        <div>
          <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Business Email
          </label>
          <input
            id="businessEmail"
            name="businessEmail"
            type="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="contact@yourclub.com"
          />
          <p className="mt-1 text-sm text-gray-500">
            Preferably an email associated with the club
          </p>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Information
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Tell us about your role in the club and how you can verify ownership..."
          />
        </div>

        {/* Terms */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            By submitting this claim, you confirm that you have the authority to represent this club and that the information provided is accurate.
          </p>
        </div>

        <button
          type="submit"
          disabled={formStatus === 'loading'}
          className="w-full py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition disabled:opacity-50"
        >
          {formStatus === 'loading' ? 'Submitting...' : 'Submit Claim'}
        </button>
      </form>
    </div>
  );
}
