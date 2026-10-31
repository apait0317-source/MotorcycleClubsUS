// Pure helpers for scripts/health-check.mjs. Kept dependency-free so the
// GitHub Actions job runs on a bare Node 22 without installing anything.

const AD_SCRIPT = 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

/** @param {string} xml @returns {string[]} */
export function parseSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

/** Evenly spaced sample so every run covers the same spread of page types. */
export function sampleEvenly(items, count) {
  if (items.length <= count) return [...items];
  const step = items.length / count;
  return Array.from({ length: count }, (_, i) => items[Math.floor(i * step)]);
}

// Pages every run must fetch. The first group must carry the ad script, the
// second group must not. An even spread of the sitemap seldom lands on them.
const FIRST_OF = [/^\/state\//, /^\/city\//, /^\/clubs\//, /^\/guides\//];
const FIXED_PATHS = ['/states', '/cities', '/guides', '/about', '/contact', '/submit', '/privacy', '/terms', '/disclaimer', '/chapters/cvma'];

/**
 * The URLs one health run fetches: the home page, the first state, city, club,
 * and guide page, every fixed hub and non-content page, then an even spread of
 * the sitemap.
 * @param {string[]} urls sitemap urls @param {string} siteUrl origin without a trailing slash @param {number} size spread size
 */
export function pickSample(urls, siteUrl, size) {
  const firstMatching = (re) => urls.find((u) => re.test(new URL(u).pathname));
  const mustHave = [siteUrl, ...FIRST_OF.map(firstMatching), ...FIXED_PATHS.map((p) => `${siteUrl}${p}`)].filter(Boolean);
  return [...new Set([...mustHave, ...sampleEvenly(urls, size)])];
}

/** @param {number|null} previous @param {number} current @param {number} pct fraction, 0.1 = 10% */
export function withinTolerance(previous, current, pct) {
  if (previous == null || Number.isNaN(previous)) return true;
  if (previous === 0) return current === 0;
  return Math.abs(current - previous) / previous <= pct;
}

function canonicalHref(html) {
  const tag = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]).find((t) => /\brel=["']canonical["']/i.test(t));
  return tag?.match(/\bhref=["']([^"']+)["']/i)?.[1];
}

/** @param {string} html */
export function hasAdScript(html) {
  return html.includes(AD_SCRIPT);
}

const CONTENT_PATHS = [/^\/$/, /^\/states$/, /^\/cities$/, /^\/guides(\/|$)/, /^\/state\//, /^\/city\//, /^\/clubs\//];

/**
 * Only content pages load the AdSense script. Google bans ads on error,
 * thank-you, and other dead-end screens, so every other page must not.
 * @param {string} pathname @returns {'required'|'forbidden'}
 */
export function adScriptRule(pathname) {
  return CONTENT_PATHS.some((re) => re.test(pathname)) ? 'required' : 'forbidden';
}

/**
 * @param {{status:number, finalUrl:string, html:string, host:string, adScript: boolean|'required'|'forbidden'}} page
 *   adScript: true or 'required' demands the loader, 'forbidden' demands its absence, false skips the check.
 * @returns {string[]} problems, empty when healthy
 */
export function checkPage({ status, finalUrl, html, host, adScript }) {
  const problems = [];
  if (status !== 200) problems.push(`status ${status}`);
  const servedHost = new URL(finalUrl).host;
  if (servedHost !== host) problems.push(`served from ${servedHost}`);
  const canonical = canonicalHref(html);
  if (!canonical) problems.push('no canonical');
  else if (new URL(canonical).host !== host) problems.push(`canonical host ${new URL(canonical).host}`);
  if ((adScript === true || adScript === 'required') && !hasAdScript(html)) problems.push('ad script missing');
  if (adScript === 'forbidden' && hasAdScript(html)) problems.push('ad script on a page that must not carry ads');
  return problems;
}
