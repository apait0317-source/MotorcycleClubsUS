import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Get user's notifications (including broadcasts)
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get notifications for this user OR broadcasts (userId = null)
  const notifications = await prisma.notification.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { userId: null }, // Broadcasts
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 50, // Limit to last 50 notifications
  });

  // Get read status for broadcasts (store in a separate read tracking)
  // For now, broadcasts are considered unread until the user views them
  // In a production app, you'd have a separate table to track read status per user for broadcasts

  const unreadCount = notifications.filter((n: { isRead: boolean }) => !n.isRead).length;

  return NextResponse.json({ notifications, unreadCount });
}

// PATCH - Mark notification as read
export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, markAllRead } = await req.json();

    if (markAllRead) {
      // Mark all user's notifications as read
      await prisma.notification.updateMany({
        where: {
          OR: [
            { userId: session.user.id },
            { userId: null },
          ],
          isRead: false,
        },
        data: { isRead: true },
      });

      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    }

    // Verify the notification belongs to the user or is a broadcast
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        OR: [
          { userId: session.user.id },
          { userId: null },
        ],
      },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
