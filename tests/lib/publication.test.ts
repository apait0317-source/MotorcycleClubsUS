import test from 'node:test';
import assert from 'node:assert/strict';
import { clubContentScore, getAllClubs, isIndexableCity, isIndexableClub, isIndexableState, isListableClub, isThinClub } from '../../lib/data';
import type { Club, ClubEnrichment } from '../../lib/types';

const description = 'Riders meet in Austin for club rides, with membership details and event information on their official website.';
const review = (): ClubEnrichment => ({
  placeId: 'publication-test', expectedName: 'Reviewed Riders', listingStatus: 'confirmed-club',
  changes: { description }, verifiedAt: '2026-01-02', reviewNote: 'Official source reviewed',
  evidence: [{ url: 'https://example.org/about', checkedAt: '2026-01-01', fields: ['description', 'listingStatus'],
    factNotes: ['Based in Austin', 'Organizes rides', 'Publishes membership details'] }],
});
const club = (changes: Partial<Club> = {}): Club => ({
  place_id: 'publication-test', name: 'Reviewed Riders', slug: 'publication-test', description,
  website: 'https://example.org', phone: '555-0100', reviews: 1, rating: 5,
  address: '1 Main St, Austin, TX', featured_image: '', main_category: 'Motorcycle club',
  categories: '', closed_on: '', link: '', query: '', 'query-02': '', City: 'Austin', State: 'tx',
  stateName: 'Texas', citySlug: 'austin', ...changes,
});

test('high diagnostic scores cannot promote empty or unreviewed prose', () => {
  for (const row of [club({ description: '' }), club()]) {
    assert.ok(clubContentScore(row) >= 3);
    assert.equal(isListableClub(row), false);
    assert.equal(isIndexableClub(row), false);
    assert.equal(isThinClub(row), true);
  }
  assert.equal(clubContentScore(club()), 6, 'retain the historical diagnostic score');
});

test('classification-only review and unattributed or mismatched prose stay basic', () => {
  const classification = review();
  classification.changes = {};
  classification.evidence[0].fields = ['listingStatus'];
  const unattributed = review();
  unattributed.evidence[0].fields = ['listingStatus'];
  const blank = review();
  blank.changes.description = ' ';
  for (const row of [club({ editorial: classification }), club({ editorial: unattributed }),
    club({ editorial: review(), description: `${description} Changed after review.` }),
    club({ editorial: blank, description: ' ' })]) {
    assert.equal(isListableClub(row), false);
    assert.equal(isThinClub(row), true);
  }
});

test('approved attributed prose promotes confirmed clubs while preserving other exclusions', () => {
  const supported = club({ editorial: review() });
  assert.equal(isListableClub(supported), true);
  assert.equal(isIndexableClub(supported), true);
  assert.equal(isThinClub(supported), false);
  const excluded = review();
  excluded.listingStatus = 'excluded';
  for (const row of [club({ editorial: excluded }), club({ editorial: review(), main_category: 'Bar' }),
    club({ editorial: review(), place_id: 'cvma_reviewed' })]) {
    assert.equal(isListableClub(row), false);
    assert.equal(isThinClub(row), false);
  }
  assert.equal(isListableClub(club({ editorial: review(), website: '', phone: '', address: '', reviews: 0 })), false);
});

test('state and city hubs need two reviewed profiles even when basic entries have high scores', () => {
  const all = getAllClubs();
  const state = { code: 'test', name: 'Test', slug: 'test', clubCount: 0, cityCount: 0 };
  const city = { state: 'test', name: 'Test City', slug: 'test-city', stateName: 'Test', clubCount: 0 };
  const first = club({ State: 'test', citySlug: 'test-city', editorial: review() });
  const basic = club({ State: 'test', citySlug: 'test-city' });
  const initialLength = all.length;
  try {
    all.push(first, basic);
    assert.equal(isIndexableState(state), false);
    assert.equal(isIndexableCity(city), false);
    all.push(club({ State: 'test', citySlug: 'test-city', editorial: review() }));
    assert.equal(isIndexableState(state), true);
    assert.equal(isIndexableCity(city), true);
  } finally {
    all.splice(initialLength);
  }
});
