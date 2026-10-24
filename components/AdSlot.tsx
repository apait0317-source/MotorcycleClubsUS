'use client';

import { useEffect, useRef } from 'react';
import { getAdsensePublisherId, getAdPlacement, type AdPlacement } from '@/lib/ads';

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
}

/**
 * Fixed AdSense placement with a reserved height.
 *
 * Render it only on a page that also renders <AdSenseLoader />.
 *
 * Renders a responsive ad unit when the publisher ID and this placement's slot
 * ID are configured. In production with no configuration it renders nothing,
 * so visitors and ad reviewers never see an empty box. Outside production it
 * shows an outline so the layout can be checked.
 */
export default function AdSlot({ placement, className = '' }: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);
  const publisherId = getAdsensePublisherId();
  const { slot, heightClass } = getAdPlacement(placement);
  const enabled = Boolean(publisherId && slot);

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
        className={`bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center ${heightClass} ${className}`}
        data-ad-placement={placement}
      >
        <p className="text-gray-400 text-xs text-center px-4">
          Ad placement ({placement}). Set NEXT_PUBLIC_ADSENSE_ID and NEXT_PUBLIC_AD_SLOT_{placement.toUpperCase()}.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden ${heightClass} ${className}`}
      aria-label="Advertisement"
      data-ad-placement={placement}
    >
      <ins
        ref={adRef}
        className={`adsbygoogle ${heightClass}`}
        style={{ display: 'block' }}
        data-ad-client={`ca-pub-${publisherId}`}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
