import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { amazonSearchUrl, AFFILIATE_PRODUCTS, AFFILIATE_REL, AMAZON_AFFILIATE_TAG } from '@/lib/affiliates';
import AffiliateSection from '@/components/AffiliateSection';

test('amazon search urls carry the encoded term and tag', () => {
  const url = amazonSearchUrl('full face helmet', 'demo-20');
  assert.equal(url, 'https://www.amazon.com/s?k=full%20face%20helmet&tag=demo-20');
  assert.ok(amazonSearchUrl('x').endsWith(`&tag=${encodeURIComponent(AMAZON_AFFILIATE_TAG)}`));
});

test('default product list is complete', () => {
  assert.equal(AFFILIATE_PRODUCTS.length, 4);
  for (const p of AFFILIATE_PRODUCTS) {
    assert.ok(p.name && p.description && p.searchTerm && p.category);
  }
});

test('AffiliateSection renders sponsored links built from the config', () => {
  const html = renderToStaticMarkup(createElement(AffiliateSection));
  assert.equal((html.match(new RegExp(`rel="${AFFILIATE_REL}"`, 'g')) || []).length, 4);
  assert.match(html, new RegExp(`tag=${encodeURIComponent(AMAZON_AFFILIATE_TAG)}`));
  assert.match(html, /As an Amazon Associate/);
});
