'use client';

import { useEffect, useRef } from 'react';
import { AD_SLOTS, getAdsensePublisherId, type AdSize } from '@/lib/ads';

interface AdPlaceholderProps {
  size?: AdSize;
  className?: string;
  slot?: string;
}

const PUBLISHER_ID = getAdsensePublisherId();

const sizeConfig: Record<AdSize, { minHeight: number; devHeight: string }> = {
  banner: { minHeight: 90, devHeight: 'h-24 md:h-28' },
  sidebar: { minHeight: 250, devHeight: 'h-64' },
  inline: { minHeight: 100, devHeight: 'h-20' },
};

/**
 * AdSense placement. Renders a responsive ad unit when the publisher ID and the
 * slot ID for this placement are configured. In production with no
 * configuration it renders nothing, so visitors and ad reviewers never see
 * placeholder boxes. In development it shows an outline so layout can be checked.
 */
export default function AdPlaceholder({ size = 'banner', className = '', slot }: AdPlaceholderProps) {
  const adRef = useRef<HTMLModElement>(null);
  const adSlot = slot || AD_SLOTS[size];
  const enabled = Boolean(PUBLISHER_ID && adSlot);
  const config = sizeConfig[size];

  useEffect(() => {
    if (!enabled || !adRef.current) return;
    // Only request an ad once per <ins>; AdSense marks filled slots.
    if (adRef.current.getAttribute('data-adsbygoogle-status')) return;
    try {
      const w = window as Window & { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [enabled]);

  if (!enabled) {
    if (process.env.NODE_ENV === 'production') return null;
    return (
      <div
        className={`bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center ${config.devHeight} ${className}`}
      >
        <p className="text-gray-400 text-xs text-center px-4">
          Ad placement ({size}). Set NEXT_PUBLIC_ADSENSE_ID and NEXT_PUBLIC_AD_SLOT_{size.toUpperCase()}.
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`} style={{ minHeight: config.minHeight }} aria-label="Advertisement">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={`ca-pub-${PUBLISHER_ID}`}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
