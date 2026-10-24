#!/usr/bin/env node
// Weekly production check. Requests /ads.txt, /robots.txt, /sitemap.xml and
// about thirty pages (an even spread of twenty plus fixed hubs and non-content
// pages), asserts 200, canonical host, ad script presence on content pages and
// absence on every other page (including /search and the 404 page), and a
// sitemap count within 10% of the last run. Exit 1 on any failure so the
// GitHub Actions job fails and GitHub emails the owner.
//
// Env:
//   SITE_URL           origin to check (default https://www.usmotorcycleclubs.com)
//   HEALTH_STATE_FILE  where the last sitemap count is kept (default .health/sitemap-count)
//   EXPECT_AD_SCRIPT   "false" to skip the AdSense script assertion
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { parseSitemapUrls, pickSample, withinTolerance, checkPage, adScriptRule, hasAdScript } from './health-check-lib.mjs';

const SITE_URL = (process.env.SITE_URL || 'https://www.usmotorcycleclubs.com').replace(/\/$/, '');
const HOST = new URL(SITE_URL).host;
const SAMPLE_SIZE = 20;
const TOLERANCE = 0.1;
const STATE_FILE = process.env.HEALTH_STATE_FILE || '.health/sitemap-count';
const EXPECT_AD_SCRIPT = process.env.EXPECT_AD_SCRIPT !== 'false';

const failures = [];
const fail = (msg) => { failures.push(msg); console.log(`FAIL ${msg}`); };
const pass = (msg) => console.log(`ok   ${msg}`);

const REQUEST_TIMEOUT_MS = 15_000;

async function get(path) {
  const res = await fetch(`${SITE_URL}${path}`, {
    redirect: 'follow',
    headers: { 'user-agent': 'usmotorcycleclubs-health-check/1.0' },
    // A hung connection must surface as a named failure, not a 10 minute job timeout.
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  return { status: res.status, finalUrl: res.url, text: await res.text() };
}

// Network errors on the plain files become FAIL lines instead of stack traces.
async function getSafe(path) {
  try {
    return await get(path);
  } catch (err) {
    return { status: 0, finalUrl: '', text: '', error: err instanceof Error ? err.message : String(err) };
  }
}

// 1. Plain files
const ads = await getSafe('/ads.txt');
if (ads.status === 200 && /google\.com,\s*pub-\d+/.test(ads.text)) pass('/ads.txt');
else fail(`/ads.txt status ${ads.status} or publisher line missing`);

const robots = await getSafe('/robots.txt');
if (robots.status === 200 && robots.text.includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) pass('/robots.txt');
else fail(`/robots.txt status ${robots.status} or sitemap line missing`);

const sitemap = await getSafe('/sitemap.xml');
const urls = sitemap.status === 200 ? parseSitemapUrls(sitemap.text) : [];
if (urls.length > 0) pass(`/sitemap.xml (${urls.length} urls)`);
else fail(`/sitemap.xml status ${sitemap.status} or empty`);

const offHost = urls.filter((u) => new URL(u).host !== HOST);
if (offHost.length === 0) pass('sitemap hosts');
else fail(`${offHost.length} sitemap urls on another host, e.g. ${offHost[0]}`);

// 2. Sitemap count against the last run. The baseline lives on the health-state
// branch (written by the workflow), so it survives Actions cache eviction.
let previous = null;
try { previous = Number(await readFile(STATE_FILE, 'utf8')); } catch { /* first run */ }
const countOk = withinTolerance(previous, urls.length, TOLERANCE);
if (countOk) pass(`sitemap count ${urls.length} (last run ${previous ?? 'n/a'})`);
else fail(`sitemap count ${urls.length} differs from last run ${previous} by more than ${TOLERANCE * 100}%`);
// Only a passing run moves the baseline, so a sudden drop keeps failing until someone looks.
if (urls.length > 0 && countOk) {
  await mkdir(dirname(STATE_FILE), { recursive: true });
  await writeFile(STATE_FILE, String(urls.length));
}

// 3. Sample pages: see pickSample for which pages every run fetches.
const sample = pickSample(urls, SITE_URL, SAMPLE_SIZE);
for (const url of sample) {
  const path = new URL(url).pathname;
  try {
    const page = await get(path);
    const problems = checkPage({ status: page.status, finalUrl: page.finalUrl, html: page.text, host: HOST, adScript: EXPECT_AD_SCRIPT ? adScriptRule(path) : false });
    if (problems.length === 0) pass(path);
    else fail(`${path}: ${problems.join(', ')}`);
  } catch (err) {
    fail(`${path}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// 4. Dead-end screens must not load the ad script: Google bans ads on error pages,
// and /search is a noindex results screen with no canonical.
for (const [path, expected, label] of [['/search', 200, '/search'], ['/health-check-404-probe', 404, '404 page']]) {
  const probe = await getSafe(path);
  if (probe.status === expected && !hasAdScript(probe.text)) pass(`${label} carries no ad script`);
  else fail(`${label}: status ${probe.status}${hasAdScript(probe.text) ? ', ad script present' : ''}`);
}

console.log(failures.length ? `\n${failures.length} failure(s)` : '\nAll checks passed');
process.exit(failures.length ? 1 : 0);
