import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement, isValidElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import HomePage from '@/app/page';
import StatesPage from '@/app/states/page';
import ClubPage from '@/app/clubs/[slug]/page';
import CityPage from '@/app/city/[state]/[city]/page';
import StatePage from '@/app/state/[code]/page';
import ClubCard from '@/components/ClubCard';
import { getAllClubs, getAllStates, getIndexableClubs, getStateSummary, getIndexableStates } from '@/lib/data';
import { toPublicClub } from '@/lib/club-projection';

test('homepage leads with reviewed profiles and labels its basic coverage separately', () => {
  // Inspect the server page's text without mounting HeroSearch's router-dependent client island.
  const text = (node: ReactNode): string => Array.isArray(node) ? node.map(text).join('')
    : isValidElement<{ children?: ReactNode }>(node) ? text(node.props.children)
    : typeof node === 'string' || typeof node === 'number' ? String(node) : '';
  const html = text(HomePage()).replace(/\s+/g, ' ');
  assert.match(html, /Source-reviewed club profiles/);
  assert.match(html, new RegExp(`${getIndexableClubs().length} source-reviewed profiles`));
  assert.doesNotMatch(html, /Top Rated Clubs|Highest Google ratings|photos first/);
});

test('excluded records no longer present false club locations or organization schema', async () => {
  const html = renderToStaticMarkup(await ClubPage({ params: Promise.resolve({ slug: '69-motorcycle-club-dover-de' }) }));
  assert.match(html, /Listing unavailable/);
  assert.doesNotMatch(html, /Dover, Delaware|United Kingdom|PostalAddress|amazon\.com/);
});

test('cards show approved club information for a useful comparison', () => {
  const club = getIndexableClubs().find((club) => club.editorial?.changes.description)!;
  const html = renderToStaticMarkup(createElement(ClubCard, { club: toPublicClub(club) }));
  assert.match(html, /Source-reviewed summary/);
  assert.ok(html.includes(club.description.slice(0, 45)));
});

test('basic profiles and sparse city pages carry no affiliate shopping block', async () => {
  const clubHtml = renderToStaticMarkup(await ClubPage({ params: Promise.resolve({ slug: '69-motorcycle-club-dover-de' }) }));
  const cityHtml = renderToStaticMarkup(await CityPage({ params: Promise.resolve({ state: 'ak', city: 'anchorage' }) }));
  for (const html of [clubHtml, cityHtml]) assert.doesNotMatch(html, /amazon\.com|As an Amazon Associate/);
});

test('states without a full comparison remain discoverable as limited coverage', async () => {
  const html = renderToStaticMarkup(await StatesPage());
  const promoted = new Set(getIndexableStates().map((state) => state.code));
  const basic = getAllStates().filter((state) => !promoted.has(state.code) && getStateSummary(state.code).clubCount > 0);
  assert.ok(basic.length > 0);
  assert.match(html, /More states with basic listings/);
  for (const state of basic) assert.ok(html.includes(`/state/${state.code}`), state.name);
});

test('basic state entries preserve recorded phone and address access', async () => {
  const html = renderToStaticMarkup(await StatePage({ params: Promise.resolve({ code: 'al' }) }));
  assert.ok(html.includes('href="tel:+1 256-536-1426"'));
  assert.match(html, /Recorded contact details/);
  assert.match(html, /Address on file/);
});

test('a reviewed profile needs published visiting details and a contact route to render a fixed ad', async () => {
  const { load } = await import('cheerio');
  const keys = ['NEXT_PUBLIC_ADSENSE_ID', 'NEXT_PUBLIC_AD_SLOT_INLINE', 'NEXT_PUBLIC_AD_SLOT_SIDEBAR'] as const;
  const previous = keys.map(key => process.env[key]);
  try {
    for (const key of keys) process.env[key] = '1234567890';
    for (const [slug, eligible] of [
      ['aztalan-cycle-club-janesville-wi', true],
      ['raw-iron-brotherhood-mc-milwaukee-wi', false],
      ['iron-order-mc-asheville-asheville-nc', false],
    ] as const) {
      const $ = load(renderToStaticMarkup(await ClubPage({ params: Promise.resolve({ slug }) })));
      assert.equal($('section[data-visitor-details="published"]').length, Number(eligible), slug);
      assert.equal($('script[src*="/pagead/js/adsbygoogle.js"]').length, Number(eligible), slug);
      assert.equal($('ins.adsbygoogle').length, Number(eligible), slug);
      assert.equal($('a[rel~="sponsored"]').length, 0, slug);
    }
  } finally {
    keys.forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key];
      else process.env[key] = previous[index];
    });
  }
});
