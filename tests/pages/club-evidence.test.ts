import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import ClubPage, { generateMetadata } from '@/app/clubs/[slug]/page';
import { getAllClubs, isIndexableClub } from '@/lib/data';
import type { ClubEnrichment } from '@/lib/types';

const club = getAllClubs().find(isIndexableClub)!;
const editorial: ClubEnrichment = {
  placeId: club.place_id, expectedName: club.name, listingStatus: 'confirmed-club',
  changes: {}, verifiedAt: '2026-10-28', reviewNote: 'PRIVATE REVIEW NOTE',
  evidence: [
    { url: 'https://example.org/?a=1&b=%22%3E%3Cscript%3E', checkedAt: '2026-10-27', fields: ['description'], factNotes: ['PRIVATE FACT NOTE'] },
    { url: 'https://example.org/?a=1&b=%22%3E%3Cscript%3E', checkedAt: '2026-10-28', fields: ['website'], factNotes: [] },
  ],
};

async function renderProfile(review?: ClubEnrichment) {
  const original = club.editorial;
  try {
    club.editorial = review;
    const params = Promise.resolve({ slug: club.slug });
    return { html: renderToStaticMarkup(await ClubPage({ params })), metadata: await generateMetadata({ params }) };
  } finally {
    club.editorial = original;
  }
}

test('reviewed profile renders the actual checked date and unique external sources', async () => {
  const { html } = await renderProfile(editorial);
  const $ = load(html);
  const block = $('section[aria-label="Information checked"]');
  assert.equal(block.length, 1);
  assert.equal(block.find('time').attr('datetime'), editorial.verifiedAt);
  assert.match(block.text(), /October 28, 2026/);
  assert.equal(block.find('a').length, 1);
  assert.equal(block.find('a').attr('href'), editorial.evidence[0].url);
  assert.equal(block.find('a').attr('target'), '_blank');
  assert.equal(block.find('a').attr('rel'), 'noopener noreferrer nofollow external');
});

test('evidence is escaped and internal notes and inferred status badges are absent', async () => {
  const { html } = await renderProfile(editorial);
  const $ = load(html);
  const block = $('section[aria-label="Information checked"]');
  assert.equal(block.find('a').text(), editorial.evidence[0].url);
  assert.match(html, /example\.org\/\?a=1&amp;b=/);
  assert.doesNotMatch(html, /PRIVATE REVIEW NOTE|PRIVATE FACT NOTE/);
  assert.doesNotMatch(block.text(), /club-confirmed|confirmed-club|active|endorsed/i);
  assert.equal(block.find('script').length, 0);
});

test('untouched profile has no checked date or evidence block', async () => {
  const { html } = await renderProfile();
  const $ = load(html);
  assert.equal($('section[aria-label="Information checked"]').length, 0);
  assert.doesNotMatch(html, /Information checked|2026-10-28/);
});

test('reviewed exclusion remains noindex without advertising or a confirmation badge', async () => {
  const { html, metadata } = await renderProfile({ ...editorial, listingStatus: 'excluded' });
  assert.deepEqual(metadata.robots, { index: false, follow: true });
  assert.doesNotMatch(html, /adsbygoogle|club-confirmed|confirmed-club/);
});

// Evidence alone must not label unchanged legacy fields as reviewed.
for (const { name, changes, expected } of [
  { name: 'identity only', changes: {}, expected: 'Reviewed: organization identity, listing classification' },
  { name: 'description only', changes: { description: 'Reviewed summary' }, expected: 'Reviewed: organization identity, listing classification, description' },
  { name: 'website only', changes: { website: 'https://example.org/' }, expected: 'Reviewed: organization identity, listing classification, website' },
  { name: 'phone only', changes: { phone: '555-0100' }, expected: 'Reviewed: organization identity, listing classification, phone' },
  { name: 'all approved fields', changes: { description: 'Reviewed summary', website: 'https://example.org/', phone: '555-0100' }, expected: 'Reviewed: organization identity, listing classification, description, website, phone' },
]) {
  test(`checked scope reflects approved changes: ${name}`, async () => {
    const { html } = await renderProfile({ ...editorial, changes });
    const $ = load(html);
    const block = $('section[aria-label="Information checked"]');
    const scope = block.find('p').eq(1).text();
    assert.equal(scope, expected);
    assert.doesNotMatch(scope, /address|hours|expectedName|listingStatus|verifiedAt|PRIVATE/i);
    if (!Object.hasOwn(changes, 'phone')) assert.doesNotMatch(scope, /phone/i);
    if (!Object.hasOwn(changes, 'website')) assert.doesNotMatch(scope, /website/i);
    if (!Object.hasOwn(changes, 'description')) assert.doesNotMatch(scope, /description/i);
  });
}
