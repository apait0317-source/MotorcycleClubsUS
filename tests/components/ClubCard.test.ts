import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ClubCard from '@/components/ClubCard';
import type { Club } from '@/lib/types';

function club(overrides: Partial<Club> = {}): Club {
  return {
    place_id: 'x', name: 'Iron Riders MC', description: '', reviews: 0, rating: 0, website: '', phone: '',
    featured_image: '', main_category: 'Motorcycle club', categories: '', closed_on: '', address: '', link: '',
    query: '', 'query-02': '', City: 'austin', State: 'tx', stateName: 'Texas', citySlug: 'austin', slug: 'iron-riders-mc-austin-tx',
    ...overrides,
  };
}

test('a rated club shows its stars and a Google review count', () => {
  const html = renderToStaticMarkup(createElement(ClubCard, { club: club({ rating: 4.5, reviews: 12 }) }));
  assert.match(html, /4\.5 \(12 Google reviews\)/);
  assert.match(html, /aria-label="Rating: 4\.5 out of 5 stars"/);
});

test('a club with one review uses the singular', () => {
  const html = renderToStaticMarkup(createElement(ClubCard, { club: club({ rating: 5, reviews: 1 }) }));
  assert.match(html, /5\.0 \(1 Google review\)/);
});

test('an unrated club shows "No reviews" instead of 0.0 and empty stars', () => {
  const html = renderToStaticMarkup(createElement(ClubCard, { club: club() }));
  assert.match(html, /No reviews/);
  assert.doesNotMatch(html, /0\.0/);
  assert.doesNotMatch(html, /out of 5 stars/);
});
