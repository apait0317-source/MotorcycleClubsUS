import test from 'node:test';
import assert from 'node:assert/strict';
import { compareSource, hashSourceHtml, observeSource } from '../../lib/source-check';
const baseline = { url: 'https://example.org/', reviewedAt: '2026-10-01', contentHash: 'a' };
test('compares observations without mutating approved inputs', () => {
  const before = JSON.stringify(baseline);
  for (const [observation, state] of [
    [{ status: 200, contentHash: 'a' }, 'unchanged'],
    [{ status: 200, contentHash: 'b' }, 'changed'],
    [{ status: 200, contentHash: 'a', finalUrl: 'https://example.org/new' }, 'redirected'],
    [{ status: null, error: 'timeout' }, 'unavailable'],
    [{ status: 403 }, 'unavailable'], [{ status: 404 }, 'unavailable'],
  ] as const) assert.equal(compareSource(baseline, { url: baseline.url, checkedAt: '2026-11-01', ...observation }).state, state);
  assert.equal(JSON.stringify(baseline), before);
});
test('normalization ignores scripts and navigation and prefers main', () => {
  assert.equal(hashSourceHtml('<body>outside<main>Hello <b>world</b></main><nav>one</nav></body>'), hashSourceHtml('<main>Hello world<script>new</script></main><nav>two</nav>'));
});
test('observation captures access errors without hashes', async () => {
  const observed = await observeSource(baseline.url, { fetcher: async () => new Response('forbidden', { status: 403 }) });
  assert.equal(observed.status, 403); assert.equal(observed.contentHash, undefined);
});
test('streamed body enforces limit and body deadline', async () => {
  const large = await observeSource(baseline.url, { maxBytes: 2, fetcher: async () => new Response('large') });
  assert.match(large.error!, /limit/); assert.equal(large.contentHash, undefined);
  const stalled = await observeSource(baseline.url, { timeoutMs: 10, fetcher: async () => new Response(new ReadableStream({ start() {} })) });
  assert.match(stalled.error!, /timeout/);
});

test('empty text and access challenges never produce a hash', () => {
  assert.throws(() => hashSourceHtml('<main><script>code</script></main>'), /No normalized/);
  assert.throws(() => hashSourceHtml('<main>Just a moment... Verify you are human</main>'), /challenge/);
});

test('first failed capture is unavailable and separately flags missing baseline', async () => {
  const { sourceReportEntry } = await import('../../lib/source-check');
  const observation = await observeSource(baseline.url, { fetcher: async () => new Response('missing', { status: 404 }) });
  const entry = sourceReportEntry(undefined, observation);
  assert.equal(entry.state, 'unavailable');
  assert.equal(entry.baselineMissing, true);
  assert.equal(entry.status, 404);
  assert.equal(entry.proposedBaseline, undefined);
  assert.equal(sourceReportEntry(undefined, { url: baseline.url, checkedAt: '2026-11-01', status: 200, contentHash: 'hash' }).state, 'needs-baseline');
});
