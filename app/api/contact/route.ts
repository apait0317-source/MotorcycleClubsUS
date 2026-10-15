import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMITS = { name: 120, email: 254, subject: 200, message: 5000 };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message, website } = body as Record<string, unknown>;

    // Honeypot: the "website" field is hidden from people. Bots fill it.
    // Return success so the bot learns nothing, but store nothing.
    if (typeof website === 'string' && website.trim() !== '') {
      return NextResponse.json({ success: true });
    }

    const fields = { name, email, subject, message };
    for (const [key, value] of Object.entries(fields)) {
      if (typeof value !== 'string' || !value.trim()) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
      }
      if (value.length > LIMITS[key as keyof typeof LIMITS]) {
        return NextResponse.json({ error: `${key} is too long` }, { status: 400 });
      }
    }
    if (!EMAIL_RE.test(email as string)) {
      return NextResponse.json({ error: 'Please enter a valid email' }, { status: 400 });
    }

    const submission = await prisma.contactSubmission.create({
      data: {
        name: (name as string).trim(),
        email: (email as string).trim().toLowerCase(),
        subject: (subject as string).trim(),
        message: (message as string).trim(),
      },
    });

    return NextResponse.json({ success: true, id: submission.id });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to submit message' }, { status: 500 });
  }
}
