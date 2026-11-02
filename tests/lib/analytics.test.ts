import test from 'node:test';
import assert from 'node:assert/strict';
const loadApi = async () => await import('@/lib/analytics').catch(() => ({})) as typeof import('@/lib/analytics');

test('interaction payloads whitelist bounded fields and never forward free text or destinations', async () => {
  const api = await loadApi(); assert.equal(typeof api.emitClubInteraction, 'function');
  const events: unknown[] = [];
  const send = (name: string, params: Record<string, string | number>) => events.push({ name, params });
  api.emitClubInteraction({ name: 'club_profile_open', clubId: 'ChIJ-example', marketId: 'sf-bay-area', surface: 'comparison', privateText: 'DO NOT SEND', url: 'https://example.org?email=private' } as unknown as import('@/lib/analytics').ClubInteraction, send);
  api.emitClubInteraction({ name: 'club_official_contact', clubId: 'ChIJ-example', surface: 'profile' }, send);
  api.emitClubInteraction({ name: 'club_filter_change', marketId: 'sf-bay-area', surface: 'comparison', activity: 'racing', resultCount: 0 }, send);
  api.emitClubInteraction({ name: 'club_filter_empty', marketId: 'sf-bay-area', surface: 'comparison', activity: 'racing', resultCount: 0 }, send);
  assert.deepEqual(events[0], { name: 'club_profile_open', params: { club_id: 'ChIJ-example', market_id: 'sf-bay-area', surface: 'comparison' } });
  assert.equal(events.length, 4);
  assert.doesNotMatch(JSON.stringify(events), /DO NOT SEND|email=|privateText|https:|consent/);
  api.emitClubInteraction({ name: 'club_filter_change', marketId: 'sf-bay-area', surface: 'comparison', resultCount: 2, clubId: 'unexpected-id' } as unknown as import('@/lib/analytics').ClubInteraction, send);
  assert.deepEqual(events[4], { name: 'club_filter_change', params: { market_id: 'sf-bay-area', surface: 'comparison', result_count: 2 } });
});

test('invalid runtime identifiers, enums, counts and event names are rejected', async () => {
  const api = await loadApi(); assert.equal(typeof api.emitClubInteraction, 'function');
  const events: unknown[] = [];
  const base = { name: 'club_filter_change', marketId: 'sf-bay-area', surface: 'comparison', resultCount: 6 };
  for (const bad of [{ ...base, activity: 'flying' }, { ...base, kind: 'anything' }, { ...base, resultCount: -1 },
    { ...base, resultCount: 1.5 }, { ...base, marketId: 'private text' }, { ...base, name: 'ad_click' },
    { ...base, surface: 'invalid' }, { name: 'club_profile_open', clubId: 'user@example.com', surface: 'card' },
    { ...base, name: 'club_filter_empty', resultCount: 1 }]) {
    api.emitClubInteraction(bad as import('@/lib/analytics').ClubInteraction, (...event) => events.push(event));
  }
  assert.equal(events.length, 0);
});

test('missing analytics and a throwing sink cannot interrupt navigation', async () => {
  const api = await loadApi(); assert.equal(typeof api.emitClubInteraction, 'function');
  const event = { name: 'club_official_contact', clubId: 'canonical-id', surface: 'profile' } as const;
  assert.doesNotThrow(() => api.emitClubInteraction(event));
  assert.doesNotThrow(() => api.emitClubInteraction(event, () => { throw new Error('blocked analytics'); }));
});
