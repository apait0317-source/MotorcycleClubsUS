import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SponsorPlacement from '@/components/SponsorPlacement';

const valid = { name: 'Example partner', message: 'A quarterly partner.', href: 'https://example.com/ride' };
test('unsold, incomplete and unsafe sponsorships leave no empty placement', () => {
  for (const sponsor of [null, { ...valid, name: ' ' }, { ...valid, message: '' },
    ...['', 'javascript:alert(1)', 'http://example.com', '/relative', 'https://'].map(href => ({ ...valid, href }))]) {
    assert.equal(renderToStaticMarkup(createElement(SponsorPlacement, { sponsor })), '');
  }
});
test('a configured sponsor is disclosed and linked separately from editorial content', () => {
  const html = renderToStaticMarkup(createElement(SponsorPlacement, { sponsor: valid }));
  assert.match(html, /Paid sponsorship/);
  assert.match(html, /Example partner/);
  assert.match(html, /href="https:\/\/example.com\/ride"/);
  assert.match(html, /rel="noopener noreferrer sponsored"/);
});
