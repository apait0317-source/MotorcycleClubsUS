import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import ClubPage, { generateMetadata } from '@/app/clubs/[slug]/page';
import StatePage from '@/app/state/[code]/page';
import CityPage from '@/app/city/[state]/[city]/page';
import { clubAliases, getAllClubs } from '@/lib/data';
import { getMarketClubs } from '@/lib/markets';
import sitemap from '@/app/sitemap';
import config from '@/next.config';

test('all historical aliases have matching canonical metadata and permanent configured redirects', async () => {
  const redirects = await config.redirects!();
  const sitemapUrls = new Set(sitemap().map(page => page.url));
  for (const alias of clubAliases) {
    const params = Promise.resolve({ slug: alias.aliasSlug });
    assert.equal((await generateMetadata({ params })).alternates?.canonical, `/clubs/${alias.canonicalSlug}`);
    await assert.rejects(() => ClubPage({ params }), (error: unknown) => {
      const digest = (error as { digest?: string }).digest ?? '';
      return digest.includes(`/clubs/${alias.canonicalSlug}`) && digest.includes('308');
    });
    assert.ok(redirects.some(rule => rule.source === `/clubs/${alias.aliasSlug}` && rule.destination === `/clubs/${alias.canonicalSlug}` && rule.permanent));
    assert.equal(sitemapUrls.has(`https://www.usmotorcycleclubs.com/clubs/${alias.aliasSlug}`), false);
    assert.ok(getAllClubs().some(club => club.slug === alias.aliasSlug));
  }
});

test('pilot hubs expose only canonical reviewed comparisons while sparse and nonpilot views retain their gates', async () => {
  const ca = renderToStaticMarkup(await StatePage({ params: Promise.resolve({ code: 'ca' }) }));
  const campbell = renderToStaticMarkup(await CityPage({ params: Promise.resolve({ state: 'ca', city: 'campbell' }) }));
  const petaluma = renderToStaticMarkup(await CityPage({ params: Promise.resolve({ state: 'ca', city: 'petaluma' }) }));
  const sparse = renderToStaticMarkup(await CityPage({ params: Promise.resolve({ state: 'ca', city: 'daly-city' }) }));
  assert.equal(load(ca)('[data-market] tbody tr').length, getMarketClubs('sf-bay-area').length);
  assert.equal(load(campbell)('[data-market] tbody tr').length, 2);
  assert.equal(load(petaluma)('[data-market] tbody tr').length, 2);
  assert.equal(load(sparse)('[data-market]').length, 0);
  for (const html of [ca, campbell, petaluma, sparse]) assert.doesNotMatch(html, /reviewNote|factNotes|expectedName/);
});

test('basic pilot screens remain ad-free even with a configured publisher', async () => {
  const before = process.env.NEXT_PUBLIC_ADSENSE_ID;
  process.env.NEXT_PUBLIC_ADSENSE_ID = 'pub-0000000000000000';
  try {
    const basic = renderToStaticMarkup(await ClubPage({ params: Promise.resolve({ slug: 'it-was-the-first-american-branch-of-the-norton-owners-club-san-francisco-ca' }) }));
    const full = renderToStaticMarkup(await ClubPage({ params: Promise.resolve({ slug: 'ghostriders-mc-san-jose-ca' }) }));
    assert.doesNotMatch(basic, /pagead2\.googlesyndication\.com|amazon\.com/);
    assert.match(full, /pagead2\.googlesyndication\.com/);
    assert.match(full, /Published source/);
  } finally {
    if (before === undefined) delete process.env.NEXT_PUBLIC_ADSENSE_ID;
    else process.env.NEXT_PUBLIC_ADSENSE_ID = before;
  }
});
