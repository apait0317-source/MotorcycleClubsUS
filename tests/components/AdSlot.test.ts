import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AdSlot from '@/components/AdSlot';

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_ADSENSE_ID;
  delete process.env.NEXT_PUBLIC_AD_SLOT_INLINE;
  delete process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR;
  Object.assign(process.env, { NODE_ENV: 'production' });
});

test('renders nothing in production when ids are unset', () => {
  assert.equal(renderToStaticMarkup(createElement(AdSlot, { placement: 'inline' })), '');
});

test('renders a labelled outline outside production when ids are unset', () => {
  Object.assign(process.env, { NODE_ENV: 'development' });
  const html = renderToStaticMarkup(createElement(AdSlot, { placement: 'sidebar' }));
  assert.match(html, /Ad placement \(sidebar\)/);
  assert.match(html, /NEXT_PUBLIC_AD_SLOT_SIDEBAR/);
  assert.match(html, /min-h-\[280px\]/);
  assert.match(html, /lg:min-h-\[600px\]/);
});

test('renders an adsbygoogle unit with reserved height when configured', () => {
  process.env.NEXT_PUBLIC_ADSENSE_ID = 'pub-999';
  process.env.NEXT_PUBLIC_AD_SLOT_INLINE = '123';
  const html = renderToStaticMarkup(createElement(AdSlot, { placement: 'inline', className: 'mb-8' }));
  assert.match(html, /class="adsbygoogle min-h-\[250px\]"/);
  assert.match(html, /data-ad-client="ca-pub-999"/);
  assert.match(html, /data-ad-slot="123"/);
  assert.match(html, /data-ad-placement="inline"/);
  assert.match(html, /min-h-\[250px\]/);
  assert.doesNotMatch(html, /min-height:\d+px/);
  assert.match(html, /mb-8/);
});
