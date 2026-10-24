import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchClubs } from '@/lib/data';

test('search matches club names, cities, states, and addresses', () => {
  assert.ok(searchClubs('veterans').length > 0);
  assert.ok(searchClubs('birmingham').some((c) => c.City.toLowerCase() === 'birmingham'));
});

test('search narrows to one state when a state code is given', () => {
  const everywhere = searchClubs('motorcycle');
  const inCalifornia = searchClubs('motorcycle', 'ca');
  assert.ok(inCalifornia.length > 0);
  assert.ok(inCalifornia.length < everywhere.length);
  assert.ok(inCalifornia.every((c) => c.State === 'ca'));
  assert.equal(searchClubs('motorcycle', 'CA').length, inCalifornia.length);
});

test('an empty or unknown state filter does not hide results', () => {
  assert.equal(searchClubs('motorcycle', '').length, searchClubs('motorcycle').length);
  assert.equal(searchClubs('motorcycle', 'zz').length, 0);
});
