import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Claim a Listing', robots: { index: false, follow: false } };
export default function ClaimLayout({ children }: { children: React.ReactNode }) { return children; }
