import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import VerifiedChapterHub from '@/components/VerifiedChapterHub';
import Footer from '@/components/Footer';
import ChaptersPage from '@/app/chapters/page';
import { generateStaticParams, generateMetadata } from '@/app/chapters/[org]/page';
import { CHAPTER_ORGS } from '@/lib/chapter-orgs';
import { getAllClubs, isListableClub } from '@/lib/data';
import { getVerifiedChapterOrgs, isIndexableVerifiedOrg } from '@/lib/verified-chapters';
import sitemap from '@/app/sitemap';
import { SITE_URL } from '@/lib/utils';
import { reviewedOrg } from '../fixtures/verified-chapters';

test('reviewed city-only hubs show provenance and limitations without manufacturing a Maps link', () => {
  const org = reviewedOrg();
  const $ = load(renderToStaticMarkup(createElement(VerifiedChapterHub, { org })));
  assert.match($('h1').text(), /Example Motorcycle Club/);
  assert.equal($('section[aria-label="Sources and review dates"] time').attr('datetime'), '2026-11-01');
  assert.equal($('section[aria-label="Sources and review dates"] a').attr('href'), 'https://example.org/chapters');
  assert.match($('section[aria-label="Coverage limitations"]').text(), /not a complete membership roster/);
  const chapter = $('#state-tx').closest('section').find('li');
  assert.match(chapter.text(), /Austin Chapter.*Austin/);
  assert.match(chapter.text(), /City only/);
  assert.equal(chapter.find('a').attr('href'), org.chapters[0].sourceUrl);
  assert.equal($('a[href*="maps"]').length, 0);
  assert.equal($('a[href^="/clubs/"]').length, 0);
  assert.equal($('script').length, 0);
});

test('address, actual Maps URL and eligible explicitly matched profiles render as separate links', () => {
  const org = reviewedOrg();
  const club = getAllClubs().find(isListableClub)!;
  Object.assign(org.chapters[0], { city: club.City, state: club.State, existingClubSlug: club.slug, address: '123 Public Street', mapsUrl: 'https://maps.google.com/?cid=123', website: 'https://chapter.example.org/' });
  const $ = load(renderToStaticMarkup(createElement(VerifiedChapterHub, { org })));
  assert.equal($('a[href="https://maps.google.com/?cid=123"]').length, 1);
  assert.equal($(`a[href="/clubs/${club.slug}"]`).length, 1);
  assert.equal($('a[href="https://chapter.example.org/"]').length, 1);
  assert.match($.text(), /123 Public Street/);
  assert.doesNotMatch($.text(), /City only/);
});

test('legacy routes and indexing are preserved while reviewed hubs get static routes and sitemap entries', async () => {
  const orgs = getVerifiedChapterOrgs();
  const fixture = reviewedOrg();
  orgs.push(fixture);
  try {
    const params = generateStaticParams();
    for (const org of CHAPTER_ORGS) assert.ok(params.some((p) => p.org === org.slug));
    const cvma = await generateMetadata({ params: Promise.resolve({ org: 'cvma' }) });
    const wow = await generateMetadata({ params: Promise.resolve({ org: 'wow' }) });
    assert.equal(cvma.robots, undefined);
    assert.deepEqual(wow.robots, { index: false, follow: true });
    const urls = new Set(sitemap().map((entry) => entry.url));
    for (const org of getVerifiedChapterOrgs()) {
      assert.ok(params.some((p) => p.org === org.slug), org.slug);
      assert.equal(urls.has(`${SITE_URL}/chapters/${org.slug}`), isIndexableVerifiedOrg(org));
    }
    const reviewed = await generateMetadata({ params: Promise.resolve({ org: fixture.slug }) });
    assert.equal(reviewed.robots, undefined);
    fixture.chapters = [];
    const pending = await generateMetadata({ params: Promise.resolve({ org: fixture.slug }) });
    assert.deepEqual(pending.robots, { index: false, follow: true });
  } finally { orgs.pop(); }
});

test('the footer and chapter index make all organization hubs discoverable', () => {
  const orgs = getVerifiedChapterOrgs(); orgs.push(reviewedOrg());
  try {
    const footer = load(renderToStaticMarkup(createElement(Footer)));
    assert.equal(footer('a[href="/chapters"]').length, 1);
    const $ = load(renderToStaticMarkup(createElement(ChaptersPage)));
    for (const org of [...CHAPTER_ORGS, ...getVerifiedChapterOrgs()]) {
      assert.equal($(`a[href="/chapters/${org.slug}"]`).length, 1, org.slug);
    }
  } finally { orgs.pop(); }
});

test('state pages link relevant reviewed hubs with a state anchor', async () => {
  const orgs = getVerifiedChapterOrgs(); orgs.push(reviewedOrg());
  try {
    const { default: StatePage } = await import('@/app/state/[code]/page');
    const texas = load(renderToStaticMarkup(await StatePage({ params: Promise.resolve({ code: 'tx' }) })));
    const california = load(renderToStaticMarkup(await StatePage({ params: Promise.resolve({ code: 'ca' }) })));
    assert.equal(texas('a[href="/chapters/example-mc#state-tx"]').length, 1);
    assert.equal(california('a[href="/chapters/example-mc#state-ca"]').length, 0);
  } finally { orgs.pop(); }
});

test('pending organization hub explains absent city coverage without fabricated locations', () => {
  const org = reviewedOrg(); org.chapters = [];
  const $ = load(renderToStaticMarkup(createElement(VerifiedChapterHub, { org })));
  assert.match($.text(), /City-level chapter coverage pending/);
  assert.equal($('[id^="state-"]').length, 0);
  assert.equal($('section[aria-label="Sources and review dates"] time').length, 1);
});

test('state-only roster is labelled separately and preserves the state discovery anchor', () => {
  const org = { ...reviewedOrg(), chapters: [], stateCoverage: [{ state: 'ca', sourceUrl: 'https://example.org/chapters', evidence: 'Roster identifies California only.' }] };
  const $ = load(renderToStaticMarkup(createElement(VerifiedChapterHub, { org })));
  const coverage = $('section[aria-label="States listed by the organization"]');
  assert.match(coverage.text(), /California/);
  assert.match(coverage.text(), /no city locations/i);
  assert.equal(coverage.find('#state-ca').length, 1);
  assert.equal(coverage.find('a[href="/state/ca"]').length, 1);
  assert.equal(coverage.find('a[href="https://example.org/chapters"]').length, 1);
  assert.equal(coverage.find('time').attr('datetime'), '2026-11-01');
  assert.match($.text(), /City-level chapter coverage pending/);
  assert.doesNotMatch($.text(), /\b\d+ source-listed US chapter locations/);
});

test('organization and roster URLs are not mislabelled as chapter contact pages', () => {
  for (const website of ['https://example.org/', 'https://example.org/chapters']) {
    const org = reviewedOrg(); org.chapters[0].website = website;
    const $ = load(renderToStaticMarkup(createElement(VerifiedChapterHub, { org })));
    const row = $('#state-tx').closest('section').find('li');
    assert.equal(row.find('a').length, 1);
    assert.equal(row.find('a').text(), 'Chapter source');
    assert.doesNotMatch(row.text(), /contact page/i);
  }
});
