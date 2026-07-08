import { NextResponse } from 'next/server';
import { prisma as db } from '@/lib/db';

export async function GET() {
  try {
    const banners = await db.banner.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(banners);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const banner = await db.banner.create({
      data: {
        title: body.title,
        subTitle: body.subTitle,
        icon: body.icon,
        url: body.url,
        image: body.image,
        order: body.order || 0,
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}
