import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - List club claims
export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const where = status === 'pending' ? { status: 'pending' } : {};

  const claims = await prisma.clubClaim.findMany({
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

  return NextResponse.json(claims);
}

// PATCH - Approve or reject a claim
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

    // Get the claim first to get the club and user info
    const claim = await prisma.clubClaim.findUnique({
      where: { id },
    });

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    // Update claim status
    const updatedClaim = await prisma.clubClaim.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
      },
    });

    // If approved, update the club to mark it as claimed
    if (action === 'approve') {
      await prisma.club.update({
        where: { id: claim.clubId },
        data: {
          claimedById: claim.userId,
          isVerified: true,
        },
      });
    }

    return NextResponse.json(updatedClaim);
  } catch (error) {
    console.error('Error updating claim:', error);
    return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 });
  }
}
