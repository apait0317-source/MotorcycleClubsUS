/**
 * Transactional email through Resend's REST API. One fetch call, no SDK.
 *
 * RESEND_API_KEY      Resend API key (already set in Vercel)
 * CONTACT_TO_EMAIL    owner inbox that receives every form submission
 * CONTACT_FROM_EMAIL  optional sender. Defaults to Resend's onboarding sender,
 *                     which delivers only to the Resend account owner. Set it
 *                     to an address on a verified domain once one exists.
 */
const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'US Motorcycle Clubs <onboarding@resend.dev>';

export interface OutboundEmail {
  subject: string;
  text: string;
  replyTo?: string;
}

export class EmailConfigError extends Error {}

export function getEmailConfig(env: NodeJS.ProcessEnv = process.env) {
  const apiKey = env.RESEND_API_KEY?.trim();
  const to = env.CONTACT_TO_EMAIL?.trim();
  if (!apiKey) throw new EmailConfigError('RESEND_API_KEY is not set');
  if (!to) throw new EmailConfigError('CONTACT_TO_EMAIL is not set');
  const mailbox = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
  if (!mailbox.test(to)) throw new EmailConfigError('CONTACT_TO_EMAIL is not a valid email address');
  const from = env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_FROM;
  const senderAddress = from.match(/^[^<>\r\n]*<([^<>\r\n]+)>$/)?.[1] || from;
  if (!mailbox.test(senderAddress)) throw new EmailConfigError('CONTACT_FROM_EMAIL is not a valid sender');
  return { apiKey, to, from };
}

export async function sendEmail(
  email: OutboundEmail,
  fetchImpl: typeof fetch = fetch,
  env: NodeJS.ProcessEnv = process.env,
): Promise<{ id: string }> {
  const { apiKey, to, from } = getEmailConfig(env);
  const res = await fetchImpl(RESEND_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject: email.subject, text: email.text, reply_to: email.replyTo }),
    // Never let a stalled provider hold the serverless function open.
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Resend responded ${res.status}: ${detail.slice(0, 200)}`);
  }
  const json: unknown = await res.json().catch(() => null);
  const id = json && typeof json === 'object' && 'id' in json ? json.id : undefined;
  if (typeof id !== 'string' || !id.trim()) throw new Error('Resend did not acknowledge message acceptance');
  return { id: id.trim() };
}
