import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import HomeClubList from '@/components/home/HomeClubList';
import { getExploreClubs } from '@/lib/data';
import { toPublicClub } from '@/lib/club-projection';

const clubs = getExploreClubs(6).map(toPublicClub);

test('rotating club list initially displays three working profile links and navigation', () => {
  const $ = load(renderToStaticMarkup(createElement(HomeClubList, { clubs })));
  assert.equal($('li').length, 3);
  assert.equal($('button[aria-label="Previous club"]').length, 1);
  assert.equal($('button[aria-label="Next club"]').length, 1);
  assert.equal($('button[aria-label="Pause club rotation"]').length, 1);
  assert.equal($('li').first().find('a').first().attr('href'), clubs[0].directoryHref || `/clubs/${clubs[0].slug}`);
});

test('small pools render once without rotation controls', () => {
  for (const count of [0, 1, 2, 3]) {
    const $ = load(renderToStaticMarkup(createElement(HomeClubList, { clubs: clubs.slice(0, count) })));
    assert.equal($('li').length, count);
    assert.equal($('button').length, 0);
  }
});
