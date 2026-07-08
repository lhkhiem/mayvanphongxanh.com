import { NextResponse } from 'next/server';
import { prisma as db } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const slider = await db.slider.update({
      where: { id },
      data: {
        image: body.image,
        badge: body.badge,
        title: body.title,
        description: body.description,
        btnPrimaryLabel: body.btnPrimaryLabel,
        btnPrimaryUrl: body.btnPrimaryUrl,
        btnSecondaryLabel: body.btnSecondaryLabel,
        btnSecondaryUrl: body.btnSecondaryUrl,
        order: body.order,
        isActive: body.isActive,
      },
    });
    return NextResponse.json(slider);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update slider' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    await db.slider.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete slider' }, { status: 500 });
  }
}
