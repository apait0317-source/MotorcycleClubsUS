import test from 'node:test';
import assert from 'node:assert/strict';
import { applyReviewedLocation, deriveDirectoryCities } from '@/lib/club-geography';
import { makeReviewedClub } from '../fixtures/market-clubs';

test('reviewed municipalities missing from the import receive coherent city routes', () => {
  const club = applyReviewedLocation(makeReviewedClub(), { city: 'New City', state: 'ca' }, []);
  const imported = [{ name: 'Old Town', slug: 'old-town', state: 'ca', stateName: 'California', clubCount: 9 }];
  const result = deriveDirectoryCities([club], imported);
  assert.deepEqual(result.find(c => c.slug === 'new-city'), { name: 'New City', slug: 'new-city', state: 'ca', stateName: 'California', clubCount: 1 });
  assert.equal(result.find(c => c.slug === 'old-town')?.clubCount, 0);
  assert.equal(imported[0].clubCount, 9);
});

test('an explicit reviewed address replaces legacy geography without changing the profile slug', () => {
  const club = makeReviewedClub();
  const moved = applyReviewedLocation(club, { city: 'Seattle', state: 'wa', address: '2 Pine St, Seattle, WA' }, []);
  assert.equal(moved.State, 'wa');
  assert.equal(moved.stateName, 'Washington');
  assert.equal(moved.address, '2 Pine St, Seattle, WA');
  assert.equal(moved.slug, 'example-riders-old-town-ca');
  assert.equal(club.City, 'Old Town');
});
