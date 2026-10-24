import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitTitle, clubMetaDescription, truncateAtWord, clubTitle, stateTitle, cityTitle, TITLE_SUFFIX, MAX_TITLE_LENGTH } from '@/lib/seo';
import { getIndexableClubs, getIndexableStates, getIndexableCities } from '@/lib/data';
import { capitalizeCity } from '@/lib/utils';
import type { Club } from '@/lib/types';

function club(overrides: Partial<Club> = {}): Club {
  return {
    place_id: 'x', name: 'Iron Riders MC', description: '', reviews: 0, rating: 0, website: '', phone: '',
    featured_image: '', main_category: 'Motorcycle club', categories: '', closed_on: '', address: '', link: '',
    query: '', 'query-02': '', City: 'austin', State: 'tx', stateName: 'Texas', citySlug: 'austin', slug: 'iron-riders-mc-austin-tx',
    ...overrides,
  };
}

type Title = ReturnType<typeof fitTitle>;
const text = (title: Title) => (typeof title === 'string' ? title : (title as { absolute: string }).absolute);
/** Characters a searcher sees: the suffix counts unless the title is absolute. */
const effective = (title: Title) => (typeof title === 'string' ? title.length + TITLE_SUFFIX.length : text(title).length);

test('fitTitle keeps the first candidate when it fits with the site suffix', () => {
  assert.equal(fitTitle(['Motorcycle Clubs in Ohio (28 Clubs)', 'Motorcycle Clubs in Ohio']), 'Motorcycle Clubs in Ohio (28 Clubs)');
});

test('fitTitle moves to a shorter candidate when the first is too long with the suffix', () => {
  const long = 'Motorcycle Clubs in North Carolina (92 Clubs)';
  const short = 'Motorcycle Clubs in North Carolina';
  assert.ok(long.length + TITLE_SUFFIX.length > MAX_TITLE_LENGTH);
  assert.equal(fitTitle([long, short]), short);
});

test('a bare candidate beats a shorter suffixed one that loses words', () => {
  const descriptive = 'Boring Old Fartz Motorcycle Club - Birmingham, Alabama';
  const shorter = 'Boring Old Fartz Motorcycle Club, AL';
  assert.ok(descriptive.length + TITLE_SUFFIX.length > MAX_TITLE_LENGTH);
  assert.ok(descriptive.length <= MAX_TITLE_LENGTH);
  assert.deepEqual(fitTitle([descriptive, { bare: descriptive }, shorter]), { absolute: descriptive });
});

test('fitTitle drops the suffix when only a bare plain candidate fits', () => {
  const bare = 'A'.repeat(MAX_TITLE_LENGTH - 5);
  assert.deepEqual(fitTitle([bare]), { absolute: bare });
});

test('fitTitle falls back to the last candidate when nothing fits', () => {
  const longest = 'B'.repeat(90);
  const shortest = 'B'.repeat(80);
  assert.deepEqual(fitTitle([longest, { bare: longest }, shortest]), { absolute: shortest });
});

test('truncateAtWord cuts at a word boundary and never exceeds the limit', () => {
  const sample = 'Alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu';
  const cut = truncateAtWord(sample, 30);
  const prefix = cut.slice(0, -3);
  assert.ok(cut.length <= 30);
  assert.ok(cut.endsWith('...'));
  assert.ok(sample.startsWith(prefix));
  assert.equal(sample[prefix.length], ' ', 'cut inside a word');
  assert.doesNotMatch(cut, /\s\.\.\./);
  assert.equal(truncateAtWord('short text', 30), 'short text');
});

test('truncateAtWord never produces four dots and survives awkward input', () => {
  const sentence = 'First sentence ends right here. Second sentence keeps going for quite a while longer.';
  const cut = truncateAtWord(sentence, 34);
  assert.doesNotMatch(cut, /\.{4}/);
  assert.ok(cut.length <= 34);
  assert.equal(truncateAtWord('x'.repeat(60), 20).length, 20);
  assert.equal(truncateAtWord('abcdefgh', 3), 'abc');
  const emoji = truncateAtWord('Ride on 🏍️ together every weekend with us', 13);
  assert.doesNotMatch(emoji, /[\ud800-\udbff]\.\.\.$/);
});

test('a real description is used as written and collapsed to one line', () => {
  const description = 'The Iron Riders ride every second Saturday\nfrom Austin and welcome riders of every brand to join our charity runs.';
  const out = clubMetaDescription(club({ description }));
  assert.ok(!out.includes('\n'));
  assert.ok(out.startsWith('The Iron Riders ride every second Saturday from Austin'));
  assert.ok(out.length >= 70 && out.length <= 160);
});

test('a long description is cut to 160 characters or fewer', () => {
  const out = clubMetaDescription(club({ description: 'Word '.repeat(80) }));
  assert.ok(out.length <= 160, String(out.length));
  assert.match(out, /\.\.\.$/);
});

test('a description with a raw link, handle, or phone number is not used as the snippet', () => {
  const base = 'The Iron Riders welcome every rider to our monthly meeting at the clubhouse in Austin. ';
  for (const tail of ['Visit https://irontx.example today.', 'Find us on www.irontx.example now.', 'Follow @irontx for news and ride updates.', 'Call 512-555-0100 for the next ride date.']) {
    const out = clubMetaDescription(club({ description: base + tail }));
    assert.match(out, /^Iron Riders MC is a motorcycle club in Austin, Texas\./, tail);
  }
});

test('a placeholder description is replaced by one built from the data', () => {
  const out = clubMetaDescription(club({ description: 'Motorcycle Club', website: 'https://x.test', phone: '555-0100' }));
  assert.notEqual(out, 'Motorcycle Club');
  assert.match(out, /Iron Riders MC is a motorcycle club in Austin, Texas\./);
  assert.match(out, /Website and phone number listed\./);
  assert.ok(out.length >= 70 && out.length <= 160);
});

test('the built description names Google as the source of ratings', () => {
  const out = clubMetaDescription(club({ rating: 4.8, reviews: 12 }));
  assert.match(out, /Rated 4\.8 on Google from 12 reviews\./);
  const single = clubMetaDescription(club({ rating: 5, reviews: 1 }));
  assert.match(single, /Rated 5\.0 on Google from 1 review\./);
  assert.doesNotMatch(clubMetaDescription(club()), /Google/);
});

test('the built description uses the right article, keeps acronyms, and describes AMA charters', () => {
  const offroad = clubMetaDescription(club({ main_category: 'Off-road Motorcycle club' }));
  assert.match(offroad, / is an off-road motorcycle club in /);
  const bmw = clubMetaDescription(club({ main_category: 'BMW Motorcycle club' }));
  assert.match(bmw, / is a BMW motorcycle club in /);
  const ama = clubMetaDescription(club({ description: 'Rock And Roll Trials Club is an AMA-chartered motorcycle organization located in Sanford, ME.' }));
  assert.match(ama, /American Motorcyclist Association/);
  for (const main_category of ['Association / Organization', 'Club', 'Sports club']) {
    assert.match(clubMetaDescription(club({ main_category })), / is a motorcycle club in /, main_category);
  }
  const vets = clubMetaDescription(club({ main_category: 'Veterans Motorcycle club' }));
  assert.match(vets, / is a veterans motorcycle club in /);
});

test('every indexable club gets a 70 to 160 character description that is not a placeholder', () => {
  const bad = getIndexableClubs()
    .map((c) => ({ slug: c.slug, d: clubMetaDescription(c) }))
    .filter(({ d }) => d.length < 70 || d.length > 160 || /^motorcycle club\.?$/i.test(d) || /https?:\/\/|www\./i.test(d));
  assert.deepEqual(bad.slice(0, 5), []);
});

test('state and city titles always fit within 60 characters', () => {
  for (const s of getIndexableStates()) assert.ok(effective(stateTitle(s.name, 99)) <= MAX_TITLE_LENGTH, s.code);
  for (const c of getIndexableCities()) {
    const name = capitalizeCity(c.name);
    assert.ok(effective(cityTitle(name, c.stateName, c.state)) <= MAX_TITLE_LENGTH, `${c.state}/${c.slug}`);
  }
});

test('city titles keep the full state name whenever it fits', () => {
  assert.equal(cityTitle('Austin', 'Texas', 'tx'), 'Motorcycle Clubs in Austin, Texas');
  const long = cityTitle('Rancho Santa Margarita', 'California', 'ca');
  assert.deepEqual(long, { absolute: 'Motorcycle Clubs in Rancho Santa Margarita, California' });
});

test('club titles prefer the full state name and always keep the city', () => {
  assert.equal(clubTitle(club()), 'Iron Riders MC - Austin, Texas');
  // Full state fits bare (54 characters) but not with the suffix, so the suffix goes.
  const mid = club({ name: 'Boring Old Fartz Motorcycle Club', City: 'birmingham', State: 'al', stateName: 'Alabama' });
  assert.deepEqual(clubTitle(mid), { absolute: 'Boring Old Fartz Motorcycle Club - Birmingham, Alabama' });
});

test('every indexable club title keeps its city, and only a few exceed 60 characters', () => {
  const clubs = getIndexableClubs();
  const missingCity = clubs.filter((c) => !text(clubTitle(c)).includes(capitalizeCity(c.City)));
  // A name so long that even "name - City" overflows may fall back to "name, ST".
  assert.ok(
    missingCity.every((c) => `${c.name} - ${capitalizeCity(c.City)}`.length > MAX_TITLE_LENGTH),
    missingCity.map((c) => c.slug).join(', '),
  );
  const tooLong = clubs.filter((c) => effective(clubTitle(c)) > MAX_TITLE_LENGTH);
  assert.ok(tooLong.length <= 40, `${tooLong.length} of ${clubs.length} club titles are over ${MAX_TITLE_LENGTH} characters`);
});
