'use client';

import { useEffect, useRef } from 'react';

interface AdPlaceholderProps {
  size?: 'banner' | 'sidebar' | 'inline';
  className?: string;
  slot?: string;
}

// Set your Google AdSense Publisher ID here
// Get it from: https://www.google.com/adsense/
const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_ID || '';

// Ad slot IDs for different placements
const AD_SLOTS = {
  banner: process.env.NEXT_PUBLIC_AD_SLOT_BANNER || '',
  sidebar: process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR || '',
  inline: process.env.NEXT_PUBLIC_AD_SLOT_INLINE || '',
};

export default function AdPlaceholder({ size = 'banner', className = '', slot }: AdPlaceholderProps) {
  const adRef = useRef<HTMLModElement>(null);
  const adSlot = slot || AD_SLOTS[size];
  const isAdSenseEnabled = ADSENSE_PUBLISHER_ID && adSlot;

  const sizeConfig = {
    banner: { height: 'h-24 md:h-28', format: 'horizontal', style: { minHeight: '90px' } },
    sidebar: { height: 'h-64', format: 'vertical', style: { minHeight: '250px' } },
    inline: { height: 'h-20', format: 'rectangle', style: { minHeight: '100px' } },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    if (isAdSenseEnabled && adRef.current && typeof window !== 'undefined') {
      try {
        // @ts-expect-error - AdSense global
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [isAdSenseEnabled]);

  // Show placeholder if AdSense is not configured
  if (!isAdSenseEnabled) {
    return (
      <div
        className={`bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center ${config.height} ${className}`}
      >
        <div className="text-center px-4">
          <p className="text-gray-400 text-sm font-medium">Advertisement Space</p>
          <p className="text-gray-300 text-xs mt-1">
            Configure NEXT_PUBLIC_ADSENSE_ID to enable ads
          </p>
        </div>
      </div>
    );
  }

  // Render actual AdSense ad
  return (
    <div className={`overflow-hidden ${className}`} style={config.style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client={`ca-pub-${ADSENSE_PUBLISHER_ID}`}
        data-ad-slot={adSlot}
        data-ad-format={config.format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
