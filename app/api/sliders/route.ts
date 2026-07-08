import { NextResponse } from 'next/server';
import { prisma as db } from '@/lib/db';

export async function GET() {
  try {
    const sliders = await db.slider.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(sliders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sliders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slider = await db.slider.create({
      data: {
        image: body.image,
        badge: body.badge,
        title: body.title,
        description: body.description,
        btnPrimaryLabel: body.btnPrimaryLabel,
        btnPrimaryUrl: body.btnPrimaryUrl,
        btnSecondaryLabel: body.btnSecondaryLabel,
        btnSecondaryUrl: body.btnSecondaryUrl,
        order: body.order || 0,
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json(slider, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create slider' }, { status: 500 });
  }
}
