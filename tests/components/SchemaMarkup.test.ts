import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import SchemaMarkup from '@/components/SchemaMarkup';
import { makeReviewedClub } from '../fixtures/market-clubs';
import { makeEnrichment } from '../fixtures/market-clubs';
import { applyApprovedEnrichments, validateEnrichments } from '@/lib/enrichment';

test('explicit parent metadata connects a canonical club without importing third-party ratings', () => {
  const html = renderToStaticMarkup(createElement(SchemaMarkup, { type: 'club', club: makeReviewedClub(), parentOrganization: { name: 'Example Organization', url: '/chapters/example' } }));
  const schema = JSON.parse(load(html)('script').text());
  assert.equal(schema.parentOrganization?.name, 'Example Organization');
  assert.equal(schema.parentOrganization?.url, 'https://www.usmotorcycleclubs.com/chapters/example');
  assert.equal(schema.aggregateRating, undefined);
});

test('approved display fields cannot close the JSON-LD script and round-trip as literal text', () => {
  const club = makeReviewedClub();
  const review = makeEnrichment(club);
  const name = 'Source name </script><script>globalThis.reviewProbe=1</script>';
  review.changes.name = name;
  review.evidence[0].fields.push('name');
  assert.deepEqual(validateEnrichments([club], [review]), []);
  const approved = applyApprovedEnrichments([club], [review])[0];
  const html = renderToStaticMarkup(createElement(SchemaMarkup, { type: 'club', club: approved }));
  const $ = load(html);
  assert.equal($('script').length, 1);
  assert.equal($('script:not([type="application/ld+json"])').length, 0);
  assert.equal(JSON.parse($('script').text()).name, name);
  assert.ok($('script').text().includes('\\u003c/script>'));
});
