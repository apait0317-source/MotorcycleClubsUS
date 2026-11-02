import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAllClubs, isListableClub } from '@/lib/data';
import {
  validateVerifiedChapters, getVerifiedChapterOrgs, getVerifiedChapterOrgsForState,
  isIndexableVerifiedOrg, getVerifiedChapterProfile,
} from '@/lib/verified-chapters';
import { reviewedOrg } from '../fixtures/verified-chapters';

test('a sourced city-only registry validates without needing an address or profile', () => {
  assert.deepEqual(validateVerifiedChapters({ organizations: [reviewedOrg()] }), []);
  assert.deepEqual(validateVerifiedChapters({ organizations: [] }), []);
  assert.deepEqual(validateVerifiedChapters({}), ['Registry must contain an organizations array']);
});

test('malformed and future review dates cannot claim a completed source check', () => {
  for (const date of ['2026-02-30', '2099-01-01', 'November 1, 2026', '']) {
    const org = reviewedOrg(); org.sources[0].checkedAt = date;
    assert.match(validateVerifiedChapters({ organizations: [org] }).join('\n'), /checkedAt/, date);
  }
});

test('chapter evidence must reference a safe reviewed source and safe public links', () => {
  for (const url of ['javascript:alert(1)', 'https://user:password@example.org/', '/relative']) {
    const org = reviewedOrg(); org.sources[0].url = url; org.chapters[0].sourceUrl = url;
    assert.match(validateVerifiedChapters({ organizations: [org] }).join('\n'), /URL/, url);
  }
  for (const field of ['website', 'mapsUrl'] as const) {
    const org = reviewedOrg(); org.chapters[0][field] = 'javascript:alert(1)';
    assert.match(validateVerifiedChapters({ organizations: [org] }).join('\n'), new RegExp(field));
  }
  const org = reviewedOrg(); org.chapters[0].sourceUrl = 'https://unreviewed.example/';
  assert.match(validateVerifiedChapters({ organizations: [org] }).join('\n'), /reviewed source/);
});

test('state and regional labels cannot masquerade as reviewed cities', () => {
  for (const city of ['', 'Texas', 'Southern California', 'North Texas', 'Statewide', 'Midwest', 'Orange County']) {
    const org = reviewedOrg(); org.chapters[0].city = city;
    assert.match(validateVerifiedChapters({ organizations: [org] }).join('\n'), /city/, city);
  }
  const org = reviewedOrg(); org.chapters[0].state = 'xx';
  assert.match(validateVerifiedChapters({ organizations: [org] }).join('\n'), /state/);
});

test('duplicate chapter identities fail but distinct chapters in one city and namesakes remain separate', () => {
  const org = reviewedOrg();
  org.chapters.push({ ...org.chapters[0], id: 'duplicate', name: ' AUSTIN CHAPTER ', city: 'austin' });
  assert.match(validateVerifiedChapters({ organizations: [org] }).join('\n'), /duplicate chapter identity/);
  org.chapters[1].name = 'Austin East Chapter';
  const namesake = { ...reviewedOrg(), slug: 'example-mc-unrelated', name: 'Example MC (unrelated organization)' };
  assert.deepEqual(validateVerifiedChapters({ organizations: [org, namesake] }), []);
  org.chapters[1].id = 'austin';
  assert.match(validateVerifiedChapters({ organizations: [org] }).join('\n'), /duplicate chapter id/);
});

test('only explicitly reviewed matches can link a listable profile in the same city and state', () => {
  const club = getAllClubs().find(isListableClub)!;
  const chapter = { ...reviewedOrg().chapters[0], city: club.City, state: club.State };
  assert.equal(getVerifiedChapterProfile(chapter), undefined);
  assert.equal(getVerifiedChapterProfile({ ...chapter, existingClubSlug: club.slug })?.slug, club.slug);
  assert.equal(getVerifiedChapterProfile({ ...chapter, existingClubSlug: club.slug, state: 'xx' }), undefined);
  assert.equal(getVerifiedChapterProfile({ ...chapter, existingClubSlug: club.slug, city: 'Unrelated City' }), undefined);
  assert.equal(getVerifiedChapterProfile({ ...chapter, existingClubSlug: 'missing' }), undefined);
  const thin = getAllClubs().find((c) => !isListableClub(c))!;
  assert.equal(getVerifiedChapterProfile({ ...chapter, city: thin.City, state: thin.State, existingClubSlug: thin.slug }), undefined);
});

test('a reviewed org needs sourced context and chapters before its hub is indexed', () => {
  const org = reviewedOrg();
  assert.equal(isIndexableVerifiedOrg(org), true);
  assert.equal(isIndexableVerifiedOrg({ ...org, about: [] }), false);
  assert.equal(isIndexableVerifiedOrg({ ...org, sources: [] }), false);
  assert.equal(isIndexableVerifiedOrg({ ...org, chapters: [] }), false);
});

test('an editorial indexing hold overrides sufficient content without changing the default heuristic', () => {
  const org = reviewedOrg();
  assert.equal(isIndexableVerifiedOrg(org), true);
  assert.equal(isIndexableVerifiedOrg({ ...org, index: false }), false);
  assert.deepEqual(validateVerifiedChapters({ organizations: [{ ...org, index: false }] }), []);
  for (const index of [true, 'false', null]) {
    assert.match(validateVerifiedChapters({ organizations: [{ ...org, index }] }).join('\n'), /index/);
  }
});

test('state discovery links only organizations with reviewed chapters in that state', () => {
  const org = reviewedOrg();
  assert.deepEqual(getVerifiedChapterOrgsForState('TX', [org]).map((o) => o.slug), ['example-mc']);
  assert.deepEqual(getVerifiedChapterOrgsForState('ca', [org]), []);
  assert.deepEqual(validateVerifiedChapters({ organizations: getVerifiedChapterOrgs() }), []);
});

test('a sourced state-only roster supports state discovery without becoming a city chapter', () => {
  const org = { ...reviewedOrg(), chapters: [], stateCoverage: [{ state: 'ca', sourceUrl: 'https://example.org/chapters', evidence: 'Official roster identifies California, without city locations.' }] };
  assert.deepEqual(validateVerifiedChapters({ organizations: [org] }), []);
  assert.deepEqual(getVerifiedChapterOrgsForState('ca', [org]).map((o) => o.slug), ['example-mc']);
  assert.equal(isIndexableVerifiedOrg(org), false);
  org.stateCoverage[0].state = 'xx';
  assert.match(validateVerifiedChapters({ organizations: [org] }).join('\n'), /stateCoverage.*state/);
  org.stateCoverage[0].state = 'ca';
  org.stateCoverage[0].sourceUrl = 'https://not-reviewed.example/';
  assert.match(validateVerifiedChapters({ organizations: [org] }).join('\n'), /stateCoverage.*reviewed source/);
});
