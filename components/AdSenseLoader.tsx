import { getAdsensePublisherId } from '@/lib/ads';

/**
 * The AdSense loader script. Render it from pages that carry ads or are worth
 * Auto ads, never from the root layout: Google bans ads on error, thank-you,
 * and other dead-end screens, and the root layout also wraps the 404 page.
 * React hoists an async script with a src into <head> and loads it once.
 */
export default function AdSenseLoader() {
  const publisherId = getAdsensePublisherId();
  if (!publisherId) return null;
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${publisherId}`}
      crossOrigin="anonymous"
    />
  );
}
