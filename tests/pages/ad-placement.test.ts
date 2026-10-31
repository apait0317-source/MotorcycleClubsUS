import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// Source-level guard for the ad rules in CLAUDE.md. Google forbids ads on error,
// thank-you, and other dead-end screens, so the loader and the fixed units may
// appear only on content pages. These checks fail the build before that drifts.

const ROOT = process.cwd();
const APP = join(ROOT, 'app');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const pages = walk(APP).filter((f) => /\/(page|not-found|layout)\.tsx$/.test(f));
const read = (file: string) => readFileSync(file, 'utf8');
const rel = (file: string) => relative(APP, file);

const CONTENT_PAGES = [
  'page.tsx',
  'states/page.tsx',
  'cities/page.tsx',
  'guides/page.tsx',
  'guides/[slug]/page.tsx',
  'state/[code]/page.tsx',
  'city/[state]/[city]/page.tsx',
  'clubs/[slug]/page.tsx',
];

const NON_CONTENT = [
  'about/page.tsx',
  'contact/page.tsx',
  'contact/layout.tsx',
  'submit/page.tsx',
  'search/page.tsx',
  'search/layout.tsx',
  'privacy/page.tsx',
  'terms/page.tsx',
  'disclaimer/page.tsx',
  'chapters/[org]/page.tsx',
  'not-found.tsx',
  'layout.tsx',
];

test('the root layout does not load AdSense', () => {
  const layout = read(join(APP, 'layout.tsx'));
  assert.doesNotMatch(layout, /adsbygoogle|googlesyndication|AdSenseLoader|AdSlot/);
});

test('every content page renders the AdSense loader', () => {
  for (const file of CONTENT_PAGES) {
    assert.match(read(join(APP, file)), /<AdSenseLoader\s*\/>/, `${file} is missing <AdSenseLoader />`);
  }
});

test('dead-end and non-content pages never load AdSense or render ad units', () => {
  for (const file of NON_CONTENT) {
    const src = read(join(APP, file));
    assert.doesNotMatch(src, /AdSenseLoader|AdSlot|adsbygoogle|googlesyndication/, `${file} must not carry ads`);
  }
});

test('any page with a fixed ad unit also renders the loader', () => {
  for (const file of pages) {
    const src = read(file);
    if (/<AdSlot\b/.test(src)) assert.match(src, /<AdSenseLoader\s*\/>/, `${rel(file)} has an AdSlot but no loader`);
  }
});

test('club, city, and state pages show ads only when the page is indexable', () => {
  const club = read(join(APP, 'clubs/[slug]/page.tsx'));
  const city = read(join(APP, 'city/[state]/[city]/page.tsx'));
  const state = read(join(APP, 'state/[code]/page.tsx'));
  assert.match(club, /\{indexable && <AdSenseLoader \/>\}/);
  assert.match(city, /\{indexable && <AdSenseLoader \/>\}/);
  assert.match(state, /\{indexable && <AdSenseLoader \/>\}/);
  for (const [name, src] of [['club', club], ['city', city], ['state', state]] as const) {
    const slots = src.match(/<AdSlot\b[^>]*>/g) || [];
    assert.ok(slots.length > 0, `${name} page has no AdSlot`);
    for (const slot of slots) {
      const at = src.indexOf(slot);
      const before = src.slice(Math.max(0, at - 160), at);
      assert.match(before, /indexable\s*&&|shouldInsertInFeedAd/, `${name} page renders an ungated ${slot}`);
    }
  }
});
