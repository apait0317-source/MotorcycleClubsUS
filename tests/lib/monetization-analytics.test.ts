import test from 'node:test';
import assert from 'node:assert/strict';
import type { MouseEvent } from 'react';
import TrackedMonetizationLink from '@/components/TrackedMonetizationLink';
import { emitMonetizationInteraction, type MonetizationInteraction } from '@/lib/monetization-analytics';

test('outbound intent uses bounded fields and drops arbitrary destination or form data', () => {
  const events: unknown[] = [];
  const send = (name: string, params: Record<string, string>) => events.push({ name, params });
  emitMonetizationInteraction({ name: 'affiliate_click', placement: 'guide_inline', category: 'Communication',
    url: 'https://example.com?email=private', message: 'private' } as MonetizationInteraction, send);
  emitMonetizationInteraction({ name: 'sponsor_click', placement: 'home_sponsor' }, send);
  assert.deepEqual(events, [
    { name: 'affiliate_click', params: { placement: 'guide_inline', category: 'Communication', merchant: 'amazon' } },
    { name: 'sponsor_click', params: { placement: 'home_sponsor' } },
  ]);
  for (const event of [null, { name: 'ad_click', placement: 'home_sponsor' },
    { name: 'affiliate_click', placement: 'user@example.com', category: 'Helmets' },
    { name: 'affiliate_click', placement: 'guide_inline', category: 'private text' },
    { name: 'sponsor_click', placement: 'guide_inline' }]) {
    emitMonetizationInteraction(event as MonetizationInteraction, send);
  }
  assert.equal(events.length, 2);
  assert.doesNotThrow(() => emitMonetizationInteraction({ name: 'sponsor_click', placement: 'home_sponsor' }));
  assert.doesNotThrow(() => emitMonetizationInteraction({ name: 'sponsor_click', placement: 'home_sponsor' }, () => { throw new Error('blocked'); }));
});

test('links preserve navigation and measure primary or middle activation once through the existing tag', () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const originalId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const events: unknown[][] = [];
  const browser: { gtag?: (...args: unknown[]) => void } = { gtag: (...args) => events.push(args) };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: browser });
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST';
  const interaction = { name: 'affiliate_click', placement: 'guide_inline', category: 'Helmets' } as const;
  const event = (button: number, defaultPrevented = false) => ({ button, defaultPrevented }) as MouseEvent<HTMLAnchorElement>;
  try {
    const link = TrackedMonetizationLink({ href: 'https://www.amazon.com/', target: '_blank', rel: 'sponsored', interaction });
    assert.equal(link.props.href, 'https://www.amazon.com/');
    assert.equal(link.props.target, '_blank');
    assert.equal(link.props.rel, 'sponsored');
    link.props.onClick(event(0)); // Also covers keyboard activation's primary click.
    link.props.onClick(event(1));
    link.props.onAuxClick(event(1));
    link.props.onAuxClick(event(2));
    link.props.onClick(event(0, true));
    link.props.onAuxClick(event(1, true));
    assert.equal(events.length, 2);
    assert.deepEqual(events[0], ['event', 'affiliate_click', { placement: 'guide_inline', category: 'Helmets', merchant: 'amazon' }]);

    const cancelled = TrackedMonetizationLink({ href: 'https://example.com', interaction,
      onClick: e => { Object.defineProperty(e, 'defaultPrevented', { value: true }); } });
    cancelled.props.onClick(event(0));
    assert.equal(events.length, 2);

    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    link.props.onClick(event(0));
    assert.equal(events.length, 2);
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST';
    delete browser.gtag;
    assert.doesNotThrow(() => link.props.onClick(event(0)));
    browser.gtag = () => { throw new Error('blocked'); };
    assert.doesNotThrow(() => link.props.onClick(event(0)));
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
    else Reflect.deleteProperty(globalThis, 'window');
    if (originalId === undefined) delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    else process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = originalId;
  }
});
