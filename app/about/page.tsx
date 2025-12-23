import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About Us',
  description: `Learn more about ${SITE_NAME} - the largest directory of motorcycle clubs in the United States.`,
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">About {SITE_NAME}</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-gray-600 mb-8">
          We are the most comprehensive directory of motorcycle clubs across the United States,
          connecting riders with clubs in their area and helping build the motorcycle community.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Mission</h2>
        <p className="text-gray-600 mb-6">
          Our mission is to make it easy for motorcycle enthusiasts to discover and connect with
          clubs in their area. Whether you&apos;re a seasoned rider looking for a new chapter or
          someone just getting into the motorcycle lifestyle, we&apos;re here to help you find your community.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What We Offer</h2>
        <ul className="space-y-3 text-gray-600 mb-6">
          <li className="flex items-start gap-2">
            <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            <span>Comprehensive listings of motorcycle clubs across all 50 states</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            <span>Detailed club information including contact details and locations</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            <span>User reviews and ratings to help you find the right club</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            <span>Easy search and filtering by location, type, and more</span>
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">For Club Owners</h2>
        <p className="text-gray-600 mb-6">
          If you run a motorcycle club and want to claim or update your listing, you can
          create an account and submit a claim request. We verify all claims to ensure
          accurate information for our users.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to get started?</h3>
          <p className="text-gray-600 mb-4">
            Browse our directory or submit your club to be listed.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/states"
              className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition"
            >
              Browse Clubs
            </Link>
            <Link
              href="/submit-club"
              className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
            >
              Submit a Club
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
