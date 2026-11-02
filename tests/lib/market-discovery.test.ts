import test from 'node:test';
import assert from 'node:assert/strict';
import { makeReviewedClub } from '../fixtures/market-clubs';
const loadApi = async () => await import('@/lib/market-discovery').catch(() => ({})) as typeof import('@/lib/market-discovery');

test('combined filters omit unknown facts and reset restores all rows', async () => {
  const api = await loadApi();
  assert.equal(typeof api.filterComparisonRows, 'function');
  const rows = [{ id: 'one', slug: 'one', name: 'One', city: 'Oakland', state: 'ca', profileHref: '/clubs/one', facts: { kind: 'riding-club' as const }, sources: {} },
    { id: 'two', slug: 'two', name: 'Two', city: 'Petaluma', state: 'ca', profileHref: '/clubs/two', facts: { activities: ['touring' as const] }, sources: {} }];
  assert.equal(api.filterComparisonRows(rows, { kind: 'riding-club', activity: 'touring' }).length, 0);
  assert.deepEqual(api.filterComparisonRows(rows, {}), rows);
  assert.deepEqual(api.comparisonCoverage(rows), { missingKind: 1, missingActivities: 1 });
});

test('projection emits only matching approved facts and selected provenance', async () => {
  const { toPublicComparisonRow } = await import('@/lib/market-projection').catch(() => ({})) as typeof import('@/lib/market-projection');
  assert.equal(typeof toPublicComparisonRow, 'function');
  const club = makeReviewedClub();
  club.discovery = { kind: 'riding-club', bikeRequirements: 'UNREVIEWED CHANGE' };
  club.editorial!.changes.discovery = { kind: 'riding-club', bikeRequirements: 'Published requirement' };
  club.editorial!.evidence[0].fields.push('discovery.kind', 'discovery.bikeRequirements');
  const row = toPublicComparisonRow(club)!;
  assert.equal(row.facts.kind, 'riding-club');
  assert.equal(row.facts.bikeRequirements, undefined);
  assert.deepEqual(row.sources.kind, [{ url: 'https://example.org/about', checkedAt: '2026-01-01' }]);
  assert.doesNotMatch(JSON.stringify(row), /UNREVIEWED CHANGE|PRIVATE NOTE|reviewNote|factNotes|expectedName/);
  assert.equal(toPublicComparisonRow({ ...club, editorial: undefined }), undefined);
});
