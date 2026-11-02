import { test } from 'node:test';
import assert from 'node:assert/strict';
import raw from '@/data/clubs.json';
import { getAllClubs, getClubBySlug, getClubsByCity, getClubsByState, getChapterListings, isMotorcycleClub, isListableClub } from '@/lib/data';
import { getVerifiedChapterOrg } from '@/lib/verified-chapters';

test('reviewed North Carolina corrections update geography while retaining old profile routes', () => {
  const corrections = [
    ['steelhorse-strangers-motorcycle-club-inc-rocky-mount-nc', 'Roxboro', 'nc', 'roxboro'],
    ['greenville-enduro-riders-association-clayton-nc', 'Greenville', 'sc', 'greenville'],
    ['elizabeth-city-motorcycle-club-kill-devil-hills-nc', 'Elizabeth City', 'nc', 'elizabeth-city'],
  ];
  for (const [slug, city, state, citySlug] of corrections) {
    const club = getClubBySlug(slug)!;
    assert.ok(club, slug);
    assert.equal(club.slug, slug);
    assert.equal(club.City.toLowerCase(), city.toLowerCase());
    assert.equal(club.State, state);
    assert.equal(club.citySlug, citySlug);
    assert.ok(getClubsByCity(state, citySlug).includes(club));
    assert.ok(getClubsByState(state).includes(club));
    assert.ok(club.editorial?.evidence.some(source => source.fields.includes('location')));
  }
});

test('Charlotte CBA event is excluded without deleting its record or route', () => {
  const slug = 'charlotte-cba-bike-show-swap-meet-charlotte-nc';
  const club = getClubBySlug(slug)!;
  assert.equal(club.slug, slug);
  assert.equal(club.editorial?.listingStatus, 'excluded');
  assert.equal(isMotorcycleClub(club), false);
  assert.equal(isListableClub(club), false);
  assert.ok(raw.some(row => row.slug === slug && row.place_id === club.place_id));
});

test('all original canonical slugs remain resolvable and both Fayetteville chapter records survive', () => {
  for (const slug of new Set(raw.map(club => club.slug))) assert.ok(getClubBySlug(slug), slug);
  const chapters = getChapterListings('cvma').filter(club => /15-1\b/.test(club.name) && /fayetteville/i.test(club.City));
  const originals = raw.filter(club => /15-1\b/.test(club.name) && /fayetteville/i.test(club.City));
  assert.equal(originals.length, 2);
  for (const original of originals) assert.ok(getAllClubs().some(club => club.place_id === original.place_id && club.slug === original.slug));
  assert.ok(chapters.some(chapter => chapter.place_id === 'cvma_cvma151nc_mjrcfy9q'));
  assert.equal(getClubBySlug('combat-veterans-motorcycle-associationr-nc-chapter-15-1-fayetteville-nc')?.place_id, 'ChIJh7ogq9h-_U0R8NTxPm14dN4');
});

test('West Virginia Patriot Guard never inherits the Northern California contact', () => {
  const club = getAllClubs().find(row => row.slug === 'patriot-guard-riders-parkersburg-wv')
    ?? getAllClubs().find(row => row.State === 'wv' && /patriot guard/i.test(row.name));
  assert.ok(club);
  assert.doesNotMatch(club.website, /norcalpgr/i);
});

test('a sourced short charter description is visible on its existing reviewed hub', () => {
  const charter = getVerifiedChapterOrg('hells-angels-mc')!.chapters.find(chapter => chapter.id === 'anchorage-anchorage-ak')!;
  assert.match(charter.description ?? '', /1982/);
  assert.equal(charter.descriptionVerifiedAt, '2026-11-02');
  assert.ok(charter.descriptionEvidence?.every(source => source.fields.includes('description')));
});

test('motorcycle-oriented advocacy chapters retain consistent eligibility and their sourced kind', () => {
  for (const slug of [
    'rolling-thunder-chapter-2-illinois-wauconda-il',
    'rolling-thunder-chapter-1-indiana-indianapolis-in',
    'rolling-thunder-chapter-3-virginia-dumfries-va',
  ]) {
    const club = getClubBySlug(slug)!;
    assert.equal(isMotorcycleClub(club), true, slug);
    assert.equal(club.discovery?.kind, 'advocacy', slug);
    assert.ok(club.editorial?.evidence.some(source => source.fields.includes('discovery.kind')), slug);
  }
  assert.equal(isListableClub(getClubBySlug('rolling-thunder-chapter-2-illinois-wauconda-il')!), false);
});
