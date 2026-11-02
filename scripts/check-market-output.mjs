import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { load } from 'cheerio';

// Run after a fresh build: node --import tsx scripts/check-market-output.mjs
const require = createRequire(import.meta.url);
const { getMarketClubs, getMarketGuideGate } = require('../lib/markets.ts');
const { clubAliases, getClubBySlug } = require('../lib/data.ts');
const root = '.next/server/app';
const readPage = path => readFileSync(join(root, `${path}.html`), 'utf8');
const clubs = getMarketClubs('sf-bay-area');
const gate = getMarketGuideGate(clubs);
const sitemap = readFileSync(join(root, 'sitemap.xml.body'), 'utf8');
const locations = load(sitemap, { xmlMode: true })('loc').map((_, element) => load(element).text()).get();
const redirects = JSON.parse(readFileSync('.next/routes-manifest.json', 'utf8')).redirects;
const checked = [];

for (const club of clubs) {
  const html = readPage(`clubs/${club.slug}`);
  const $ = load(html);
  assert.equal($('h1').text(), club.name);
  const schemas = $('script[type="application/ld+json"]').map((_, element) => JSON.parse($(element).text())).get();
  const organization = schemas.find(schema => schema['@id']?.endsWith(`/clubs/${club.slug}#organization`));
  assert.ok(organization, `Missing organization for ${club.slug}`);
  assert.equal(organization.address.addressLocality, club.City);
  assert.equal(organization.address.addressRegion, club.stateName);
  assert.ok(locations.some(url => url.endsWith(`/clubs/${club.slug}`)));
  assert.ok($('[aria-label="Published riding and membership information"] time').length > 0);
  checked.push(club.slug);
}
for (const alias of clubAliases) {
  assert.ok(redirects.some(rule => rule.source === `/clubs/${alias.aliasSlug}` && rule.destination === `/clubs/${alias.canonicalSlug}` && rule.statusCode === 308));
  assert.ok(!locations.some(url => url.endsWith(`/clubs/${alias.aliasSlug}`)));
  assert.ok(getClubBySlug(alias.aliasSlug)?.slug === alias.canonicalSlug);
}
const guidePath = 'guides/motorcycle-clubs-san-francisco-bay-area';
if (gate.eligible) {
  const $ = load(readPage(guidePath));
  assert.equal($('[data-market] tbody tr').length, clubs.length);
  assert.ok(locations.some(url => url.endsWith(`/${guidePath}`)));
}
const basic = readPage('clubs/it-was-the-first-american-branch-of-the-norton-owners-club-san-francisco-ca');
assert.match(basic, /noindex/);
assert.doesNotMatch(basic, /pagead2\.googlesyndication\.com|amazon\.com/);
assert.equal(load(readPage('city/ca/campbell'))('[data-market] tbody tr').length, 2);
assert.equal(load(readPage('city/ca/petaluma'))('[data-market]').length, 0);
assert.equal(load(readPage('clubs/raw-iron-brotherhood-mc-milwaukee-wi'))('[data-market]').length, 0);
for (const path of ['search', 'privacy', 'terms', 'chapters/cvma', '_not-found']) {
  assert.doesNotMatch(readPage(path), /pagead2\.googlesyndication\.com/);
}
function walk(directory) {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}
const files = [...walk(root).filter(path => /\.(html|rsc|txt|body)$/.test(path)), ...walk('.next/static').filter(path => path.endsWith('.js'))];
for (const file of files) assert.doesNotMatch(readFileSync(file, 'utf8'), /reviewNote|factNotes|expectedName/, `Private review fields leaked in ${file}`);
const report = { reviewedEntities: clubs.length, gate, aliases: clubAliases.length, sitemapUrls: locations.length,
  publicFilesScanned: files.length, canonicalProfilesChecked: checked, privateFieldsAbsent: true };
mkdirSync('work/market-depth', { recursive: true });
writeFileSync('work/market-depth/output-check.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
