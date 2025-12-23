import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Get reviews for a club
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clubId = searchParams.get('clubId');

  if (!clubId) {
    return NextResponse.json(
      { error: 'Club ID is required' },
      { status: 400 }
    );
  }

  const reviews = await prisma.review.findMany({
    where: {
      clubId,
      status: 'approved',
    },
    include: {
      user: {
        select: { name: true, image: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(reviews);
}

// POST - Submit a review
export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { clubId, rating, title, content } = await req.json();

    if (!clubId || !rating || !content) {
      return NextResponse.json(
        { error: 'Club ID, rating, and content are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this club
    const existing = await prisma.review.findUnique({
      where: {
        userId_clubId: {
          userId: session.user.id,
          clubId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'You have already reviewed this club' },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        clubId,
        rating,
        title,
        content,
        status: 'pending',
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
