import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import clubsData from '@/data/clubs.json';
import { isTemplateDescription } from '@/lib/data';

// Club descriptions must be in our own words. The data/scraped-*.json files hold
// the third-party text the listings were first built from. If a description
// matches one of those strings word for word, a scrape or merge reintroduced
// copied text: rewrite it before committing (see CLAUDE.md, "Data tooling").

const DATA = join(process.cwd(), 'data');
const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase().replace(/[.!\s]+$/, '');

function collectStrings(value: unknown, out: Set<string>): void {
  if (typeof value === 'string') {
    if (value.length >= 15) out.add(norm(value));
  } else if (Array.isArray(value)) {
    for (const v of value) collectStrings(v, out);
  } else if (value && typeof value === 'object') {
    for (const v of Object.values(value)) collectStrings(v, out);
  }
}

const scraped = new Set<string>();
for (const file of readdirSync(DATA).filter((f) => /^scraped-.*\.json$/.test(f))) {
  collectStrings(JSON.parse(readFileSync(join(DATA, file), 'utf8')), scraped);
}

type Row = {
  place_id: string; slug: string; description: string; name: string; City: string; State: string; stateName: string;
};
const rows = clubsData as Row[];

const words = (s: string) => s.toLowerCase().match(/[a-z0-9]+/g) ?? [];
const LABEL_WORDS = new Set(['chapter', 'of', 'the', 'motorcycle', 'club', 'mc']);
// A label such as "Anniston chapter of Outlaws MC." only restates the row's own name and
// city. It holds no prose to copy, so a scrape file may carry the same words.
function isFieldLabel(r: Row): boolean {
  const own = new Set(words([r.name, r.City, r.State, r.stateName].join(' ')));
  return words(r.description).every((w) => own.has(w) || LABEL_WORDS.has(w));
}

// Bare labels of four words or fewer ("Motorcycle Support Club") carry no prose.
const prose = rows.filter((r) => {
  const d = (r.description || '').trim();
  return d.split(/\s+/).length >= 5 && !isTemplateDescription(d) && !isFieldLabel(r);
});

test('the scraped files are present, so the copy check can fail', () => {
  assert.ok(scraped.size > 1000, `only ${scraped.size} scraped strings found`);
});

test('no club description is copied word for word from a committed scrape file', () => {
  const copied = prose.filter((r) => scraped.has(norm(r.description))).map((r) => r.slug);
  assert.deepEqual(copied.slice(0, 10), [], `${copied.length} copied descriptions`);
});

test('descriptions carry no raw links, handles, phone numbers, or dashes', () => {
  const bad = prose
    .filter((r) => /https?:\/\/|www\.|@\w|\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}|[–—]/i.test(r.description))
    .map((r) => r.slug);
  assert.deepEqual(bad.slice(0, 10), [], `${bad.length} descriptions with raw contact details or dashes`);
});

test('descriptions speak about the club, not to the reader', () => {
  const direct = prose.filter((r) => /\b(we|our|you|your)\b/i.test(r.description) || /\bus\b/.test(r.description)).map((r) => r.slug);
  assert.deepEqual(direct.slice(0, 10), [], `${direct.length} descriptions use we, our, you, or your`);
});

test('descriptions do not name a person in a role', () => {
  // Some chapter lists name a director. A private person's name does not belong in a listing.
  const named = rows.filter((r) => /\b(director|president)\b/i.test(r.description || '')).map((r) => r.slug);
  assert.deepEqual(named.slice(0, 10), [], `${named.length} descriptions name a director or president`);
});
