import { NextResponse } from 'next/server';
import { prisma as db } from '@/lib/db';

export async function GET() {
  try {
    const pages = await db.page.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(pages);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const page = await db.page.create({
      data: {
        slug: body.slug,
        title: body.title,
        content: body.content,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        metaKeywords: body.metaKeywords,
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}
