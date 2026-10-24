import { test } from 'node:test';
import assert from 'node:assert/strict';
import sitemap from '@/app/sitemap';
import { getIndexableStates } from '@/lib/data';

const SITE = 'https://www.usmotorcycleclubs.com';

test('sitemap lists exactly the indexable state pages', () => {
  const urls = new Set(sitemap().map((entry) => entry.url));
  for (const state of getIndexableStates()) assert.ok(urls.has(`${SITE}/state/${state.code}`), state.code);
  assert.equal(urls.has(`${SITE}/state/dc`), false);
});

test('a state page with no listable club is noindex and an indexable one is not', async () => {
  const page = await import('@/app/state/[code]/page');
  const dc = await page.generateMetadata({ params: Promise.resolve({ code: 'dc' }) });
  const ca = await page.generateMetadata({ params: Promise.resolve({ code: 'ca' }) });
  assert.deepEqual(dc.robots, { index: false, follow: true });
  assert.equal(ca.robots, undefined);
});

test('Maine has a state page route', async () => {
  const page = await import('@/app/state/[code]/page');
  const params = await page.generateStaticParams();
  assert.ok(params.some((p: { code: string }) => p.code === 'me'));
});
