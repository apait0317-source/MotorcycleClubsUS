import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get single club
export async function GET(req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const club = await prisma.club.findUnique({
    where: { id },
    include: {
      claimedBy: {
        select: { id: true, name: true, email: true },
      },
      submittedBy: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: {
          userReviews: true,
          favorites: true,
          claims: true,
        },
      },
    },
  });

  if (!club) {
    return NextResponse.json({ error: 'Club not found' }, { status: 404 });
  }

  return NextResponse.json(club);
}

// PATCH - Update club
export async function PATCH(req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const data = await req.json();

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};

    const allowedFields = [
      'name', 'description', 'address', 'city', 'state', 'stateName',
      'phone', 'website', 'mainCategory', 'categories', 'closedOn',
      'status', 'isVerified', 'isFeatured', 'featuredImage', 'googleMapsLink'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    // Update citySlug if city changed
    if (data.city) {
      updateData.citySlug = data.city
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    const club = await prisma.club.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(club);
  } catch (error) {
    console.error('Error updating club:', error);
    return NextResponse.json({ error: 'Failed to update club' }, { status: 500 });
  }
}

// DELETE - Delete club
export async function DELETE(req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.club.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting club:', error);
    return NextResponse.json({ error: 'Failed to delete club' }, { status: 500 });
  }
}
