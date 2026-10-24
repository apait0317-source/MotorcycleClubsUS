import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import AdSenseLoader from '@/components/AdSenseLoader';

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_ADSENSE_ID;
});

test('renders nothing when no publisher id is set', () => {
  assert.equal(renderToStaticMarkup(createElement(AdSenseLoader)), '');
});

test('renders the async AdSense loader with the publisher id', () => {
  process.env.NEXT_PUBLIC_ADSENSE_ID = 'ca-pub-777';
  const html = renderToStaticMarkup(createElement(AdSenseLoader));
  assert.match(html, /^<script /);
  assert.match(html, /async=""/);
  assert.match(html, /src="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-777"/);
  assert.match(html, /crossorigin="anonymous"/);
});
