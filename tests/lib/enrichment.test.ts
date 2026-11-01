import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyApprovedEnrichments, validateEnrichments } from '@/lib/enrichment';
import { getAllClubs, getIndexableClubs, clubContentScore, isMotorcycleClub, isListableClub, getSiteStats } from '@/lib/data';
import type { Club, ClubEnrichment } from '@/lib/types';
import rawClubs from '@/data/clubs.json';
import { canonicalClubRecords } from '@/lib/canonical-clubs';
const club = getIndexableClubs()[0];
const entry = (): ClubEnrichment => ({ placeId: club.place_id, expectedName: club.name, listingStatus: 'confirmed-club', changes: { phone: '123' }, evidence: [{ url: 'https://example.com', checkedAt: '2026-01-01', fields: ['phone', 'listingStatus'], factNotes: ['Published phone'] }], verifiedAt: '2026-01-02', reviewNote: 'Reviewed official source' });
const errors = (value: unknown) => validateEnrichments([club], value as ClubEnrichment[]);
test('empty approved overlay preserves raw canonical eligibility and scores', () => {
  const raw = canonicalClubRecords(rawClubs as Club[]);
  const result = applyApprovedEnrichments(raw, []);
  assert.deepEqual(result, raw);
  assert.deepEqual(result.map(c => [c.place_id, isListableClub(c), clubContentScore(c)]),
    raw.map(c => [c.place_id, isListableClub(c), clubContentScore(c)]));
  assert.equal(result.filter(isListableClub).length, raw.filter(isListableClub).length);
  assert.equal(result.filter(c => isListableClub(c) && clubContentScore(c) >= 5).length,
    raw.filter(c => isListableClub(c) && clubContentScore(c) >= 5).length);
});
test('requires exact identity, unique IDs and existing runtime records', () => {
  assert.deepEqual(errors([entry()]), []);
  for (const e of [{ ...entry(), expectedName: club.name.toLowerCase() }, { ...entry(), placeId: 'orphan' }]) assert.ok(errors([e]).length);
  assert.ok(errors([entry(), entry()]).length);
});
test('rejects invalid dates, future dates and evidence newer than verification', () => {
  for (const date of ['2026-02-30', '2099-01-01', 'yesterday', '2026-1-01']) assert.ok(errors([{ ...entry(), verifiedAt: date }]).length);
  const e = entry(); e.evidence[0].checkedAt = '2026-02-01'; assert.ok(errors([e]).length);
});
test('requires attributed evidence and three distinct factual notes for descriptions', () => {
  const e = entry(); e.changes.description = 'An original description.';
  assert.ok(errors([e]).length);
  e.evidence[0].fields.push('description'); e.evidence[0].factNotes = ['one', 'two', 'three']; assert.deepEqual(errors([e]), []);
  e.evidence[0].factNotes = ['one', 'one', 'one']; assert.ok(errors([e]).length);
});
test('rejects unsupported URLs and credentials', () => {
  for (const url of ['javascript:alert(1)', 'ftp://example.com', 'https://user:pass@example.com', 'bad']) {
    const e = entry(); e.evidence[0].url = url; assert.ok(errors([e]).length);
    const f = entry(); f.changes.website = url; f.evidence[0].fields.push('website'); assert.ok(errors([f]).length);
  }
});
test('malformed JSON and forbidden overrides produce validation errors', () => {
  for (const value of [null, {}, [null], [3], [{ ...entry(), evidence: null }], [{ ...entry(), evidence: [null] }], [{ ...entry(), changes: null }], [{ ...entry(), changes: { slug: 'other' } }], [{ ...entry(), changes: { reviews: 100 } }], [{ ...entry(), slug: 'other' }], [{ ...entry(), evidence: [{ url: 1, checkedAt: null, fields: {}, factNotes: [3] }] }]]) {
    assert.ok(errors(value).length);
    assert.throws(() => applyApprovedEnrichments([club], value as ClubEnrichment[]), /Invalid approved enrichments/);
  }
});
test('pure application preserves unknown fields and deep isolates inputs', () => {
  const raw = { ...club, phone: 'new scraper phone', extra: { value: 'retained' } };
  const e = entry(); const before = structuredClone([raw, e]);
  const result = applyApprovedEnrichments([raw], [e]);
  assert.equal(result[0].phone, '123'); assert.equal(result[0].slug, raw.slug);
  assert.deepEqual((result[0] as typeof raw).extra, raw.extra);
  result[0].editorial!.evidence[0].factNotes.push('changed');
  (result[0] as typeof raw).extra.value = 'changed';
  assert.deepEqual([raw, e], before);
});
test('exclusion retains raw row while removing it from listing and statistics helpers', () => {
  const e = entry(); e.listingStatus = 'excluded'; assert.ok(errors([e]).length);
  e.changes = {}; const excluded = applyApprovedEnrichments([club], [e])[0];
  assert.equal(isMotorcycleClub(excluded), false); assert.equal(isListableClub(excluded), false);
  const all = getAllClubs(); const index = all.indexOf(club); const count = getSiteStats().clubCount;
  try { all[index] = excluded; assert.equal(getSiteStats().clubCount, count - 1); assert.ok(getAllClubs().includes(excluded)); }
  finally { all[index] = club; }
});
test('confirmed status cannot bypass category or chapter rules', () => {
  const enriched = applyApprovedEnrichments([club], [entry()])[0];
  assert.equal(isMotorcycleClub({ ...enriched, main_category: 'Bar' }), false);
  assert.equal(isListableClub({ ...enriched, place_id: 'cvma_test' }), false);
});
test('nonempty JSON-shaped approved data crosses the validated integration boundary', () => {
  // Mutable object literals, like imported JSON, infer string rather than literal unions.
  const jsonEntries = [{
    placeId: club.place_id,
    expectedName: club.name,
    listingStatus: 'confirmed-club',
    changes: { phone: '456' },
    evidence: [{ url: 'https://example.com', checkedAt: '2026-01-01', fields: ['phone', 'listingStatus'], factNotes: ['Published phone'] }],
    verifiedAt: '2026-01-02',
    reviewNote: 'Reviewed official source',
  }];
  assert.deepEqual(validateEnrichments([club], jsonEntries), []);
  assert.equal(applyApprovedEnrichments([club], jsonEntries)[0].phone, '456');
  jsonEntries[0].listingStatus = 'pending';
  assert.throws(() => applyApprovedEnrichments([club], jsonEntries), /invalid listingStatus/);
});

test('monitoring and app share canonical slug cohort before approval validation', async () => {
  const { canonicalClubRecords } = await import('../../lib/canonical-clubs');
  const raw = [club, { ...club }, { ...club, place_id: 'discarded-id' }];
  const canonical = canonicalClubRecords(raw);
  assert.equal(canonical.length, 1);
  assert.deepEqual(validateEnrichments(canonical, [entry()]), []);
  assert.equal(applyApprovedEnrichments(canonical, [entry()]).length, 1);
  assert.ok(validateEnrichments(canonical, [{ ...entry(), placeId: 'discarded-id' }]).some(error => error.includes('orphan')));
  assert.ok(validateEnrichments(canonicalClubRecords([club, { ...club, slug: 'different-slug' }]), [entry()]).some(error => error.includes('ambiguous')));
  assert.equal(raw.length, 3);
});
