import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - List all clubs
export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const status = searchParams.get('status');
  const featured = searchParams.get('featured');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { city: { contains: search } },
      { state: { contains: search } },
    ];
  }

  if (status && status !== 'all') {
    where.status = status;
  }

  if (featured === 'true') {
    where.isFeatured = true;
  }

  const [clubs, total] = await Promise.all([
    prisma.club.findMany({
      where,
      select: {
        id: true,
        placeId: true,
        slug: true,
        name: true,
        city: true,
        state: true,
        stateName: true,
        status: true,
        isVerified: true,
        isFeatured: true,
        rating: true,
        reviewCount: true,
        createdAt: true,
        claimedBy: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.club.count({ where }),
  ]);

  return NextResponse.json({
    clubs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

// POST - Create new club
export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Generate slug from name
    const baseSlug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Make sure slug is unique
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.club.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Generate unique placeId for admin-created clubs
    const placeId = `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Generate citySlug
    const citySlug = data.city
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const club = await prisma.club.create({
      data: {
        placeId,
        slug,
        name: data.name,
        description: data.description || null,
        address: data.address,
        city: data.city,
        citySlug,
        state: data.state,
        stateName: data.stateName,
        phone: data.phone || null,
        website: data.website || null,
        mainCategory: data.mainCategory || null,
        categories: data.categories || null,
        closedOn: data.closedOn || null,
        status: 'active',
        isFeatured: data.isFeatured || false,
        isVerified: true,
      },
    });

    return NextResponse.json(club);
  } catch (error) {
    console.error('Error creating club:', error);
    return NextResponse.json({ error: 'Failed to create club' }, { status: 500 });
  }
}
