import { validateContact, formatContactEmail } from '@/lib/contact';
import { sendEmail, EmailConfigError } from '@/lib/email';

export const runtime = 'nodejs';

/**
 * Receives the contact form and the club submission form. Validates, drops
 * honeypot hits silently, and forwards the message to CONTACT_TO_EMAIL through
 * Resend. Nothing is stored.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  const result = validateContact(body);
  if (result.ok === 'honeypot') return Response.json({ success: true });
  if (result.ok === false) return Response.json({ error: result.error }, { status: 400 });

  try {
    const { subject, text } = formatContactEmail(result.data);
    await sendEmail({ subject, text, replyTo: result.data.email });
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof EmailConfigError) {
      // The message names the missing variable only ("X is not set"), never a value.
      console.error(`Contact form is not configured: ${error.message}`);
      return Response.json({ error: 'Contact form is not configured' }, { status: 503 });
    }
    console.error('Contact form error:', error);
    return Response.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
