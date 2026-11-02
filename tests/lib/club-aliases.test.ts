import test from 'node:test';
import assert from 'node:assert/strict';
import { makeReviewedClub } from '../fixtures/market-clubs';
import { clubAliases, getAllClubs, getClubBySlug, getStateSummary, getListableClubsByCity, searchClubs } from '@/lib/data';
import sitemap from '@/app/sitemap';
import { getVerifiedChapterProfile } from '@/lib/verified-chapters';

// Dynamic loading lets the initial absence fail as an explicit contract assertion.
const loadApi = async () => await import('@/lib/club-aliases').catch(() => ({})) as typeof import('@/lib/club-aliases');
const records = [makeReviewedClub({ slug: 'old-profile' }), makeReviewedClub({ slug: 'reviewed-profile', place_id: 'canonical' }),
  makeReviewedClub({ slug: 'second-alias', place_id: 'alias-two' })];
const alias = { aliasSlug: 'old-profile', canonicalSlug: 'reviewed-profile',
  sources: [{ url: 'https://example.org/history', checkedAt: '2026-01-01' }], reviewNote: 'Same evidenced organization' };

test('evidenced aliases resolve once and generate permanent historical redirects', async () => {
  const api = await loadApi();
  assert.equal(typeof api.resolveClubSlug, 'function');
  assert.equal(api.resolveClubSlug('old-profile', [alias]), 'reviewed-profile');
  assert.equal(api.resolveClubSlug('different', [alias]), 'different');
  assert.deepEqual(api.buildAliasRedirects([alias]), [{ source: '/clubs/old-profile', destination: '/clubs/reviewed-profile', permanent: true }]);
  assert.deepEqual(api.validateClubAliases(records, [alias, { ...alias, aliasSlug: 'second-alias' }]), []);
});

test('identity aliases reject missing targets, cycles, duplicate entries and unsourced claims', async () => {
  const api = await loadApi();
  assert.equal(typeof api.validateClubAliases, 'function');
  for (const entries of [null, {}, [{ ...alias, canonicalSlug: 'absent' }], [{ ...alias, canonicalSlug: 'old-profile' }],
    [alias, alias], [alias, { ...alias, aliasSlug: 'reviewed-profile', canonicalSlug: 'old-profile' }],
    [{ ...alias, sources: [] }], [{ ...alias, sources: [{ url: 'javascript:alert(1)', checkedAt: '2099-01-01' }] }]]) {
    assert.ok(api.validateClubAliases(records, entries).length, JSON.stringify(entries));
  }
});

test('a confirmed alias cannot target an excluded or unreviewed entity', async () => {
  const api = await loadApi();
  assert.equal(typeof api.validateClubAliases, 'function');
  for (const editorial of [undefined, { ...records[1].editorial!, listingStatus: 'excluded' as const }]) {
    assert.ok(api.validateClubAliases([{ ...records[1], editorial }, records[0]], [alias]).length);
  }
});

test('multiple aliases cannot inflate public populations and explicit chapter matches still respect location', () => {
  const all = getAllClubs();
  const start = all.length;
  const aliasStart = clubAliases.length;
  const canonical = makeReviewedClub({ slug: 'canonical-market-club', place_id: 'unique-canonical' });
  try {
    all.push(canonical, makeReviewedClub({ slug: 'old-market-one', place_id: 'one' }), makeReviewedClub({ slug: 'old-market-two', place_id: 'two' }));
    clubAliases.push({ ...alias, aliasSlug: 'old-market-one', canonicalSlug: canonical.slug }, { ...alias, aliasSlug: 'old-market-two', canonicalSlug: canonical.slug });
    assert.equal(getClubBySlug('old-market-one')?.slug, 'canonical-market-club');
    assert.equal(getListableClubsByCity('ca', 'old-town').length, 1);
    assert.equal(searchClubs('Example Riders', 'ca').filter(c => c.citySlug === 'old-town').length, 1);
    assert.equal(getStateSummary('ca').topCities.some(c => c.name === 'Old Town' && c.clubCount > 1), false);
    assert.equal(sitemap().filter(p => /old-market-one|old-market-two/.test(p.url)).length, 0);
    const chapter = { id: 'a', name: canonical.name, city: 'Old Town', state: 'ca', sourceUrl: 'https://example.org', evidence: 'Official identity', existingClubSlug: 'old-market-one' };
    assert.equal(getVerifiedChapterProfile(chapter)?.slug, 'canonical-market-club');
    assert.equal(getVerifiedChapterProfile({ ...chapter, city: 'Different City' }), undefined);
  } finally { all.splice(start); clubAliases.splice(aliasStart); }
});
