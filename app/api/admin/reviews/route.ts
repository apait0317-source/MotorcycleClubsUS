import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - List reviews
export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const where = status === 'pending' ? { status: 'pending' } : {};

  const reviews = await prisma.review.findMany({
    where,
    include: {
      user: {
        select: { name: true, email: true },
      },
      club: {
        select: { name: true, city: true, state: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(reviews);
}

// PATCH - Approve or reject a review
export async function PATCH(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, action } = await req.json();

    if (!id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const review = await prisma.review.update({
      where: { id },
      data: { status: newStatus },
    });

    // If approved, update the club's review count and rating
    if (action === 'approve') {
      const clubReviews = await prisma.review.findMany({
        where: {
          clubId: review.clubId,
          status: 'approved',
        },
      });

      const avgRating = clubReviews.reduce((acc: number, r) => acc + r.rating, 0) / clubReviews.length;

      await prisma.club.update({
        where: { id: review.clubId },
        data: {
          reviewCount: clubReviews.length,
          rating: Math.round(avgRating * 10) / 10,
        },
      });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}
