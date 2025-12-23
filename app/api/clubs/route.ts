import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

function generateSlug(name: string, city: string): string {
  const base = `${name}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return base;
}

// GET - List clubs with optional filters
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get('state');
  const city = searchParams.get('city');
  const search = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  const where: Record<string, unknown> = {
    status: 'active',
  };

  if (state) {
    where.state = state;
  }

  if (city) {
    where.citySlug = city;
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { city: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [clubs, total] = await Promise.all([
    prisma.club.findMany({
      where,
      orderBy: [{ rating: 'desc' }, { name: 'asc' }],
      take: limit,
      skip: offset,
    }),
    prisma.club.count({ where }),
  ]);

  return NextResponse.json({ clubs, total });
}

// POST - Submit a new club
export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, description, address, city, state, stateName, website, phone } = await req.json();

    if (!name || !address || !city || !state) {
      return NextResponse.json(
        { error: 'Name, address, city, and state are required' },
        { status: 400 }
      );
    }

    // Generate slug
    let slug = generateSlug(name, city);

    // Check if slug exists and append suffix if needed
    const existing = await prisma.club.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    // Generate a unique placeId for user-submitted clubs
    const placeId = `user_${session.user.id}_${Date.now()}`;

    const club = await prisma.club.create({
      data: {
        placeId,
        slug,
        name,
        description: description || null,
        address,
        city,
        citySlug: city.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        state,
        stateName: stateName || state,
        website: website || null,
        phone: phone || null,
        status: 'pending', // Requires moderation
        isVerified: false,
      },
    });

    return NextResponse.json(club, { status: 201 });
  } catch (error) {
    console.error('Submit club error:', error);
    return NextResponse.json(
      { error: 'Failed to submit club' },
      { status: 500 }
    );
  }
}
