import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      include: {
        children: {
          where: { isActive: true },
          orderBy: [{ order: 'asc' }, { id: 'asc' }]
        }
      }
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Lỗi khi fetch categories:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
