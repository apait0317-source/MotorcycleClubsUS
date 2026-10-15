/**
 * Google AdSense configuration.
 *
 * NEXT_PUBLIC_ADSENSE_ID      numeric publisher ID (with or without the "pub-" / "ca-pub-" prefix)
 * NEXT_PUBLIC_AD_SLOT_BANNER  ad unit ID for the horizontal banner placement
 * NEXT_PUBLIC_AD_SLOT_SIDEBAR ad unit ID for the sidebar placement
 * NEXT_PUBLIC_AD_SLOT_INLINE  ad unit ID for the in-list placement
 */
export function getAdsensePublisherId(): string {
  const raw = process.env.NEXT_PUBLIC_ADSENSE_ID || '';
  return raw.replace(/^ca-pub-/, '').replace(/^pub-/, '').trim();
}

export const AD_SLOTS = {
  banner: process.env.NEXT_PUBLIC_AD_SLOT_BANNER || '',
  sidebar: process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR || '',
  inline: process.env.NEXT_PUBLIC_AD_SLOT_INLINE || '',
} as const;

export type AdSize = keyof typeof AD_SLOTS;
