#!/usr/bin/env node
// Weekly production check. Requests /ads.txt, /robots.txt, /sitemap.xml and a
// spread of twenty pages, asserts 200, canonical host, ad script presence, and
// a sitemap count within 10% of the last run. Exit 1 on any failure so the
// GitHub Actions job fails and GitHub emails the owner.
//
// Env:
//   SITE_URL           origin to check (default https://www.usmotorcycleclubs.com)
//   HEALTH_STATE_FILE  where the last sitemap count is kept (default .health/sitemap-count)
//   EXPECT_AD_SCRIPT   "false" to skip the AdSense script assertion
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { parseSitemapUrls, sampleEvenly, withinTolerance, checkPage } from './health-check-lib.mjs';

const SITE_URL = (process.env.SITE_URL || 'https://www.usmotorcycleclubs.com').replace(/\/$/, '');
const HOST = new URL(SITE_URL).host;
const SAMPLE_SIZE = 20;
const TOLERANCE = 0.1;
const STATE_FILE = process.env.HEALTH_STATE_FILE || '.health/sitemap-count';
const EXPECT_AD_SCRIPT = process.env.EXPECT_AD_SCRIPT !== 'false';

const failures = [];
const fail = (msg) => { failures.push(msg); console.log(`FAIL ${msg}`); };
const pass = (msg) => console.log(`ok   ${msg}`);

async function get(path) {
  const res = await fetch(`${SITE_URL}${path}`, {
    redirect: 'follow',
    headers: { 'user-agent': 'usmotorcycleclubs-health-check/1.0' },
  });
  return { status: res.status, finalUrl: res.url, text: await res.text() };
}

// 1. Plain files
const ads = await get('/ads.txt');
if (ads.status === 200 && /google\.com,\s*pub-\d+/.test(ads.text)) pass('/ads.txt');
else fail(`/ads.txt status ${ads.status} or publisher line missing`);

const robots = await get('/robots.txt');
if (robots.status === 200 && robots.text.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) pass('/robots.txt');
else fail(`/robots.txt status ${robots.status} or sitemap line missing`);

const sitemap = await get('/sitemap.xml');
const urls = sitemap.status === 200 ? parseSitemapUrls(sitemap.text) : [];
if (urls.length > 0) pass(`/sitemap.xml (${urls.length} urls)`);
else fail(`/sitemap.xml status ${sitemap.status} or empty`);

const offHost = urls.filter((u) => new URL(u).host !== HOST);
if (offHost.length === 0) pass('sitemap hosts');
else fail(`${offHost.length} sitemap urls on another host, e.g. ${offHost[0]}`);

// 2. Sitemap count against the last run
let previous = null;
try { previous = Number(await readFile(STATE_FILE, 'utf8')); } catch { /* first run */ }
if (withinTolerance(previous, urls.length, TOLERANCE)) pass(`sitemap count ${urls.length} (last run ${previous ?? 'n/a'})`);
else fail(`sitemap count ${urls.length} differs from last run ${previous} by more than ${TOLERANCE * 100}%`);
if (urls.length > 0) {
  await mkdir(dirname(STATE_FILE), { recursive: true });
  await writeFile(STATE_FILE, String(urls.length));
}

// 3. Sample pages
for (const url of sampleEvenly(urls, SAMPLE_SIZE)) {
  const path = new URL(url).pathname;
  try {
    const page = await get(path);
    const problems = checkPage({ status: page.status, finalUrl: page.finalUrl, html: page.text, host: HOST, adScript: EXPECT_AD_SCRIPT });
    if (problems.length === 0) pass(path);
    else fail(`${path}: ${problems.join(', ')}`);
  } catch (err) {
    fail(`${path}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

console.log(failures.length ? `\n${failures.length} failure(s)` : '\nAll checks passed');
process.exit(failures.length ? 1 : 0);
