import { NextResponse } from 'next/server';
import { prisma as db } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const banner = await db.banner.update({
      where: { id },
      data: {
        title: body.title,
        subTitle: body.subTitle,
        icon: body.icon,
        url: body.url,
        image: body.image,
        order: body.order,
        isActive: body.isActive,
      },
    });
    return NextResponse.json(banner);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    await db.banner.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
