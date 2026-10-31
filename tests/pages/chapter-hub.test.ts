import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import sitemap from '@/app/sitemap';
import { CHAPTER_ORGS } from '@/lib/chapter-orgs';
import { getChapterListings, isChapterListing, getAllClubs } from '@/lib/data';
import { SITE_URL } from '@/lib/utils';

const page = readFileSync(join(process.cwd(), 'app/chapters/[org]/page.tsx'), 'utf8');

test('the hub page is static, covers only configured organizations, and carries no ads', () => {
  assert.match(page, /export const dynamicParams = false/);
  assert.match(page, /generateStaticParams/);
  assert.doesNotMatch(page, /AdSenseLoader|AdSlot|adsbygoogle/);
});

test('the sitemap lists one hub per organization and no chapter-list club page', () => {
  const urls = sitemap().map((entry) => entry.url);
  for (const org of CHAPTER_ORGS) assert.ok(urls.includes(`${SITE_URL}/chapters/${org.slug}`), org.slug);
  const chapterUrls = getAllClubs().filter(isChapterListing).map((c) => `${SITE_URL}/clubs/${c.slug}`);
  assert.deepEqual(chapterUrls.filter((u) => urls.includes(u)), []);
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

test('hub pages never list people by name', () => {
  // Some chapter descriptions name a chapter director. The hub shows chapter name and city only.
  assert.doesNotMatch(page, /director|president|\.description/i);
});
