import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAllClubs, getMotorcycleClubs, searchClubs } from '@/lib/data';
import { toPublicClub, filterPublicClubs } from '@/lib/public-clubs';

test('public projection serializes only public fields, without editorial evidence or notes', () => {
  const enriched = getAllClubs().find((club) => club.editorial)!;
  assert.ok(enriched.editorial);
  const projected = toPublicClub(enriched);
  assert.equal('editorial' in projected, false);
  assert.doesNotMatch(JSON.stringify(projected), /reviewNote|factNotes|listingStatus/);
  assert.equal(projected.name, enriched.name);
  assert.equal(projected.address, enriched.address);
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
  const ids = new Set(getMotorcycleClubs().map(toPublicClub).map((club) => club.place_id));
  const excluded = getAllClubs().filter((club) => club.editorial?.listingStatus === 'excluded');
  assert.ok(excluded.length > 0);
  assert.ok(excluded.every((club) => !ids.has(club.place_id)));
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
    assert.ok(!/\/(?:data\/(?:clubs|club-enrichment)\.json|lib\/(?:data|enrichment)\.ts)$/.test(file), file);
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
