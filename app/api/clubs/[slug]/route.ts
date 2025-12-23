import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const club = await prisma.club.findUnique({
    where: { slug },
  });

  if (!club) {
    return NextResponse.json({ error: 'Club not found' }, { status: 404 });
  }

  return NextResponse.json(club);
}
