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
 */
export function getAdsensePublisherId(): string {
  const raw = process.env.NEXT_PUBLIC_ADSENSE_ID || '';
  return raw.replace(/^ca-pub-/, '').replace(/^pub-/, '').trim();
}

export type AdPlacement = 'inline' | 'sidebar';

export interface AdPlacementConfig {
  /** AdSense ad unit ID. Empty string when the env var is unset. */
  slot: string;
  /** Reserved height in px, applied to the container and the <ins>. */
  minHeight: number;
}

const MIN_HEIGHTS: Record<AdPlacement, number> = {
  inline: 250,
  sidebar: 600,
};

export function getAdPlacement(placement: AdPlacement): AdPlacementConfig {
  // Each env var is spelled out so Next can inline it into client bundles.
  const slot =
    placement === 'inline'
      ? process.env.NEXT_PUBLIC_AD_SLOT_INLINE
      : process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR;
  return { slot: (slot || '').trim(), minHeight: MIN_HEIGHTS[placement] };
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
