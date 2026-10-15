import { getAdsensePublisherId } from '@/lib/ads';

export const dynamic = 'force-static';

// Serves /ads.txt so AdSense can verify this domain as authorized inventory.
// Format reference: https://support.google.com/adsense/answer/12171612
export function GET() {
  const publisherId = getAdsensePublisherId();
  if (!publisherId) {
    return new Response('Not configured', { status: 404 });
  }
  const body = `google.com, pub-${publisherId}, DIRECT, f08c47fec0942fa0\n`;
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
