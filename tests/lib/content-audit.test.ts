import test from 'node:test';
import assert from 'node:assert/strict';
import { auditContent } from '../../lib/content-audit';
import type { Club } from '../../lib/types';

const club = (slug: string, changes: Partial<Club> = {}): Club => ({
  place_id: `audit_${slug}`, slug, name: slug, description: '', website: 'https://example.org',
  phone: '555-0100', reviews: 1, rating: 0, address: '', featured_image: '',
  main_category: 'Motorcycle club', categories: '', closed_on: '', link: '', query: '',
  'query-02': '', City: 'Austin', State: 'tx', stateName: 'Texas', citySlug: 'austin', ...changes,
});

test('projects only the additional description points', () => {
  const result = auditContent([club('empty'), club('short', { description: 'Short description', reviews: 0 })]);
  assert.deepEqual(result.candidates.map(c => [c.slug, c.score, c.descriptionPoints, c.potentialScoreAfterDescription]),
    [['empty', 3, 0, 5], ['short', 3, 1, 4]]);
});

test('retains every record but excludes chapter, excluded and thin rows from candidates', () => {
  const result = auditContent([club('valid'), club('bar', { main_category: 'Bar' }),
    club('chapter', { place_id: 'cvma_test' }), club('thin', { phone: '', reviews: 0 })]);
  assert.equal(result.recordCount, 4);
  assert.equal(result.records.length, 4);
  assert.equal(result.listableCount, 1);
  assert.deepEqual(result.listableScoreHistogram, { 3: 1 });
  assert.equal(result.missingDescriptionCount, 1);
  assert.deepEqual(result.candidates.map(c => c.slug), ['valid']);
});

test('ranks website, reaching five, low score and stable slug without mutating inputs', () => {
  const rows = [club('z'), club('a'), club('no-site', { website: '', address: '1 Road, Austin, TX' }),
    club('four', { address: '1 Road, Austin, TX' }), club('complete', { description: 'x'.repeat(60) })];
  assert.deepEqual(auditContent(rows).candidates.map(c => c.slug), ['a', 'z', 'four', 'no-site']);
  assert.deepEqual(rows.map(c => c.slug), ['z', 'a', 'no-site', 'four', 'complete']);
  assert.equal(auditContent(rows).listableAtLeastFive, 1);
});

