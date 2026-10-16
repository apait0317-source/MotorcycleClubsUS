import { SITE_URL } from './utils';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const CONTACT_LIMITS = { name: 120, email: 254, subject: 200, message: 5000 } as const;

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type ContactValidation =
  | { ok: true; data: ContactMessage }
  | { ok: false; error: string }
  | { ok: 'honeypot' };

/**
 * Validates a contact or club-submission payload. The hidden "website" field
 * is a honeypot: people never see it, bots fill it. A tripped honeypot is
 * reported separately so the route can return success without sending.
 */
export function validateContact(body: unknown): ContactValidation {
  if (!body || typeof body !== 'object') return { ok: false, error: 'All fields are required' };
  const { name, email, subject, message, website } = body as Record<string, unknown>;

  if (typeof website === 'string' && website.trim() !== '') return { ok: 'honeypot' };

  const fields = { name, email, subject, message };
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value !== 'string' || !value.trim()) return { ok: false, error: 'All fields are required' };
    if (value.length > CONTACT_LIMITS[key as keyof typeof CONTACT_LIMITS]) return { ok: false, error: `${key} is too long` };
  }
  if (!EMAIL_RE.test(email as string)) return { ok: false, error: 'Please enter a valid email' };

  return {
    ok: true,
    data: {
      name: (name as string).trim(),
      email: (email as string).trim().toLowerCase(),
      subject: (subject as string).trim(),
      message: (message as string).trim(),
    },
  };
}

export function formatContactEmail(data: ContactMessage): { subject: string; text: string } {
  return {
    subject: `[usmotorcycleclubs.com] ${data.subject}`,
    text: `From: ${data.name} <${data.email}>\nSubject: ${data.subject}\n\n${data.message}\n`,
  };
}

/** Link target for the "Suggest a correction" button on a club page. */
export function correctionHref(clubName: string, slug: string): string {
  return `/contact?${new URLSearchParams({ club: clubName, slug }).toString()}`;
}

/** Subject and message the contact form prefills when opened from that link. */
export function correctionPrefill(clubName: string, slug: string): { subject: string; message: string } {
  return {
    subject: `Correction: ${clubName}`,
    message: `Club: ${clubName}\nPage: ${SITE_URL}/clubs/${slug}\n\nWhat needs to change:\n`,
  };
}
