import { test } from 'node:test';
import assert from 'node:assert/strict';
import clubsData from '@/data/clubs.json';
import {
  getAllClubs,
  getChapterListings,
  getStateSummary,
  getListableClubsByState,
  getIndexableClubs,
  getThinClubsByState,
  isChapterListing,
  isIndexableClub,
  isListableClub,
  isThinClub,
} from '@/lib/data';
import { CHAPTER_ORGS, getChapterOrg } from '@/lib/chapter-orgs';
import type { Club } from '@/lib/types';

// Chapter-list rows come from a national organization's own chapter list. Each
// one repeats the same organization blurb with a new city, so none of them gets
// its own indexed page. Their value sits on one hub page per organization.

const rows = clubsData as Club[];

function club(overrides: Partial<Club>): Club {
  return {
    place_id: 'x', name: 'Test Chapter', description: 'A long enough description to earn credit on its own, with detail.',
    reviews: 3, rating: 4.5, website: 'https://example.test', phone: '555-0100', featured_image: '',
    main_category: 'Motorcycle club', categories: '', closed_on: '', address: '1 Main St, Austin, TX 78701, United States',
    link: '', query: '', 'query-02': '', City: 'austin', State: 'tx', stateName: 'Texas', citySlug: 'austin', slug: 'test-chapter-austin-tx',
    ...overrides,
  };
}

test('three organizations are configured, each with a unique slug and id prefix', () => {
  assert.deepEqual(CHAPTER_ORGS.map((o) => o.slug).sort(), ['cvma', 'sober-riders', 'wow']);
  assert.equal(new Set(CHAPTER_ORGS.map((o) => o.idPrefix)).size, CHAPTER_ORGS.length);
  assert.equal(getChapterOrg('cvma')?.name, 'Combat Veterans Motorcycle Association');
  assert.ok(CHAPTER_ORGS.every((o) => typeof o.index === 'boolean'));
  assert.equal(getChapterOrg('nope'), undefined);
});

test('a row is a chapter listing when its id comes from an organization chapter list', () => {
  assert.equal(isChapterListing(club({ place_id: 'cvma_ab12_xyz' })), true);
  assert.equal(isChapterListing(club({ place_id: 'wow_ab12_xyz' })), true);
  assert.equal(isChapterListing(club({ place_id: 'srmc_ab12_xyz' })), true);
  assert.equal(isChapterListing(club({ place_id: 'ChIJcvma_not_a_list_row' })), false);
  assert.equal(isChapterListing(club({ place_id: 'csv_hellsangels_1' })), false);
});

test('a chapter listing is never listable or indexable, however much detail it has', () => {
  const rich = club({ place_id: 'cvma_rich_1' });
  assert.equal(isListableClub(rich), false);
  assert.equal(isIndexableClub(rich), false);
  assert.equal(isListableClub(club({ place_id: 'ChIJrich' })), true);
});

test('a chapter listing is not shown as unlinked "thin" text on state and city pages', () => {
  assert.equal(isThinClub(club({ place_id: 'cvma_thin_1', description: '', website: '', phone: '', address: '', reviews: 0 })), false);
  assert.equal(isThinClub(club({ place_id: 'ChIJthin', description: '', website: '', phone: '', address: '', reviews: 0 })), true);
});

test('no indexed club page is a chapter listing', () => {
  assert.deepEqual(getIndexableClubs().filter(isChapterListing).map((c) => c.slug), []);
});

test('chapter listings stay out of the thin lists on every state page', () => {
  const stateCodes = [...new Set(rows.map((r) => r.State))];
  for (const code of stateCodes) {
    assert.deepEqual(getThinClubsByState(code).filter(isChapterListing).map((c) => c.slug), [], code);
  }
});

test('real Google Places rows for a chapter are not caught by the rule', () => {
  const places = getAllClubs().filter((c) => /^ChIJ/.test(c.place_id) && /cvma|combat veterans/i.test(c.name) && c.reviews > 0);
  assert.ok(places.length > 0, 'expected at least one CVMA row with Google reviews');
  assert.ok(places.every((c) => !isChapterListing(c)));
  assert.ok(places.some(isIndexableClub));
});

test('getChapterListings returns every row for the organization, ordered by state then city', () => {
  for (const org of CHAPTER_ORGS) {
    const expected = new Set(rows.filter((r) => r.place_id.startsWith(org.idPrefix)).map((r) => r.slug));
    const got = getChapterListings(org.slug);
    assert.ok(got.length > 0, org.slug);
    assert.ok(got.length <= expected.size && got.every((c) => expected.has(c.slug)), org.slug);
    const keys = got.map((c) => `${c.stateName}|${c.City}|${c.name}`);
    assert.deepEqual(keys, [...keys].sort((a, b) => a.localeCompare(b)), `${org.slug} is not sorted`);
  }
});

test('state summary counts match what a state page shows: listable plus unlinked, never chapter rows', () => {
  for (const code of [...new Set(rows.map((r) => r.State))]) {
    const summary = getStateSummary(code);
    const shown = getListableClubsByState(code).length + getThinClubsByState(code).length;
    assert.equal(summary.clubCount, shown, code);
  }
});
