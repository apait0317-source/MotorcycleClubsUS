import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAllClubs, getMotorcycleClubs, searchClubs } from '@/lib/data';
import { toPublicClub } from '@/lib/club-projection';
import { filterPublicClubs } from '@/lib/public-clubs';

test('public projection serializes only public fields, without editorial evidence or notes', () => {
  const enriched = getAllClubs().find((club) => club.editorial)!;
  assert.ok(enriched.editorial);
  const projected = toPublicClub(enriched);
  assert.equal('editorial' in projected, false);
  assert.doesNotMatch(JSON.stringify(projected), /reviewNote|factNotes|listingStatus/);
  assert.equal(projected.name, enriched.name);
  assert.equal(projected.address, enriched.address);
});

test('cards expose an approved summary but never unreviewed or stale description text', () => {
  const reviewed = getAllClubs().find((club) => club.editorial?.listingStatus === 'confirmed-club'
    && club.editorial.changes.description)!;
  assert.equal(toPublicClub(reviewed).summary, reviewed.description);
  assert.equal(toPublicClub({ ...reviewed, editorial: undefined }).summary, undefined);
  assert.equal(toPublicClub({ ...reviewed, description: 'An unreviewed replacement.' }).summary, undefined);
  assert.doesNotMatch(JSON.stringify(toPublicClub(reviewed)), /factNotes|reviewNote|listingStatus/);
});

test('chapter search results lead to their organization hub and retained chapter entry', () => {
  const chapter = getMotorcycleClubs().find((club) => club.place_id.startsWith('cvma_'))!;
  assert.equal(toPublicClub(chapter).directoryHref, `/chapters/cvma#${chapter.slug}`);
});

test('a supported summary below the detail floor cannot create a promoted profile link', () => {
  const reviewed = getAllClubs().find((club) => club.editorial?.changes.description)!;
  const lowDetail = { ...reviewed, place_id: 'projection-no-photo', website: '', phone: '', address: '', reviews: 0 };
  assert.equal(toPublicClub(lowDetail).summary, undefined);
  assert.equal(toPublicClub(lowDetail).directoryHref, `/state/${lowDetail.State}#${lowDetail.slug}`);
});

test('public search matches private search for name, city, state, address and state filters', () => {
  const publicClubs = getMotorcycleClubs().map(toPublicClub);
  const fixture = getMotorcycleClubs().find((club) => club.address && club.City)!;
  for (const query of [fixture.name, fixture.City, fixture.stateName, fixture.address, 'motorcycle', '']) {
    for (const state of [undefined, 'CA', 'zz']) {
      assert.deepEqual(filterPublicClubs(publicClubs, query, state).map((club) => club.place_id),
        searchClubs(query, state).map((club) => club.place_id));
    }
  }
});

test('excluded listings never enter the public search dataset', () => {
  const slugs = new Set(getMotorcycleClubs().map(toPublicClub).map((club) => club.slug));
  const excluded = getAllClubs().filter((club) => club.editorial?.listingStatus === 'excluded');
  assert.ok(excluded.length > 0);
  assert.ok(excluded.every((club) => !slugs.has(club.slug)));
  // A shared source ID does not exclude independently reviewed sibling routes.
  const sibling = getMotorcycleClubs()[0];
  const excludedSibling = { ...sibling, slug: `${sibling.slug}-excluded-fixture`, editorial: {
    ...sibling.editorial!, listingStatus: 'excluded' as const, changes: {},
  } };
  const all = getAllClubs();
  all.push(excludedSibling);
  try {
    const publicSlugs = new Set(getMotorcycleClubs().map(toPublicClub).map(club => club.slug));
    assert.ok(publicSlugs.has(sibling.slug));
    assert.ok(!publicSlugs.has(excludedSibling.slug));
  } finally { all.splice(all.indexOf(excludedSibling), 1); }
});

test('client module dependency graph cannot reach private club data', async () => {
  const { readFileSync, readdirSync, existsSync } = await import('node:fs');
  const { resolve, dirname } = await import('node:path');
  const root = process.cwd();
  const files = ['app', 'components'].flatMap((dir) => readdirSync(resolve(root, dir), { recursive: true })
    .map((file) => resolve(root, dir, String(file))).filter((file) => /\.tsx?$/.test(file)));
  const visited = new Set<string>();
  function visit(file: string) {
    if (visited.has(file)) return;
    visited.add(file);
    assert.ok(!/\/(?:data\/(?:clubs|club-enrichment|club-aliases|market-pilots|content-source-baselines)\.json|lib\/(?:data|enrichment|markets|market-projection|club-aliases)\.ts)$/.test(file), file);
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/(?:import|export)\s+(?!type\b)[^;]*?\sfrom\s+['"]([^'"]+)['"]/g)) {
      const name = match[1];
      if (!name.startsWith('.') && !name.startsWith('@/')) continue;
      const base = name.startsWith('@/') ? resolve(root, name.slice(2)) : resolve(dirname(file), name);
      const target = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].find(existsSync);
      if (target) visit(target);
    }
  }
  files.filter((file) => /^['"]use client['"]/.test(readFileSync(file, 'utf8'))).forEach(visit);
});
