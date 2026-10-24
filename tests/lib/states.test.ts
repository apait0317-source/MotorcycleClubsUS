import { test } from 'node:test';
import assert from 'node:assert/strict';
import clubsData from '@/data/clubs.json';
import citiesData from '@/data/cities.json';
import statesData from '@/data/states.json';
import {
  getAllStates,
  getIndexableStates,
  getListableClubsByState,
  getStateByCode,
  isIndexableState,
  MIN_STATE_CLUBS_FOR_INDEX,
} from '@/lib/data';
import { getStateIntro } from '@/lib/state-intros';

const stateCodes = new Set(statesData.map((s) => s.code));
const clubRows = clubsData as { State: string; stateName: string; citySlug: string }[];
const cityRows = citiesData as { state: string; stateName: string; slug: string }[];

test('every club row belongs to a state in states.json', () => {
  const missing = [...new Set(clubRows.map((c) => c.State).filter((code) => !stateCodes.has(code)))];
  assert.deepEqual(missing, []);
});

test('every city row belongs to a state in states.json', () => {
  const missing = [...new Set(cityRows.map((c) => c.state).filter((code) => !stateCodes.has(code)))];
  assert.deepEqual(missing, []);
});

test('state names are written out and match the names on club and city rows', () => {
  const names = new Map(statesData.map((s) => [s.code, s.name]));
  for (const [code, name] of names) assert.ok(name.length > 2, `${code} name is "${name}"`);
  const wrongClub = clubRows.filter((c) => c.stateName !== names.get(c.State)).map((c) => `${c.State}:${c.stateName}`);
  const wrongCity = cityRows.filter((c) => c.stateName !== names.get(c.state)).map((c) => `${c.state}:${c.stateName}`);
  assert.deepEqual([...new Set(wrongClub)], []);
  assert.deepEqual([...new Set(wrongCity)], []);
});

test('club and city counts in states.json match the data', () => {
  for (const state of statesData) {
    const rows = clubRows.filter((c) => c.State === state.code);
    assert.equal(state.clubCount, rows.length, `${state.code} clubCount`);
    assert.equal(state.cityCount, new Set(rows.map((c) => c.citySlug)).size, `${state.code} cityCount`);
  }
});

test('all 50 states plus the District of Columbia and Puerto Rico are listed', () => {
  assert.equal(getAllStates().length, 52);
  assert.ok(getStateByCode('me'));
  assert.equal(getStateByCode('pr')?.name, 'Puerto Rico');
});

test('a state page is indexable only when it has a listable club', () => {
  assert.ok(MIN_STATE_CLUBS_FOR_INDEX >= 1);
  for (const state of getAllStates()) {
    assert.equal(
      isIndexableState(state),
      getListableClubsByState(state.code).length >= MIN_STATE_CLUBS_FOR_INDEX,
      state.code,
    );
  }
  const dc = getStateByCode('dc');
  assert.ok(dc);
  assert.equal(isIndexableState(dc), false);
  assert.ok(getIndexableStates().every((s) => s.code !== 'dc'));
  assert.ok(getIndexableStates().some((s) => s.code === 'ca'));
});

test('every indexable state opens with original editorial', () => {
  for (const state of getIndexableStates()) {
    const intro = getStateIntro(state.code);
    assert.ok(intro.length >= 2, `${state.code} has no intro`);
    const words = intro.join(' ').split(/\s+/).length;
    assert.ok(words >= 50, `${state.code} intro is ${words} words`);
  }
});

test('state intros follow the copy rules: no em dashes, no empty paragraphs', () => {
  for (const state of getAllStates()) {
    for (const paragraph of getStateIntro(state.code)) {
      assert.ok(paragraph.trim().length > 0, `${state.code} has an empty paragraph`);
      assert.doesNotMatch(paragraph, /\u2014/, `${state.code} uses an em dash`);
    }
  }
});
