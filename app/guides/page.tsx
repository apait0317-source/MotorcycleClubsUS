import { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import SchemaMarkup from '@/components/SchemaMarkup';
import AdSenseLoader from '@/components/AdSenseLoader';
import { guides } from '@/lib/guides';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Rider Guides: Joining a Club, Club Types, and Etiquette',
  description: `Plain-language guides from ${SITE_NAME} on how motorcycle clubs work, how to join one, and how to behave around clubs and on group rides.`,
  alternates: { canonical: '/guides' },
};

export default function GuidesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdSenseLoader />
      <Breadcrumbs items={[{ label: 'Guides' }]} />
      <SchemaMarkup type="breadcrumb" items={[{ name: 'Home', url: '/' }, { name: 'Guides', url: '/guides' }]} />

      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Rider Guides</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-3xl">
        {guides.length} original guides on how motorcycle clubs work, written for riders who are looking for one.
        Read them before you contact a club from the directory.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="block bg-white rounded-xl border border-gray-200 p-6 hover:border-amber-300 hover:shadow-md transition"
          >
            <span className="text-xs uppercase tracking-wider text-amber-600 font-semibold">{guide.readingMinutes} min read</span>
            <h2 className="text-xl font-bold text-gray-900 mt-2 mb-2">{guide.shortTitle}</h2>
            <p className="text-gray-600 text-sm">{guide.description}</p>
          </Link>
        ))}
      </div>

      <section className="mt-12 bg-gray-50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to find a club?</h2>
        <p className="text-gray-600 mb-4">Browse clubs by state, then narrow to your city.</p>
        <Link href="/states" className="inline-flex px-5 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition">
          Browse by State
        </Link>
      </section>
    </div>
  );
}
