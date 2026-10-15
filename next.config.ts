import type { NextConfig } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.usmotorcycleclubs.com').replace(/\/$/, '');
const PRIMARY_HOST = new URL(SITE_URL).host;

// Every other host that resolves to this deployment. Each one 301s to the
// primary host so search engines see a single canonical origin.
const SECONDARY_HOSTS = [
  'usmotorcycleclubs.com',
  'motorcycleclubs.us',
  'www.motorcycleclubs.us',
  'motorcycle-clubs-us.vercel.app',
].filter((host) => host !== PRIMARY_HOST);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.ggpht.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'streetviewpixels-pa.googleapis.com', pathname: '/**' },
    ],
  },
  async redirects() {
    return SECONDARY_HOSTS.map((host) => ({
      source: '/:path*',
      has: [{ type: 'host' as const, value: host }],
      destination: `${SITE_URL}/:path*`,
      permanent: true,
    }));
  },
};

export default nextConfig;
