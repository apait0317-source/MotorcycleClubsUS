/**
 * Google AdSense configuration.
 *
 * NEXT_PUBLIC_ADSENSE_ID       publisher ID (with or without the "pub-" / "ca-pub-" prefix)
 * NEXT_PUBLIC_AD_SLOT_INLINE   ad unit ID for in-content and in-feed placements
 * NEXT_PUBLIC_AD_SLOT_SIDEBAR  ad unit ID for the sticky sidebar placement
 *
 * Auto ads stay enabled in the AdSense account. The two placements below are
 * the fixed units. Each reserves a minimum height so a late-filling ad never
 * shifts the layout. Nothing renders in production until the IDs exist.
 *
 * The AdSense loader script is not in the root layout. Pages that carry ads
 * render <AdSenseLoader /> themselves, so the 404 page, forms, search, and
 * legal pages never load it. See tests/pages/ad-placement.test.ts.
 */
export function getAdsensePublisherId(): string {
  const raw = process.env.NEXT_PUBLIC_ADSENSE_ID || '';
  return raw.replace(/^ca-pub-/, '').replace(/^pub-/, '').trim();
}

export type AdPlacement = 'inline' | 'sidebar';

export interface AdPlacementConfig {
  /** AdSense ad unit ID. Empty string when the env var is unset. */
  slot: string;
  /** Reserved height in px at the widest breakpoint (lg and up). */
  minHeight: number;
  /** Tailwind classes that reserve the height at every breakpoint. */
  heightClass: string;
}

// The sidebar stacks at the bottom of the page on phones. A 600px reservation
// there leaves a blank gap when the unit is unfilled, so phones reserve one
// standard unit and only lg and up reserve the full half-page height. The class
// strings are literals so Tailwind can see them.
const HEIGHTS: Record<AdPlacement, { minHeight: number; heightClass: string }> = {
  inline: { minHeight: 250, heightClass: 'min-h-[250px]' },
  sidebar: { minHeight: 600, heightClass: 'min-h-[280px] lg:min-h-[600px]' },
};

export function getAdPlacement(placement: AdPlacement): AdPlacementConfig {
  // Each env var is spelled out so Next can inline it into client bundles.
  const slot =
    placement === 'inline'
      ? process.env.NEXT_PUBLIC_AD_SLOT_INLINE
      : process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR;
  return { slot: (slot || '').trim(), ...HEIGHTS[placement] };
}

export function isAdEnabled(placement: AdPlacement): boolean {
  return Boolean(getAdsensePublisherId() && getAdPlacement(placement).slot);
}

/** Cards between in-feed ads on state and city grids. */
export const IN_FEED_EVERY = 12;

/**
 * True when an in-feed ad belongs after the card at zero-based `index` in a
 * grid of `total` cards. Never places an ad after the final card.
 */
export function shouldInsertInFeedAd(index: number, total: number, every: number = IN_FEED_EVERY): boolean {
  return (index + 1) % every === 0 && index < total - 1;
}
