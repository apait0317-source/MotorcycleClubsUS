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
const supported = (slug: string): Club => {
  const row = club(slug, { description: 'An Austin riding club with published membership information and organized group rides.' });
  row.editorial = {
    placeId: row.place_id, expectedName: row.name, listingStatus: 'confirmed-club', changes: { description: row.description },
    verifiedAt: '2026-01-02', reviewNote: 'Reviewed official source',
    evidence: [{ url: 'https://example.org', checkedAt: '2026-01-01', fields: ['description', 'listingStatus'],
      factNotes: ['Austin riding club', 'Membership information', 'Group rides'] }],
  };
  return row;
};

test('projects only the additional description points', () => {
  const result = auditContent([club('empty'), club('short', { description: 'Short description', reviews: 0 })]);
  assert.deepEqual(result.candidates.map(c => [c.slug, c.score, c.descriptionPoints, c.potentialScoreAfterDescription]),
    [['empty', 3, 0, 5], ['short', 3, 1, 4]]);
});

test('retains every record and audits thin and demoted real clubs while excluding categories and chapters', () => {
  const excluded = supported('excluded');
  excluded.editorial!.listingStatus = 'excluded';
  const result = auditContent([club('demoted'), club('bar', { main_category: 'Bar' }),
    club('chapter', { place_id: 'cvma_test' }), club('thin', { phone: '', reviews: 0 }), supported('reviewed'), excluded]);
  assert.equal(result.recordCount, 6);
  assert.equal(result.records.length, 6);
  assert.equal(result.listableCount, 1);
  assert.deepEqual(result.listableScoreHistogram, { 5: 1 });
  assert.equal(result.missingDescriptionCount, 0, 'existing field describes the promoted cohort');
  assert.deepEqual(result.candidates.map(c => c.slug), ['demoted', 'thin']);
  assert.equal(result.eligibleRecordCount, 3);
  assert.equal(result.sourceBackedDescriptionCount, 1);
  assert.equal(result.unsupportedDescriptionCount, 2);
  assert.equal(result.previouslyScoreEligibleCount, 2);
  assert.equal(result.demotedCount, 1);
  assert.deepEqual(result.candidates.map(c => [c.slug, c.sourceBackedDescription, c.previouslyScoreEligible]),
    [['demoted', false, true], ['thin', false, false]]);
});

test('high-score unsourced prose and classification-only review enter the backlog', () => {
  const unreviewed = club('unsourced', { description: 'x'.repeat(60), address: '1 Road, Austin, TX' });
  const classified = supported('classified');
  classified.editorial!.changes = {};
  classified.editorial!.evidence[0].fields = ['listingStatus'];
  const result = auditContent([unreviewed, classified, supported('complete')]);
  assert.deepEqual(result.candidates.map(c => c.slug), ['classified', 'unsourced']);
  assert.ok(result.candidates.every(candidate => candidate.missingFields.includes('description')));
  assert.equal(result.listableAtLeastFive, 1);
  assert.deepEqual(result.records.map(row => [row.slug, row.score, row.listable, row.sourceBackedDescription]),
    [['unsourced', 6, false, false], ['classified', 5, false, false], ['complete', 5, true, true]]);
});

test('ranks website, reaching five, low score and stable slug without mutating inputs', () => {
  const rows = [club('z'), club('a'), club('no-site', { website: '', address: '1 Road, Austin, TX' }),
    club('four', { address: '1 Road, Austin, TX' }), supported('complete')];
  assert.deepEqual(auditContent(rows).candidates.map(c => c.slug), ['a', 'z', 'four', 'no-site']);
  assert.deepEqual(rows.map(c => c.slug), ['z', 'a', 'no-site', 'four', 'complete']);
  assert.equal(auditContent(rows).listableAtLeastFive, 1);
});
