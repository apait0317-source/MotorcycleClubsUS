import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAllStates, getAllClubs } from '@/lib/data';

test('data files load through the @/ alias', () => {
  assert.equal(getAllStates().length, 52);
  assert.ok(getAllClubs().length > 2000);
});
