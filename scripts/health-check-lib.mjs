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

/**
 * @param {{status:number, finalUrl:string, html:string, host:string, adScript:boolean}} page
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
  if (adScript && !html.includes(AD_SCRIPT)) problems.push('ad script missing');
  return problems;
}
