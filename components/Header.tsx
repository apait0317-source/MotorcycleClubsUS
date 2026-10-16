'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SITE_NAME } from '@/lib/utils';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  // Close the More dropdown when clicking outside it.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-amber-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.5 12a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm-11 0a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm11 2a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm-11 0a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM20 7c.55 0 1 .45 1 1v1h-1.5V8H18V6h1c.55 0 1 .45 1 1zM6 6v2H4.5V9H3V8c0-.55.45-1 1-1h1c.55 0 1-.45 1-1zm9.5-2h-7L7 6.5V8h10V6.5L15.5 4z"/>
            </svg>
            <span className="font-bold text-xl text-gray-900">{SITE_NAME}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/states" className="text-gray-600 hover:text-gray-900 font-medium transition">States</Link>
            <Link href="/cities" className="text-gray-600 hover:text-gray-900 font-medium transition">Cities</Link>
            <Link href="/guides" className="text-gray-600 hover:text-gray-900 font-medium transition">Guides</Link>

            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition"
                aria-expanded={isMoreOpen}
              >
                More
                <svg
                  className={`w-4 h-4 ml-1 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isMoreOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link href="/about" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition" onClick={() => setIsMoreOpen(false)}>
                    About Us
                  </Link>
                  <Link href="/contact" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition" onClick={() => setIsMoreOpen(false)}>
                    Contact
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Search + CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="flex items-center" role="search">
              <div className="relative">
                <label htmlFor="header-search" className="sr-only">Search clubs</label>
                <input
                  id="header-search"
                  type="text"
                  placeholder="Search clubs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 lg:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            <Link
              href="/submit"
              className="flex items-center px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Submit a Club
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <form onSubmit={handleSearch} className="mb-4" role="search">
              <div className="relative">
                <label htmlFor="mobile-search" className="sr-only">Search clubs</label>
                <input
                  id="mobile-search"
                  type="text"
                  placeholder="Search clubs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            <nav className="space-y-1">
              <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Browse</p>
              <Link href="/states" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                Browse States
              </Link>
              <Link href="/cities" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                Browse Cities
              </Link>
              <Link href="/guides" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                Rider Guides
              </Link>

              <hr className="my-3 border-gray-200" />

              <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">More</p>
              <Link href="/about" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                About Us
              </Link>
              <Link href="/contact" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>

              <hr className="my-3 border-gray-200" />

              <Link
                href="/submit"
                className="flex items-center justify-center mx-3 mt-4 px-4 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Submit a Club
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
