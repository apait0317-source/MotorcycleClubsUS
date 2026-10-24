import { Metadata } from 'next';
import Link from 'next/link';
import { AFFILIATE_DISCLOSURE } from '@/lib/affiliates';
import { getSiteStats } from '@/lib/data';
import { guides } from '@/lib/guides';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  alternates: { canonical: '/about' },
  title: 'About Us',
  description: `About ${SITE_NAME}: what the directory lists, where the listings come from, and how the site is funded.`,
};

const check = (
  <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

export default function AboutPage() {
  // Every figure on this page comes from the data files.
  const stats = getSiteStats();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">About {SITE_NAME}</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-gray-600 mb-8">
          {SITE_NAME} is a directory of motorcycle clubs, riding clubs, and veteran MCs. It lists{' '}
          {stats.clubCount.toLocaleString()} clubs in {stats.cityCount.toLocaleString()} cities across{' '}
          {stats.stateCount} states and territories. It helps riders find a club near them and learn how to approach one.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What the directory offers</h2>
        <ul className="space-y-3 text-gray-600 mb-6">
          <li className="flex items-start gap-2">
            {check}
            <span>Club listings with the club type, city, website, and phone number where the club has published them</span>
          </li>
          <li className="flex items-start gap-2">
            {check}
            <span>Google ratings and review counts where a club has them</span>
          </li>
          <li className="flex items-start gap-2">
            {check}
            <span>
              {guides.length} plain-language <Link href="/guides" className="text-amber-700 hover:underline">rider guides</Link> on
              how clubs work, how to join one, and how to behave around clubs and on group rides
            </span>
          </li>
          <li className="flex items-start gap-2">
            {check}
            <span>Search by club name, city, or state, plus a page for each state and for each city with two or more clubs</span>
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Where the listings come from</h2>
        <p className="text-gray-600 mb-4">
          Listings come from club websites, published charter lists, public business listings, and submissions from
          riders and club officers. Chapter listings for the American Motorcyclist Association link to the
          association&apos;s public charter search. Ratings and review counts come from Google.
        </p>
        <p className="text-gray-600 mb-6">
          On state and city pages, clubs with photos in our gallery come first, then clubs with higher Google ratings. No club pays to be
          listed or to move up.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How the site is funded</h2>
        <p className="text-gray-600 mb-6">
          The site is free to use. It earns money from Google AdSense ads and from Amazon Associates links to riding gear.
          Ads and affiliate links do not change which clubs are listed or how they are ordered. {AFFILIATE_DISCLOSURE} The{' '}
          <Link href="/privacy" className="text-amber-700 hover:underline">privacy policy</Link> explains how advertising
          cookies work and how to opt out.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">For club officers</h2>
        <p className="text-gray-600 mb-6">
          If you run a motorcycle club and something on your listing is wrong, use the
          <strong> Suggest a correction</strong> link on the club page. It opens the contact form with the
          club already filled in. We check requests against the club&apos;s own website or social page before
          updating the entry, and we remove listings on request. You can also{' '}
          <Link href="/contact" className="text-amber-700 hover:underline">contact us</Link> with any other question.
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
              href="/submit"
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
