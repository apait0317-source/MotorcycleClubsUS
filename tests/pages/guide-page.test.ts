import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { load } from 'cheerio';
import GuidePage, { generateMetadata } from '@/app/guides/[slug]/page';
import { guides } from '@/lib/guides';

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
