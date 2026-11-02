import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AffiliateSection from '@/components/AffiliateSection';
import { AFFILIATE_PRODUCTS, AFFILIATE_DISCLOSURE } from '@/lib/affiliates';

test('homepage strip preserves disclosures and existing category destinations', () => {
  const html = renderToStaticMarkup(createElement(AffiliateSection, { variant: 'strip' }));
  assert.match(html, /<h2/);
  assert.ok(html.includes(AFFILIATE_DISCLOSURE));
  assert.match(html, /not tested product recommendations/);
  assert.equal((html.match(/rel="noopener noreferrer sponsored"/g) || []).length, AFFILIATE_PRODUCTS.length);
  assert.equal((html.match(/target="_blank"/g) || []).length, AFFILIATE_PRODUCTS.length);
  for (const product of AFFILIATE_PRODUCTS) assert.ok(html.includes(encodeURIComponent(product.searchTerm)));
});
test('default affiliate section and empty product behavior remain intact', () => {
  assert.match(renderToStaticMarkup(createElement(AffiliateSection)), /<h3/);
  assert.equal(renderToStaticMarkup(createElement(AffiliateSection, { variant: 'strip', products: [] })), '');
});
