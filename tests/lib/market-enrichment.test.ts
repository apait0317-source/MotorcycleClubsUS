import test from 'node:test';
import assert from 'node:assert/strict';
import { applyApprovedEnrichments, validateEnrichments } from '@/lib/enrichment';
import { makeReviewedClub, makeEnrichment } from '../fixtures/market-clubs';

const club = makeReviewedClub();
const proposal = () => ({
  ...makeEnrichment(club),
  changes: { name: 'Example Motorcycle Riders', location: { city: 'New City', state: 'ca' },
    description: club.description,
    discovery: { kind: 'riding-club', activities: ['touring'], bikeRequirements: 'Any road motorcycle.', contactUrl: 'https://example.org/join' } },
  evidence: [{ url: 'https://example.org/about', checkedAt: '2026-01-01',
    fields: ['listingStatus', 'description', 'name', 'location', 'discovery.kind', 'discovery.activities', 'discovery.bikeRequirements', 'discovery.contactUrl'],
    factNotes: ['Based in New City', 'Publishes touring rides', 'Publishes membership rules'] }],
});

test('supported discovery and location corrections preserve historical identity and raw input', () => {
  const before = structuredClone(club);
  const result = applyApprovedEnrichments([club], [proposal()])[0];
  assert.equal(result.name, 'Example Motorcycle Riders');
  assert.equal(result.City, 'New City');
  assert.equal(result.citySlug, 'new-city');
  assert.equal(result.stateName, 'California');
  assert.equal(result.address, '');
  assert.equal(result.slug, 'example-riders-old-town-ca');
  assert.equal(result.place_id, 'market-fixture');
  assert.deepEqual(result.discovery?.activities, ['touring']);
  assert.deepEqual(club, before);
});

test('every new changed field requires its own attributed evidence', () => {
  for (const field of ['name', 'location', 'discovery.kind', 'discovery.activities', 'discovery.contactUrl']) {
    const value = proposal();
    value.evidence[0].fields = value.evidence[0].fields.filter(f => f !== field);
    assert.ok(validateEnrichments([club], [value]).some(e => e.includes(field)), field);
  }
});

test('discovery rejects unknown fields, blank claims, invalid enums and unsafe contact routes', () => {
  for (const discovery of [{ kind: 'all' }, { activities: [] }, { activities: ['touring', 'touring'] },
    { activities: ['flying'] }, { membershipEligibility: ' ' }, { contactUrl: 'javascript:alert(1)' },
    { contactUrl: 'https://user:pass@example.org' }, { acceptsEveryone: true }, null]) {
    const value = proposal();
    Object.assign(value.changes, { discovery });
    assert.ok(validateEnrichments([club], [value]).length, JSON.stringify(discovery));
  }
});

test('location requires a real city and lowercase known state and does not accept extra overrides', () => {
  for (const location of [{ city: '', state: 'ca' }, { city: 'New City', state: 'CA' },
    { city: 'New City', state: 'zz' }, { city: 'Northern California', state: 'ca' },
    { city: 'New City', state: 'ca', slug: 'replacement' }, null]) {
    const value = proposal(); Object.assign(value.changes, { location });
    assert.ok(validateEnrichments([club], [value]).length);
  }
});

test('a same-city reviewed change retains the recorded address unless explicitly corrected', () => {
  const value = proposal(); value.changes.location = { city: 'Old Town', state: 'ca' };
  assert.equal(applyApprovedEnrichments([club], [value])[0].address, '1 Main St, Old Town, CA');
});
