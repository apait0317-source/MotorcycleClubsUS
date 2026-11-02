import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getMarketClubs } from '@/lib/markets';

test('comparison server markup contains every reviewed row, working links and published-source limitations', async () => {
  const api = await import('@/components/ClubComparison').catch(() => ({})) as typeof import('@/components/ClubComparison');
  assert.equal(typeof api.default, 'function');
  const { toPublicComparisonRow } = await import('@/lib/market-projection');
  const rows = getMarketClubs('sf-bay-area').map(toPublicComparisonRow).filter(row => row !== undefined);
  const html = renderToStaticMarkup(createElement(api.default, { rows, marketId: 'sf-bay-area', heading: 'Compare Bay Area clubs' }));
  for (const row of rows) { assert.ok(html.includes(row.name)); assert.ok(html.includes(row.profileHref)); }
  assert.match(html, /Not published in the sources reviewed/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /Reset filters/);
  assert.match(html, /<table/);
  assert.match(html, /<time dateTime="2026-11-01"/i);
  assert.doesNotMatch(html, /reviewNote|factNotes|expectedName|<script/);
});
