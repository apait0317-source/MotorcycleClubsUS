import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: `Disclaimer for ${SITE_NAME}: how listings are compiled, what we do and do not verify, advertising and affiliate relationships, and riding safety.`,
  alternates: { canonical: '/disclaimer' },
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Disclaimer</h1>

      <div className="prose prose-lg max-w-none text-gray-600">
        <p className="text-sm text-gray-500 mb-8">Last updated: October 15, 2026</p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Listings are informational</h2>
        <p>
          {SITE_NAME} is an independent directory. Listings are compiled from public sources, including club websites,
          published charter and chapter lists, public business listings, and submissions from riders and club officers.
          We are not affiliated with, endorsed by, or acting on behalf of any club listed here unless a listing says so.
        </p>
        <p>
          A listing is a record that a club has a public presence. It is not a recommendation, a statement about the
          club&apos;s character, or confirmation that the club is currently accepting members. Clubs merge, relocate,
          and close, and public information lags behind. Confirm details with the club before you travel.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Accuracy and corrections</h2>
        <p>
          We make reasonable efforts to keep listings accurate and we remove listings that are shown to be wrong, but we
          do not independently verify every detail. If you represent a club and want a listing corrected, updated, or
          removed, use the <Link href="/contact" className="text-amber-600 hover:underline">contact page</Link> and we
          will act on it.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Guides are general information</h2>
        <p>
          The rider guides on this site describe common practices in motorcycle club culture. Every club sets its own
          rules, and practices differ by region. Nothing on this site is legal advice. Laws on helmets, group riding,
          lane positioning, charity raffles, and nonprofit organization vary by state. Check your state&apos;s current
          rules or consult a professional.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Riding safety</h2>
        <p>
          Motorcycling carries risk. Guides on group riding, routes, and events are written for licensed riders and do
          not replace formal training. Ride within your skill, wear protective gear, and follow the law. Road and
          seasonal conditions described on this site change without notice.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Advertising and affiliate links</h2>
        <p>
          This site is supported by advertising served through Google AdSense and by affiliate links. As an Amazon
          Associate, we earn from qualifying purchases. Advertisers and affiliate programs do not influence which clubs
          are listed or how guides are written. Affiliate links are labeled. See the{' '}
          <Link href="/privacy" className="text-amber-600 hover:underline">privacy policy</Link> for how advertising
          cookies work and how to opt out.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">External links</h2>
        <p>
          Links to club websites, social media pages, maps, and retailers lead to sites we do not control. We are not
          responsible for their content, policies, or availability.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Trademarks</h2>
        <p>
          Club names, patches, logos, and brand names belong to their owners and appear here only to identify the
          organizations being described.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Questions</h2>
        <p>
          Contact us through the <Link href="/contact" className="text-amber-600 hover:underline">contact page</Link>.
          Our <Link href="/terms" className="text-amber-600 hover:underline">terms of service</Link> also apply.
        </p>
      </div>
    </div>
  );
}
