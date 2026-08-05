import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const allCategories = await prisma.category.findMany({
      where: {
        isActive: true,
        showInFooter: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        order: true,
      },
      orderBy: [
        { order: 'asc' },
        { id: 'asc' },
      ],
    });

    const categoryIdSet = new Set(allCategories.map(c => c.id));

    // Root categories (no parentId, or parent is not in footer category list)
    const rootCategories = allCategories
      .filter(c => !c.parentId || !categoryIdSet.has(c.parentId))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id);

    // Group children by parentId
    const childrenMap = new Map<number, typeof allCategories>();
    allCategories.forEach(c => {
      if (c.parentId && categoryIdSet.has(c.parentId)) {
        if (!childrenMap.has(c.parentId)) {
          childrenMap.set(c.parentId, []);
        }
        childrenMap.get(c.parentId)!.push(c);
      }
    });

    // Sort children for each parent
    childrenMap.forEach((children) => {
      children.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id);
    });

    // Build hierarchical ordered array
    const result: Array<{
      id: number;
      name: string;
      slug: string;
      parentId: number | null;
      level: number;
      isParent: boolean;
    }> = [];

    rootCategories.forEach(parent => {
      const children = childrenMap.get(parent.id) || [];
      result.push({
        id: parent.id,
        name: parent.name,
        slug: parent.slug,
        parentId: parent.parentId,
        level: 0,
        isParent: children.length > 0,
      });

      children.forEach(child => {
        result.push({
          id: child.id,
          name: child.name,
          slug: child.slug,
          parentId: child.parentId,
          level: 1,
          isParent: false,
        });
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Lỗi khi tải danh mục Footer:', error);
    return NextResponse.json({ error: 'Đã có lỗi xảy ra' }, { status: 500 });
  }
}

