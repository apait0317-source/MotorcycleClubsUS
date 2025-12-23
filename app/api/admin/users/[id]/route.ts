import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get single user with details
export async function GET(req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      favorites: {
        include: {
          club: {
            select: { name: true, city: true, state: true, slug: true },
          },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      reviews: {
        include: {
          club: {
            select: { name: true, city: true, state: true, slug: true },
          },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      clubClaims: {
        include: {
          club: {
            select: { name: true, city: true, state: true, slug: true },
          },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          favorites: true,
          reviews: true,
          clubClaims: true,
          submittedClubs: true,
          claimedClubs: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

// PATCH - Update user
export async function PATCH(req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { name, role } = await req.json();

    // Prevent admin from removing their own admin role
    if (id === session.user.id && role && role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot remove your own admin role' },
        { status: 400 }
      );
    }

    const updateData: { name?: string; role?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined && ['user', 'admin'].includes(role)) {
      updateData.role = role;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(req: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Prevent admin from deleting themselves
  if (id === session.user.id) {
    return NextResponse.json(
      { error: 'Cannot delete your own account' },
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
