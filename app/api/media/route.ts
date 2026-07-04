import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const assets = await prisma.asset.findMany({
      where: search ? {
        OR: [
          { fileName: { contains: search, mode: 'insensitive' } },
          { url: { contains: search, mode: 'insensitive' } },
        ]
      } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: assets })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json({ error: 'Không thể tải danh sách ảnh' }, { status: 500 })
  }
}
