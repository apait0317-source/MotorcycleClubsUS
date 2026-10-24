import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAdsensePublisherId,
  getAdPlacement,
  isAdEnabled,
  shouldInsertInFeedAd,
  IN_FEED_EVERY,
} from '@/lib/ads';

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_ADSENSE_ID;
  delete process.env.NEXT_PUBLIC_AD_SLOT_INLINE;
  delete process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR;
});

test('publisher id strips ca-pub- and pub- prefixes', () => {
  process.env.NEXT_PUBLIC_ADSENSE_ID = 'ca-pub-123';
  assert.equal(getAdsensePublisherId(), '123');
  process.env.NEXT_PUBLIC_ADSENSE_ID = 'pub-456 ';
  assert.equal(getAdsensePublisherId(), '456');
  delete process.env.NEXT_PUBLIC_ADSENSE_ID;
  assert.equal(getAdsensePublisherId(), '');
});

test('placements reserve fixed heights', () => {
  assert.equal(getAdPlacement('inline').minHeight, 250);
  assert.equal(getAdPlacement('sidebar').minHeight, 600);
});

test('the sidebar reserves a phone-sized height below the lg breakpoint', () => {
  assert.equal(getAdPlacement('inline').heightClass, 'min-h-[250px]');
  assert.equal(getAdPlacement('sidebar').heightClass, 'min-h-[280px] lg:min-h-[600px]');
});

test('placements read slot ids from env at call time', () => {
  assert.equal(getAdPlacement('inline').slot, '');
  process.env.NEXT_PUBLIC_AD_SLOT_INLINE = '111';
  process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR = '222';
  assert.equal(getAdPlacement('inline').slot, '111');
  assert.equal(getAdPlacement('sidebar').slot, '222');
});

test('an ad is enabled only when publisher id and slot are both set', () => {
  assert.equal(isAdEnabled('inline'), false);
  process.env.NEXT_PUBLIC_ADSENSE_ID = 'pub-1';
  assert.equal(isAdEnabled('inline'), false);
  process.env.NEXT_PUBLIC_AD_SLOT_INLINE = '111';
  assert.equal(isAdEnabled('inline'), true);
  assert.equal(isAdEnabled('sidebar'), false);
});

test('in-feed ads go after every twelfth card but never after the last', () => {
  assert.equal(IN_FEED_EVERY, 12);
  assert.equal(shouldInsertInFeedAd(11, 30), true);
  assert.equal(shouldInsertInFeedAd(23, 30), true);
  assert.equal(shouldInsertInFeedAd(5, 30), false);
  assert.equal(shouldInsertInFeedAd(11, 12), false);
});
