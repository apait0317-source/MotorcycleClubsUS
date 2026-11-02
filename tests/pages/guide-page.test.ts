import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import GuidePage, { generateMetadata } from '@/app/guides/[slug]/page';
import { guides } from '@/lib/guides';
import { getStateByCode, isIndexableState } from '@/lib/data';

test('revising a guide preserves its original publication date', async () => {
  const guide = guides[0];
  const original = guide.updated;
  try {
    guide.updated = '2026-11-01';
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: guide.slug }) });
    const openGraph = metadata.openGraph as { publishedTime: string; modifiedTime: string };
    assert.equal(openGraph.publishedTime, '2026-10-15');
    assert.equal(openGraph.modifiedTime, '2026-11-01');
    const $ = load(renderToStaticMarkup(await GuidePage({ params: Promise.resolve({ slug: guide.slug }) })));
    const article = $('script[type="application/ld+json"]').toArray()
      .map(element => JSON.parse($(element).text()))
      .find(value => value['@type'] === 'Article');
    assert.equal(article.datePublished, '2026-10-15');
    assert.equal(article.dateModified, '2026-11-01');
  } finally {
    guide.updated = original;
  }
});

test('guide references let readers inspect the cited source', async () => {
  const guide = guides[0] as typeof guides[number] & { sources?: { title: string; url: string }[] };
  const original = guide.sources;
  try {
    guide.sources = [{ title: 'Official club membership requirements', url: 'https://example.org/membership?a=1&b=2' }];
    const $ = load(renderToStaticMarkup(await GuidePage({ params: Promise.resolve({ slug: guide.slug }) })));
    const section = $('section[aria-label="Sources and further reading"]');
    assert.equal(section.length, 1);
    assert.equal(section.find('a').text(), guide.sources[0].title);
    assert.equal(section.find('a').attr('href'), guide.sources[0].url);
    assert.equal(section.find('a').attr('rel'), 'noopener noreferrer');
  } finally {
    guide.sources = original;
  }
});

test('only relevant guides render one disclosed shopping block inside the related section', async () => {
  const placements: Record<string, { heading: string; count: number }> = {
    'how-to-join-a-motorcycle-club': { heading: 'Prepare for an invited guest ride', count: 2 },
    'motorcycle-rallies-and-events': { heading: 'Planning a first rally', count: 2 },
    'group-riding-safety': { heading: 'Communication and a backup plan', count: 1 },
    'best-motorcycle-roads-in-the-us': { heading: 'Riding them with a club', count: 3 },
  };
  for (const guide of guides) {
    const $ = load(renderToStaticMarkup(await GuidePage({ params: Promise.resolve({ slug: guide.slug }) })));
    const links = $('a[rel~="sponsored"]');
    const placement = placements[guide.slug];
    assert.equal(links.length, placement?.count ?? 0, guide.slug);
    if (!placement) continue;
    const block = $('article aside');
    assert.equal(block.length, 1, guide.slug);
    assert.equal(block.parent('section').children('h2').first().text(), placement.heading);
    assert.match(block.text(), /As an Amazon Associate/);
    assert.match(block.text(), /shopping categories/i);
    assert.equal(new Set(links.toArray().map(element => $(element).attr('href'))).size, links.length);
    assert.equal($('article').siblings('aside').find('a[rel~="sponsored"]').length, 0);
  }
});

test('guide discovery links promote only states with enough reviewed profiles', async () => {
  const $ = load(renderToStaticMarkup(await GuidePage({ params: Promise.resolve({ slug: 'group-riding-safety' }) })));
  const links = $('article').siblings('aside').find('a[href^="/state/"]');
  assert.ok(links.length > 0);
  for (const element of links.toArray()) {
    const code = $(element).attr('href')!.split('/').at(-1)!;
    const state = getStateByCode(code);
    assert.ok(state && isIndexableState(state), code);
  }
});
