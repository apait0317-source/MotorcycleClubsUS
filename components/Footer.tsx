import Link from 'next/link';
import { SITE_NAME } from '@/lib/utils';
import { guides } from '@/lib/guides';
import { CHAPTER_ORGS } from '@/lib/chapter-orgs';

const topStates = [
  { code: 'ca', name: 'California' },
  { code: 'tx', name: 'Texas' },
  { code: 'fl', name: 'Florida' },
  { code: 'ny', name: 'New York' },
  { code: 'oh', name: 'Ohio' },
  { code: 'pa', name: 'Pennsylvania' },
  { code: 'il', name: 'Illinois' },
  { code: 'mi', name: 'Michigan' },
];

export default function Footer() {
  return (
    <footer className="bg-asphalt text-white [&_a]:max-w-full [&_a]:[overflow-wrap:anywhere]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 max-w-lg md:col-span-4">
            <Link href="/" className="flex min-w-0 items-center gap-3 mb-4">
              <span className="h-2.5 w-6 shrink-0 bg-brand" aria-hidden="true" />
              <span className="wordmark min-w-0 break-words">{SITE_NAME}</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              A directory of motorcycle clubs, riding clubs, and veteran MCs across the United States.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">Browse</h3>
            <ul className="space-y-1">
              <li><Link href="/states" className="text-gray-300 hover:text-white transition text-sm inline-flex min-h-11 items-center">All States</Link></li>
              <li><Link href="/cities" className="text-gray-300 hover:text-white transition text-sm inline-flex min-h-11 items-center">All Cities</Link></li>
              <li><Link href="/chapters" className="text-gray-300 hover:text-white transition text-sm inline-flex min-h-11 items-center">Chapter Directories</Link></li>
              <li><Link href="/guides" className="text-gray-300 hover:text-white transition text-sm inline-flex min-h-11 items-center">Rider Guides</Link></li>
              {CHAPTER_ORGS.filter((org) => org.index).map((org) => (
                <li key={org.slug}>
                  <Link href={`/chapters/${org.slug}`} className="text-gray-300 hover:text-white transition text-sm inline-flex min-h-11 items-center">
                    {org.short} Chapters
                  </Link>
                </li>
              ))}
              <li><Link href="/submit" className="text-gray-300 hover:text-white transition text-sm inline-flex min-h-11 items-center">Submit a Club</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">Browse States</h3>
            <ul className="space-y-1">
              {topStates.map((state) => (
                <li key={state.code}>
                  <Link href={`/state/${state.code}`} className="text-gray-300 hover:text-white transition text-sm inline-flex min-h-11 items-center">
                    {state.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">Guides</h3>
            <ul className="space-y-1">
              {guides.slice(0, 6).map((guide) => (
                <li key={guide.slug}>
                  <Link href={`/guides/${guide.slug}`} className="text-gray-300 hover:text-white transition text-sm inline-flex min-h-11 items-center">
                    {guide.shortTitle}
                  </Link>
                </li>
              ))}
              <li><Link href="/guides" className="text-orange-300 hover:text-orange-200 transition text-sm inline-flex min-h-11 items-center">All guides</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">Company</h3>
            <ul className="space-y-1">
              <li><Link href="/about" className="text-gray-300 hover:text-white transition text-sm inline-flex min-h-11 items-center">About</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white transition text-sm inline-flex min-h-11 items-center">Contact</Link></li>
              <li><Link href="/privacy" className="text-gray-300 hover:text-white transition text-sm inline-flex min-h-11 items-center">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-300 hover:text-white transition text-sm inline-flex min-h-11 items-center">Terms of Service</Link></li>
              <li><Link href="/disclaimer" className="text-gray-300 hover:text-white transition text-sm inline-flex min-h-11 items-center">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Listings are compiled from public sources and club submissions. Contact us to correct or remove a listing.
          </p>
        </div>
      </div>
    </footer>
  );
}
