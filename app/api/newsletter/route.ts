import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, source, website } = body as Record<string, unknown>;

    // Honeypot field; see /api/contact.
    if (typeof website === 'string' && website.trim() !== '') {
      return NextResponse.json({ success: true });
    }

    if (typeof email !== 'string' || !EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Please enter a valid email' }, { status: 400 });
    }
    const cleanEmail = email.trim().toLowerCase();

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: cleanEmail } });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ error: 'Already subscribed' }, { status: 400 });
      }
      await prisma.newsletterSubscriber.update({
        where: { email: cleanEmail },
        data: { isActive: true, unsubscribedAt: null },
      });
    } else {
      await prisma.newsletterSubscriber.create({
        data: {
          email: cleanEmail,
          name: typeof name === 'string' ? name.slice(0, 120) : undefined,
          source: typeof source === 'string' ? source.slice(0, 50) : undefined,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
