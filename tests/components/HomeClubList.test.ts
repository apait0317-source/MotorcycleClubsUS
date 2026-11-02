import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Children, createElement, isValidElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import HomeClubList from '@/components/home/HomeClubList';
import { getExploreClubs, getIndexableClubs } from '@/lib/data';
import HomePage from '@/app/page';
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

test('homepage rotation includes every source-reviewed club', () => {
  const reviewed = getIndexableClubs();
  assert.ok(reviewed.length > 12);
  function findClubList(node: ReactNode): ReactNode {
    for (const child of Children.toArray(node)) {
      if (!isValidElement<{ children?: ReactNode }>(child)) continue;
      if (child.type === HomeClubList) return child;
      const found = findClubList(child.props.children);
      if (found) return found;
    }
    return null;
  }
  const list = findClubList(HomePage());
  assert.ok(list);
  const $ = load(renderToStaticMarkup(list));
  const region = $('[aria-label="Featured club profiles"]');
  assert.ok(region.text().includes(`Discover ${reviewed.length} source-reviewed clubs`));
  assert.equal(region.find('li').length, 3);
});
