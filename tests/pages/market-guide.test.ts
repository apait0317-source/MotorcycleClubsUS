import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import * as guideApi from '@/lib/guides';
import { getMarketGuideGate } from '@/lib/markets';
import { makeReviewedClub } from '../fixtures/market-clubs';
import GuidePage, { generateStaticParams } from '@/app/guides/[slug]/page';
import ClubPage, { generateMetadata } from '@/app/clubs/[slug]/page';
import sitemap from '@/app/sitemap';
import { getMarketClubs } from '@/lib/markets';

const slug = 'motorcycle-clubs-san-francisco-bay-area';
test('regional guide publication follows each evidence boundary rather than route existence', () => {
  assert.equal(typeof guideApi.selectPublishedGuides, 'function');
  const candidate = { slug, marketId: 'sf-bay-area' } as guideApi.Guide;
  const clubs = Array.from({ length: 5 }, (_, i) => {
    const c = makeReviewedClub({ slug: `gate-${i}`, City: ['Oakland', 'Petaluma', 'Campbell'][i % 3] });
    c.discovery = { activities: ['racing'], contactUrl: 'https://example.org/join' };
    c.editorial!.changes.discovery = c.discovery;
    c.editorial!.evidence[0].fields.push('discovery.activities', 'discovery.contactUrl');
    return c;
  });
  for (const rows of [clubs.slice(0, 4), clubs.map(c => ({ ...c, City: 'Oakland' })), clubs.map((c, i) => i < 2 ? c : { ...c, discovery: undefined })]) {
    assert.deepEqual(guideApi.selectPublishedGuides([], [candidate], () => getMarketGuideGate(rows).eligible), []);
  }
  assert.equal(guideApi.selectPublishedGuides([], [candidate], () => getMarketGuideGate(clubs).eligible).length, 1);
});

test('published guest participation preserves the SFMC official ride season', () => {
  const sfmc = getMarketClubs('sf-bay-area').find(club => club.slug === 'sfmc-san-francisco-ca')!;
  assert.match(sfmc.discovery!.guestParticipation!, /official rides.*March.*October/);
  assert.match(sfmc.discovery!.guestParticipation!, /unofficial rides.*year-round/);
});

test('article JSON-LD escapes literal script delimiters while keeping the title intact', async () => {
  const guide = guideApi.getGuide(slug)!;
  const title = guide.title;
  const malicious = 'Local guide </script><script>globalThis.reviewProbe=1</script>';
  try {
    guide.title = malicious;
    const html = renderToStaticMarkup(await GuidePage({ params: Promise.resolve({ slug }) }));
    const { load } = await import('cheerio');
    const $ = load(html);
    assert.equal($('script:not([type="application/ld+json"]):not([async])').length, 0);
    const articles = $('script[type="application/ld+json"]').map((_, element) => JSON.parse($(element).text())).get();
    assert.equal(articles.find(article => article['@type'] === 'Article').headline, malicious);
  } finally { guide.title = title; }
});

test('qualified regional guide is linked, prerendered and included in the sitemap', async () => {
  const guide = guideApi.getGuide(slug);
  assert.ok(guide);
  assert.ok(generateStaticParams().some(p => p.slug === slug));
  assert.ok(sitemap().some(p => p.url.endsWith(`/guides/${slug}`)));
  const html = renderToStaticMarkup(await GuidePage({ params: Promise.resolve({ slug }) }));
  assert.match(html, /Compare San Francisco Bay Area clubs/);
  assert.match(html, /ItemList/);
  assert.match(html, /how-to-join-a-motorcycle-club/);
  assert.match(html, /how-to-verify-a-motorcycle-club/);
  assert.ok(html.includes('https://www.sanjosedonsmc.com/about-1'));
});

test('reviewed geography agrees across profile text, metadata and Organization schema', async () => {
  const clubSlug = 'san-jose-dons-motorcycle-club-san-juan-pr';
  const params = Promise.resolve({ slug: clubSlug });
  const html = renderToStaticMarkup(await ClubPage({ params }));
  const metadata = await generateMetadata({ params });
  assert.match(html, /San Jose, California/);
  assert.match(html, /"addressLocality":"San Jose"/);
  assert.match(html, /"addressRegion":"California"/);
  const title = typeof metadata.title === 'string' ? metadata.title
    : metadata.title && 'absolute' in metadata.title ? metadata.title.absolute : '';
  assert.ok(title.includes('San Jose'));
  assert.equal(metadata.alternates?.canonical, `/clubs/${clubSlug}`);
  assert.ok(html.includes(`/guides/${slug}`));
});

test('regional guides and state pages compare the same clubs and point to their own state', async () => {
  const { load } = await import('cheerio');
  const { default: StatePage } = await import('@/app/state/[code]/page');
  for (const market of [
    { id: 'florida', state: 'fl', guide: 'florida-motorcycle-clubs-first-ride' },
    { id: 'north-carolina', state: 'nc', guide: 'north-carolina-motorcycle-clubs-first-visit' },
  ]) {
    const guideHtml = renderToStaticMarkup(await GuidePage({ params: Promise.resolve({ slug: market.guide }) }));
    const stateHtml = renderToStaticMarkup(await StatePage({ params: Promise.resolve({ code: market.state }) }));
    const clubs = getMarketClubs(market.id).map(club => `/clubs/${club.slug}`).sort();
    assert.ok(getMarketGuideGate(getMarketClubs(market.id)).eligible);
    for (const html of [guideHtml, stateHtml]) {
      const $ = load(html);
      const table = $(`section[data-market="${market.id}"]`);
      assert.deepEqual(table.find('tbody th a').map((_, el) => $(el).attr('href')).get().sort(), clubs);
      assert.equal(table.find(`a[href="/state/${market.state}#directory"]`).length, 1);
      assert.doesNotMatch(table.text(), /Bay Area|California/);
    }
    assert.ok(stateHtml.includes(`/guides/${market.guide}`));
    assert.ok(sitemap().some(entry => entry.url.endsWith(`/guides/${market.guide}`)));
  }
});
