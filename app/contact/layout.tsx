import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';
export const metadata: Metadata = {
  title: 'Contact Us',
  description: `Contact ${SITE_NAME} to correct a listing, add a club, or ask a question.`,
  alternates: { canonical: '/contact' },
};
export default function ContactLayout({ children }: { children: React.ReactNode }) { return children; }
