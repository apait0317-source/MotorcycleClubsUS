import test from 'node:test';
import assert from 'node:assert/strict';
import { makeReviewedClub } from '../fixtures/market-clubs';
import type { Club } from '@/lib/types';

const loadApi = async () => await import('@/lib/markets').catch(() => ({})) as typeof import('@/lib/markets');
function cohort(): Club[] {
  return Array.from({ length: 5 }, (_, i) => {
    const club = makeReviewedClub({ place_id: `club-${i}`, slug: `club-${i}`, City: ['Oakland', 'Petaluma', 'San Francisco'][i % 3] });
    club.discovery = { activities: ['touring'], contactUrl: 'https://example.org/join' };
    club.editorial!.changes.discovery = club.discovery;
    club.editorial!.evidence[0].fields.push('discovery.activities', 'discovery.contactUrl');
    return club;
  });
}

test('regional content requires five entities, three cities and three actionable contact routes independently', async () => {
  const api = await loadApi();
  assert.equal(typeof api.getMarketGuideGate, 'function');
  const rows = cohort();
  assert.deepEqual(api.getMarketGuideGate(rows), { eligible: true, organizationCount: 5, cityCount: 3, actionableCount: 5 });
  assert.equal(api.getMarketGuideGate(rows.slice(0, 4)).eligible, false);
  assert.equal(api.getMarketGuideGate(rows.map(c => ({ ...c, City: 'Oakland' }))).eligible, false);
  const fewerFacts = rows.map((c, i) => i < 2 ? c : { ...c, discovery: undefined });
  assert.equal(api.getMarketGuideGate(fewerFacts).eligible, false);
  assert.equal(api.getMarketGuideGate([...rows.slice(0, 4), rows[0]]).organizationCount, 4);
  assert.equal(api.getMarketGuideGate(rows.map(c => ({ ...c, editorial: undefined }))).eligible, false);
});

test('markets reject orphan cohorts, duplicates and holds outside the cohort', async () => {
  const api = await loadApi();
  assert.equal(typeof api.validateMarkets, 'function');
  const rows = cohort();
  const manifest = { id: 'sf-bay-area', title: 'Bay Area', state: 'ca', candidateSlugs: rows.map(c => c.slug), heldSlugs: [], guideSlug: 'motorcycle-clubs-san-francisco-bay-area' };
  assert.deepEqual(api.validateMarkets([manifest], rows), []);
  for (const bad of [{ ...manifest, candidateSlugs: ['missing'] }, { ...manifest, candidateSlugs: ['club-0', 'club-0'] }, { ...manifest, heldSlugs: ['outside'] }]) {
    assert.ok(api.validateMarkets([bad], rows).length);
  }
  assert.deepEqual(api.getMarketClubs('unknown'), []);
});
