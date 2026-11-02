import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement, isValidElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import StatePage from '@/app/state/[code]/page';
import CityPage from '@/app/city/[state]/[city]/page';
import { generateStaticParams } from '@/app/clubs/[slug]/page';
import HomeClubList from '@/components/home/HomeClubList';
import ClubComparison from '@/components/ClubComparison';
import { getAllClubs } from '@/lib/data';
import { toPublicClub } from '@/lib/club-projection';
import type { PublicComparisonRow } from '@/lib/market-discovery';

function assertUniqueSiblingKeys(node: ReactNode): void {
  if (Array.isArray(node)) {
    const keys = node.filter(isValidElement).map(element => element.key).filter(key => key !== null);
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
    assert.deepEqual(duplicates, [], 'Club siblings must have distinct route identities');
    node.forEach(assertUniqueSiblingKeys);
  } else if (isValidElement<{ children?: ReactNode }>(node)) {
    assertUniqueSiblingKeys(node.props.children);
  }
}

const sharedId = 'ama_amasanjacintohighrol_mjrcua8t';
const houstonClubs = getAllClubs().filter(club => club.place_id === sharedId && club.citySlug === 'houston');

test('same-ID clubs have separate keys in the state directory list', async () => {
  assert.ok(houstonClubs.length >= 2);
  assert.equal(new Set(houstonClubs.map(club => club.slug)).size, houstonClubs.length);
  assertUniqueSiblingKeys(await StatePage({ params: Promise.resolve({ code: 'tx' }) }));
});

test('same-ID clubs have separate keys in the city directory list', async () => {
  assert.ok(houstonClubs.length >= 2);
  assertUniqueSiblingKeys(await CityPage({ params: Promise.resolve({ state: 'tx', city: 'houston' }) }));
});

test('same-ID clubs retain distinct homepage, comparison and static profile routes', async () => {
  const clubs = houstonClubs.slice(0, 2).map(club => ({
    ...toPublicClub(club), directoryHref: `/clubs/${club.slug}`,
  }));
  const rows: PublicComparisonRow[] = clubs.map(club => ({
    id: club.place_id, slug: club.slug, name: club.name, city: club.City, state: club.State,
    profileHref: `/clubs/${club.slug}`, facts: {}, sources: {},
  }));
  const home = load(renderToStaticMarkup(createElement(HomeClubList, { clubs })));
  const comparison = load(renderToStaticMarkup(createElement(ClubComparison, { rows, marketId: 'test', heading: 'Shared-ID clubs' })));
  const routes = new Set((await generateStaticParams()).map(route => route.slug));
  for (const club of clubs) {
    assert.equal(home(`a[href="/clubs/${club.slug}"]`).length, 2);
    assert.equal(comparison(`a[href="/clubs/${club.slug}"]`).length, 2);
    assert.ok(routes.has(club.slug));
    assert.equal(club.place_id, sharedId);
  }
});

// Client hooks prevent direct element-tree inspection, and HTML omits React
// keys. Guard their key expressions and the related-card branch explicitly.
for (const [path, selector] of [
  ['components/home/HomeClubList.tsx', 'club'],
  ['components/SearchResults.tsx', 'club'],
  ['components/ClubComparison.tsx', 'row'],
  ['app/clubs/[slug]/page.tsx', 'relatedClub'],
] as const) {
  test(`${path} uses route identity for club sibling keys`, () => {
    const source = readFileSync(path, 'utf8');
    assert.ok(new RegExp(`key=\\{${selector}\\.slug\\}`).test(source), `${path} must key club siblings by their preserved slug`);
    assert.equal(new RegExp(`key=\\{${selector}\\.(?:place_id|id)\\}`).test(source), false, `${path} must not key club siblings by a shared ID`);
  });
}
