import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import sitemap from '@/app/sitemap';
import { CHAPTER_ORGS } from '@/lib/chapter-orgs';
import { getChapterListings, isChapterListing, getAllClubs } from '@/lib/data';
import { load } from 'cheerio';
import { SITE_URL } from '@/lib/utils';
import { renderToStaticMarkup } from 'react-dom/server';
import ChapterOrgPage from '@/app/chapters/[org]/page';

const page = readFileSync(join(process.cwd(), 'app/chapters/[org]/page.tsx'), 'utf8');

test('the hub page is static, covers only configured organizations, and carries no ads', () => {
  assert.match(page, /export const dynamicParams = false/);
  assert.match(page, /generateStaticParams/);
  assert.doesNotMatch(page, /AdSenseLoader|AdSlot|adsbygoogle/);
});

test('the sitemap lists only the hubs that are indexed, and no chapter-list club page', () => {
  const urls = sitemap().map((entry) => entry.url);
  for (const org of CHAPTER_ORGS) {
    assert.equal(urls.includes(`${SITE_URL}/chapters/${org.slug}`), org.index, org.slug);
  }
  const chapterUrls = getAllClubs().filter(isChapterListing).map((c) => `${SITE_URL}/clubs/${c.slug}`);
  assert.deepEqual(chapterUrls.filter((u) => urls.includes(u)), []);
});

test('only the CVMA hub is indexed; the Women On Wheels and Sober Riders hubs list names and cities only', () => {
  assert.deepEqual(CHAPTER_ORGS.filter((o) => o.index).map((o) => o.slug), ['cvma']);
  assert.match(page, /robots:\s*\{\s*index:\s*false/);
});

test('each hub has chapters to show', () => {
  for (const org of CHAPTER_ORGS) assert.ok(getChapterListings(org.slug).length >= 10, org.slug);
});

test('organization copy follows the copy rules', () => {
  for (const org of CHAPTER_ORGS) {
    const text = org.about.join(' ');
    assert.doesNotMatch(text, /[–—]/, `${org.slug} uses a dash`);
    assert.doesNotMatch(text, /\b(largest|oldest|best|premier|leading|most)\b/i, `${org.slug} makes a superlative claim`);
    assert.ok(org.about.length >= 2, org.slug);
  }
});

test('legacy hub pages do not expose chapter descriptions that may name people', async () => {
  const chapter = getChapterListings('cvma')[0];
  const original = chapter.description;
  try {
    chapter.description = 'PRIVATE CHAPTER PRESIDENT: a person who must not appear in hub copy.';
    const html = renderToStaticMarkup(await ChapterOrgPage({ params: Promise.resolve({ org: 'cvma' }) }));
    assert.doesNotMatch(html, /PRIVATE CHAPTER PRESIDENT/);
  } finally { chapter.description = original; }
});

test('legacy hubs show only approved matching descriptions with public sources and review dates', async () => {
  const chapter = getChapterListings('cvma')[0];
  const original = structuredClone(chapter);
  const description = 'This chapter publishes a public annual benefit ride for local veterans.';
  try {
    chapter.description = description;
    chapter.editorial = {
      placeId: chapter.place_id, expectedName: chapter.name, listingStatus: 'confirmed-club',
      changes: { description }, verifiedAt: '2026-11-02', reviewNote: 'PRIVATE CHAPTER REVIEW',
      evidence: [
        { url: 'https://chapter.example.org/ride', checkedAt: '2026-11-01', fields: ['description', 'listingStatus'],
          factNotes: ['PRIVATE CHAPTER FACT', 'Annual public ride', 'Veterans benefit'] },
        { url: 'https://chapter.example.org/ride', checkedAt: '2026-11-02', fields: ['description'], factNotes: ['More evidence'] },
      ],
    };
    const $ = load(renderToStaticMarkup(await ChapterOrgPage({ params: Promise.resolve({ org: 'cvma' }) })));
    const row = $(`#${chapter.slug}`);
    assert.match(row.text(), /This chapter publishes a public annual benefit ride/);
    assert.equal(row.find('time').attr('datetime'), '2026-11-02');
    assert.equal(row.find('a[href="https://chapter.example.org/ride"]').length, 1);
    assert.doesNotMatch($.html(), /PRIVATE CHAPTER REVIEW|PRIVATE CHAPTER FACT|adsbygoogle/);
    chapter.description = 'Unreviewed prose replacing the approved chapter description.';
    const stale = renderToStaticMarkup(await ChapterOrgPage({ params: Promise.resolve({ org: 'cvma' }) }));
    assert.doesNotMatch(stale, /Unreviewed prose|This chapter publishes a public annual benefit ride/);
  } finally { Object.assign(chapter, original); if (!original.editorial) delete chapter.editorial; }
});

test('hub copy makes no claim the data cannot support', () => {
  assert.doesNotMatch(page, /territories/i);
  assert.doesNotMatch(page, /organization(&apos;|')s (own )?chapter list/i);
  assert.doesNotMatch(page, /\.slice\(0,\s*155\)/);
});

test('hub section ids are valid: built from the state code, never the state name', () => {
  assert.match(page, /id=\{`state-\$\{[^}]*code[^}]*\}`\}/i);
});
