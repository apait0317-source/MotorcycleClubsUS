import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAllClubs } from '@/lib/data';

test('every club page is prerendered and unknown slugs 404', async () => {
  const page = await import('@/app/clubs/[slug]/page');
  const params = await page.generateStaticParams();
  assert.equal(params.length, getAllClubs().length);
  assert.equal(page.dynamicParams, false);
  assert.equal('revalidate' in page, false);
});
