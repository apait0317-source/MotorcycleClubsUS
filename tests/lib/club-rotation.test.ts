import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomClubGroup } from '@/lib/club-rotation';

test('rotation replaces all three clubs when the pool permits', () => {
  const next = randomClubGroup(253, [0, 1, 2], () => 0.5);
  assert.equal(next.length, 3);
  assert.equal(new Set(next).size, 3);
  assert.ok(next.every(index => index >= 3 && index < 253));
  assert.notDeepEqual(next, randomClubGroup(253, [0, 1, 2], () => 0));
});

test('small pools remain unique and replace as many clubs as possible', () => {
  for (let count = 0; count <= 5; count++) {
    const previous = Array.from({ length: Math.min(3, count) }, (_, i) => i);
    const next = randomClubGroup(count, previous, () => 0.5);
    assert.equal(next.length, Math.min(3, count));
    assert.equal(new Set(next).size, next.length);
    assert.equal(next.filter(index => previous.includes(index)).length, Math.max(0, next.length - (count - previous.length)));
  }
});
