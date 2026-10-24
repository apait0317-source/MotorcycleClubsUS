import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatReviews, getStateName, joinNames, lowerFirst } from '@/lib/utils';

test('review counts read naturally and can name their source', () => {
  assert.equal(formatReviews(0), 'No reviews');
  assert.equal(formatReviews(1), '1 review');
  assert.equal(formatReviews(5), '5 reviews');
  assert.equal(formatReviews(0, 'Google'), 'No reviews');
  assert.equal(formatReviews(1, 'Google'), '1 Google review');
  assert.equal(formatReviews(12, 'Google'), '12 Google reviews');
});

test('every state code in states.json has a written-out name', async () => {
  const states = (await import('@/data/states.json')).default as { code: string; name: string }[];
  for (const s of states) assert.equal(getStateName(s.code), s.name, s.code);
});

test('joinNames reads naturally for one, two, and many items', () => {
  assert.equal(joinNames([]), '');
  assert.equal(joinNames(['Bangor']), 'Bangor');
  assert.equal(joinNames(['Bangor', 'Portland']), 'Bangor and Portland');
  assert.equal(joinNames(['Bangor', 'Gray', 'Portland']), 'Bangor, Gray, and Portland');
});

test('lowerFirst lowercases an initial capital but keeps acronyms and later capitals', () => {
  assert.equal(lowerFirst('Traditional MCs and riding clubs'), 'traditional MCs and riding clubs');
  assert.equal(lowerFirst("Women's clubs"), "women's clubs");
  assert.equal(lowerFirst('MC clubs'), 'MC clubs');
  assert.equal(lowerFirst(''), '');
});
