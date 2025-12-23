import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Get user's claims
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const claims = await prisma.clubClaim.findMany({
    where: { userId: session.user.id },
    include: { club: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(claims);
}

// POST - Submit a club claim
export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { clubId, businessEmail, message } = await req.json();

    if (!clubId) {
      return NextResponse.json(
        { error: 'Club ID is required' },
        { status: 400 }
      );
    }

    // Check if club exists
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Check if club is already claimed
    if (club.claimedById) {
      return NextResponse.json(
        { error: 'This club has already been claimed' },
        { status: 400 }
      );
    }

    // Check if user already has a pending claim for this club
    const existingClaim = await prisma.clubClaim.findFirst({
      where: {
        userId: session.user.id,
        clubId,
        status: 'pending',
      },
    });

    if (existingClaim) {
      return NextResponse.json(
        { error: 'You already have a pending claim for this club' },
        { status: 400 }
      );
    }

    const claim = await prisma.clubClaim.create({
      data: {
        userId: session.user.id,
        clubId,
        businessEmail: businessEmail || null,
        message: message || null,
        status: 'pending',
      },
    });

    return NextResponse.json(claim, { status: 201 });
  } catch (error) {
    console.error('Submit claim error:', error);
    return NextResponse.json(
      { error: 'Failed to submit claim' },
      { status: 500 }
    );
  }
}
