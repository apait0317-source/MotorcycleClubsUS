import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSitemapUrls, sampleEvenly, pickSample, withinTolerance, checkPage, adScriptRule, hasAdScript } from '../../scripts/health-check-lib.mjs';

const HOST = 'www.usmotorcycleclubs.com';
const AD = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1"></script>';
const CANON = `<link rel="canonical" href="https://${HOST}/state/tx"/>`;

test('parses <loc> entries from a sitemap', () => {
  const xml = `<urlset><url><loc>https://a/1</loc></url><url><loc> https://a/2 </loc></url></urlset>`;
  assert.deepEqual(parseSitemapUrls(xml), ['https://a/1', 'https://a/2']);
});

test('samples evenly across the list and keeps short lists whole', () => {
  const items = Array.from({ length: 100 }, (_, i) => i);
  const picked = sampleEvenly(items, 20);
  assert.equal(picked.length, 20);
  assert.equal(picked[0], 0);
  assert.equal(picked[19], 95);
  assert.deepEqual(sampleEvenly([1, 2, 3], 20), [1, 2, 3]);
});

test('tolerance compares against the previous count', () => {
  assert.equal(withinTolerance(null, 500, 0.1), true);
  assert.equal(withinTolerance(1000, 950, 0.1), true);
  assert.equal(withinTolerance(1000, 1100, 0.1), true);
  assert.equal(withinTolerance(1000, 880, 0.1), false);
  assert.equal(withinTolerance(1000, 1120, 0.1), false);
});

test('a healthy page reports no problems', () => {
  const problems = checkPage({ status: 200, finalUrl: `https://${HOST}/state/tx`, html: `<html><head>${AD}${CANON}</head></html>`, host: HOST, adScript: true });
  assert.deepEqual(problems, []);
});

test('bad status, wrong host, missing canonical, and missing ad script are reported', () => {
  const problems = checkPage({ status: 500, finalUrl: 'https://motorcycle-clubs-us.vercel.app/x', html: '<html></html>', host: HOST, adScript: true });
  assert.deepEqual(problems, ['status 500', 'served from motorcycle-clubs-us.vercel.app', 'no canonical', 'ad script missing']);
});

test('canonical on another host is reported', () => {
  const problems = checkPage({ status: 200, finalUrl: `https://${HOST}/x`, html: `${AD}<link rel="canonical" href="https://usmotorcycleclubs.com/x"/>`, host: HOST, adScript: true });
  assert.deepEqual(problems, ['canonical host usmotorcycleclubs.com']);
});

test('content pages must carry the ad script and every other page must not', () => {
  for (const path of ['/', '/states', '/cities', '/guides', '/guides/how-to-join-a-motorcycle-club', '/state/tx', '/city/tx/austin', '/clubs/some-club-austin-tx']) {
    assert.equal(adScriptRule(path), 'required', path);
  }
  for (const path of ['/about', '/contact', '/submit', '/privacy', '/terms', '/disclaimer', '/chapters/cvma', '/search', '/nope']) {
    assert.equal(adScriptRule(path), 'forbidden', path);
  }
});

test('an ad script on a page that forbids it is reported', () => {
  const html = `<html><head>${AD}${CANON}</head></html>`;
  const problems = checkPage({ status: 200, finalUrl: `https://${HOST}/contact`, html, host: HOST, adScript: 'forbidden' });
  assert.deepEqual(problems, ['ad script on a page that must not carry ads']);
  const clean = checkPage({ status: 200, finalUrl: `https://${HOST}/contact`, html: `<html><head>${CANON}</head></html>`, host: HOST, adScript: 'forbidden' });
  assert.deepEqual(clean, []);
});

test('required behaves like the old true flag and false skips the check', () => {
  const bare = `<html><head>${CANON}</head></html>`;
  assert.deepEqual(checkPage({ status: 200, finalUrl: `https://${HOST}/state/tx`, html: bare, host: HOST, adScript: 'required' }), ['ad script missing']);
  assert.deepEqual(checkPage({ status: 200, finalUrl: `https://${HOST}/state/tx`, html: bare, host: HOST, adScript: false }), []);
});

test('hasAdScript finds the loader in html', () => {
  assert.equal(hasAdScript(AD), true);
  assert.equal(hasAdScript('<html></html>'), false);
});

test('the sample always includes every hub that must carry the script and every page that must not', () => {
  const site = 'https://www.usmotorcycleclubs.com';
  // Shaped like app/sitemap.ts: static pages first, then guides, states, cities, clubs.
  const urls = [
    site, `${site}/states`, `${site}/cities`, `${site}/guides`, `${site}/about`, `${site}/contact`, `${site}/submit`,
    `${site}/privacy`, `${site}/disclaimer`, `${site}/terms`,
    ...Array.from({ length: 5 }, (_, i) => `${site}/guides/g${i}`),
    ...Array.from({ length: 50 }, (_, i) => `${site}/state/s${i}`),
    ...Array.from({ length: 130 }, (_, i) => `${site}/city/xx/c${i}`),
    ...Array.from({ length: 700 }, (_, i) => `${site}/clubs/club-${i}`),
  ];
  const paths = pickSample(urls, site, 20).map((u) => new URL(u).pathname);
  for (const required of ['/', '/states', '/cities', '/guides', '/state/s0', '/city/xx/c0', '/clubs/club-0', '/guides/g0']) {
    assert.ok(paths.includes(required), `missing ${required}`);
    assert.equal(adScriptRule(required), 'required', required);
  }
  for (const forbidden of ['/about', '/contact', '/submit', '/privacy', '/terms', '/disclaimer', '/chapters/cvma']) {
    assert.ok(paths.includes(forbidden), `missing ${forbidden}`);
    assert.equal(adScriptRule(forbidden), 'forbidden', forbidden);
  }
  assert.equal(new Set(paths).size, paths.length, 'duplicate paths');
  assert.ok(paths.length <= 20 + 15);
});

test('the sample still includes the fixed pages when the sitemap is empty', () => {
  const paths = pickSample([], 'https://x.test', 20).map((u) => new URL(u).pathname);
  assert.ok(paths.includes('/contact') && paths.includes('/states'));
});
