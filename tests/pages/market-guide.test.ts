import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import * as guideApi from '@/lib/guides';
import { getMarketGuideGate } from '@/lib/markets';
import { makeReviewedClub } from '../fixtures/market-clubs';
import GuidePage, { generateStaticParams } from '@/app/guides/[slug]/page';
import ClubPage, { generateMetadata } from '@/app/clubs/[slug]/page';
import sitemap from '@/app/sitemap';

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

test('qualified regional guide is linked, prerendered and included in the sitemap', async () => {
  const guide = guideApi.getGuide(slug);
  assert.ok(guide);
  assert.ok(generateStaticParams().some(p => p.slug === slug));
  assert.ok(sitemap().some(p => p.url.endsWith(`/guides/${slug}`)));
  const html = renderToStaticMarkup(await GuidePage({ params: Promise.resolve({ slug }) }));
  assert.match(html, /Compare Bay Area clubs/);
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
