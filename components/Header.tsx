'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SITE_NAME } from '@/lib/utils';

const links = [
  { href: '/states', label: 'States' },
  { href: '/cities', label: 'Cities' },
  { href: '/guides', label: 'Rider guides' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setIsMenuOpen(false);
  }

  return (
    <header className="relative z-50 border-b border-white/15 bg-asphalt text-white" onKeyDown={(event) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        menuButton.current?.focus();
      }
    }}>
      <div className="site-container">
        <div className="flex min-h-20 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-4">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="wordmark flex min-h-11 min-w-0 max-w-full items-center gap-3">
            <span className="min-w-0 break-words">{SITE_NAME}</span><span className="hidden h-2.5 w-7 bg-brand sm:block" aria-hidden="true" />
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-5 xl:flex">
            <Link href="/search" className="inline-flex min-h-11 items-center text-sm font-medium hover:text-orange-300">Find a club</Link>
            {links.map((link) => <Link key={link.href} href={link.href} className="inline-flex min-h-11 items-center text-sm font-medium text-gray-200 hover:text-orange-300">{link.label}</Link>)}
            <Link href="/submit" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-orange-300">Submit a club <span aria-hidden="true">↗</span></Link>
          </nav>
          <button ref={menuButton} type="button" aria-expanded={isMenuOpen} aria-controls="site-menu" onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex min-h-11 items-center gap-2 border border-gray-500 px-3 text-sm font-semibold xl:hidden">
            {isMenuOpen ? 'Close' : 'Menu'} <span aria-hidden="true">{isMenuOpen ? '×' : '☰'}</span>
          </button>
        </div>
        <div id="site-menu" hidden={!isMenuOpen} className="border-t border-gray-600 pb-5 xl:hidden">
          <nav aria-label="Mobile navigation" className="grid grid-cols-2 gap-x-4 py-4">
            {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="flex min-h-12 items-center text-base text-gray-200 hover:text-white">{link.label}</Link>)}
            <Link href="/submit" onClick={() => setIsMenuOpen(false)} className="flex min-h-12 items-center font-semibold text-orange-300">Submit a club ↗</Link>
          </nav>
          <form onSubmit={handleSearch} role="search">
            <label htmlFor="header-search" className="mb-2 block text-sm">Search clubs</label>
            <div className="flex gap-2">
              <input id="header-search" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="min-h-12 min-w-0 flex-1 rounded-sm bg-white px-3 text-base text-asphalt" placeholder="City or club name" />
              <button type="submit" className="brand-button px-4">Search</button>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}
