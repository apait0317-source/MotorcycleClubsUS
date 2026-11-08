import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { amazonSearchUrl, AFFILIATE_PRODUCTS, AFFILIATE_REL, AMAZON_AFFILIATE_TAG } from '@/lib/affiliates';
import AffiliateSection from '@/components/AffiliateSection';
import * as affiliates from '@/lib/affiliates';
import { guides } from '@/lib/guides';

test('placement tracking IDs reach rendered links and unset or blank overrides retain the default tag', () => {
  const placements = {
    home_strip: 'NEXT_PUBLIC_AMAZON_TAG_HOME', guide_inline: 'NEXT_PUBLIC_AMAZON_TAG_GUIDES',
    club_sidebar: 'NEXT_PUBLIC_AMAZON_TAG_CLUBS', city_sidebar: 'NEXT_PUBLIC_AMAZON_TAG_CITIES',
  } as const;
  for (const [placement, variable] of Object.entries(placements)) {
    const original = process.env[variable];
    const typedPlacement = placement as affiliates.AffiliatePlacement;
    try {
      delete process.env[variable];
      assert.equal(affiliates.amazonTagForPlacement(typedPlacement), AMAZON_AFFILIATE_TAG);
      process.env[variable] = '   ';
      assert.equal(affiliates.amazonTagForPlacement(typedPlacement), AMAZON_AFFILIATE_TAG);
      process.env[variable] = ' placement-demo-20 ';
      const html = renderToStaticMarkup(createElement(AffiliateSection, {
        placement: typedPlacement, variant: placement === 'home_strip' ? 'strip' : 'sidebar',
      }));
      assert.equal((html.match(/tag=placement-demo-20/g) || []).length, AFFILIATE_PRODUCTS.length);
      assert.match(html, /As an Amazon Associate/);
    } finally {
      if (original === undefined) delete process.env[variable];
      else process.env[variable] = original;
    }
  }
});

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

test('guide offers choose relevant categories and omit shopping on other guides', () => {
  assert.equal(typeof affiliates.getGuideAffiliateOffer, 'function');
  const expected: Record<string, string[]> = {
    'how-to-join-a-motorcycle-club': ['Helmets', 'Gloves'],
    'motorcycle-rallies-and-events': ['Jackets', 'Gloves'],
    'group-riding-safety': ['Communication'],
    'best-motorcycle-roads-in-the-us': ['Helmets', 'Jackets', 'Gloves'],
  };
  for (const guide of guides) {
    const offer = affiliates.getGuideAffiliateOffer(guide.slug);
    if (!expected[guide.slug]) {
      assert.equal(offer, undefined, guide.slug);
      continue;
    }
    assert.ok(offer, guide.slug);
    assert.deepEqual(offer.products.map(product => product.category), expected[guide.slug], guide.slug);
    assert.equal(guide.sections.filter(section => section.heading === offer.afterHeading).length, 1);
  }
  assert.equal(affiliates.getGuideAffiliateOffer('unknown-guide'), undefined);
});

test('shopping categories explain that individual product claims need checking', () => {
  const html = renderToStaticMarkup(createElement(AffiliateSection));
  assert.match(html, /shopping categories/i);
  assert.match(html, /check each product/i);
  assert.doesNotMatch(html, /DOT and ECE rated|CE-rated armor|Full-grain leather/i);
});

test('an empty selection renders no affiliate block', () => {
  assert.equal(renderToStaticMarkup(createElement(AffiliateSection, { products: [] })), '');
});
