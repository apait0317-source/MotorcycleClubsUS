import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Get user's received messages
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const messages = await prisma.message.findMany({
    where: { recipientId: session.user.id },
    include: {
      sender: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

  return NextResponse.json({ messages, unreadCount });
}

// PATCH - Mark message as read
export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 });
    }

    // Verify the message belongs to the user
    const message = await prisma.message.findFirst({
      where: {
        id,
        recipientId: session.user.id,
      },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const updated = await prisma.message.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}
