import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        showInFooter: true,
      },
      select: {
        name: true,
        slug: true,
      },
      orderBy: {
        id: 'asc', // Or order if you add an order field
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Lỗi khi tải danh mục Footer:', error);
    return NextResponse.json({ error: 'Đã có lỗi xảy ra' }, { status: 500 });
  }
}
