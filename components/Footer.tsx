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
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <svg className="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.5 12a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm-11 0a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm11 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm-11 0a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM20 7c.55 0 1 .45 1 1v1h-1.5V8H18V6h1c.55 0 1 .45 1 1zM6 6v2H4.5V9H3V8c0-.55.45-1 1-1h1c.55 0 1-.45 1-1zm9.5-2h-7L7 6.5V8h10V6.5L15.5 4z"/>
              </svg>
              <span className="font-bold text-xl">{SITE_NAME}</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              A directory of motorcycle clubs, riding clubs, and veteran MCs across the United States.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">Browse</h3>
            <ul className="space-y-2">
              <li><Link href="/states" className="text-gray-300 hover:text-white transition text-sm">All States</Link></li>
              <li><Link href="/cities" className="text-gray-300 hover:text-white transition text-sm">All Cities</Link></li>
              <li><Link href="/guides" className="text-gray-300 hover:text-white transition text-sm">Rider Guides</Link></li>
              {CHAPTER_ORGS.filter((org) => org.index).map((org) => (
                <li key={org.slug}>
                  <Link href={`/chapters/${org.slug}`} className="text-gray-300 hover:text-white transition text-sm">
                    {org.short} Chapters
                  </Link>
                </li>
              ))}
              <li><Link href="/submit" className="text-gray-300 hover:text-white transition text-sm">Submit a Club</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">Top States</h3>
            <ul className="space-y-2">
              {topStates.map((state) => (
                <li key={state.code}>
                  <Link href={`/state/${state.code}`} className="text-gray-300 hover:text-white transition text-sm">
                    {state.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">Guides</h3>
            <ul className="space-y-2">
              {guides.slice(0, 6).map((guide) => (
                <li key={guide.slug}>
                  <Link href={`/guides/${guide.slug}`} className="text-gray-300 hover:text-white transition text-sm">
                    {guide.shortTitle}
                  </Link>
                </li>
              ))}
              <li><Link href="/guides" className="text-amber-400 hover:text-amber-300 transition text-sm">All guides</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-300 hover:text-white transition text-sm">About</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white transition text-sm">Contact</Link></li>
              <li><Link href="/privacy" className="text-gray-300 hover:text-white transition text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-300 hover:text-white transition text-sm">Terms of Service</Link></li>
              <li><Link href="/disclaimer" className="text-gray-300 hover:text-white transition text-sm">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Listings are compiled from public sources and club submissions. Contact us to correct or remove a listing.
          </p>
        </div>
      </div>
    </footer>
  );
}
