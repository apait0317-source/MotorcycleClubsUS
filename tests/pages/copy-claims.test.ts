import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// Source-level guard for the "Content integrity" rules in CLAUDE.md. The data
// does not support these claims, so no page or component may make them.

const ROOT = process.cwd();

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const sources = ['app', 'components', 'lib']
  .flatMap((dir) => walk(join(ROOT, dir)))
  .filter((f) => /\.(ts|tsx)$/.test(f));

const BANNED: { pattern: RegExp; why: string }[] = [
  { pattern: /most comprehensive/i, why: 'unverifiable superlative' },
  { pattern: /largest directory/i, why: 'unverifiable superlative' },
  { pattern: /comprehensive directory/i, why: 'unverifiable superlative' },
  { pattern: /all 50 (US )?states/i, why: 'hardcoded coverage claim; derive it from the data' },
  { pattern: /Recently Added/i, why: 'the data has no added date' },
  { pattern: /States and DC/, why: 'DC has no clubs and Puerto Rico is counted' },
  { pattern: /filtering by location, type/i, why: 'search cannot filter by type' },
  { pattern: /site owner|working session/i, why: 'implies a single operator; never name or hint at the operator' },
];

test('no page, component, or lib file makes a banned claim', () => {
  const hits: string[] = [];
  for (const file of sources) {
    const text = readFileSync(file, 'utf8');
    for (const { pattern, why } of BANNED) {
      if (pattern.test(text)) hits.push(`${relative(ROOT, file)}: ${pattern} (${why})`);
    }
  }
  assert.deepEqual(hits, []);
});

test('ratings are labelled as Google ratings wherever review counts are shown', () => {
  for (const file of ['components/ClubCard.tsx', 'app/clubs/[slug]/page.tsx']) {
    assert.match(readFileSync(join(ROOT, file), 'utf8'), /formatReviews\([^)]*'Google'\)/, file);
  }
});
