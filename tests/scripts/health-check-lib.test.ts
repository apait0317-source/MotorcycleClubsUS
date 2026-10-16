import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSitemapUrls, sampleEvenly, withinTolerance, checkPage } from '../../scripts/health-check-lib.mjs';

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
