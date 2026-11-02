import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import SchemaMarkup from '@/components/SchemaMarkup';
import { makeReviewedClub } from '../fixtures/market-clubs';

test('explicit parent metadata connects a canonical club without importing third-party ratings', () => {
  const html = renderToStaticMarkup(createElement(SchemaMarkup, { type: 'club', club: makeReviewedClub(), parentOrganization: { name: 'Example Organization', url: '/chapters/example' } }));
  const schema = JSON.parse(load(html)('script').text());
  assert.equal(schema.parentOrganization?.name, 'Example Organization');
  assert.equal(schema.parentOrganization?.url, 'https://www.usmotorcycleclubs.com/chapters/example');
  assert.equal(schema.aggregateRating, undefined);
});
