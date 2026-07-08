import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    let folderId = searchParams.get('folderId')
    if (folderId === 'root' || folderId === 'null') folderId = null

    const assets = await prisma.asset.findMany({
      where: search ? {
        OR: [
          { fileName: { contains: search, mode: 'insensitive' } },
          { url: { contains: search, mode: 'insensitive' } },
        ]
      } : {
        folderId: folderId
      },
      orderBy: { createdAt: 'desc' },
    })

    const folders = !search ? await prisma.mediaFolder.findMany({
      where: {
        parentId: folderId
      },
      orderBy: { createdAt: 'desc' },
    }) : []

    const allFolders = await prisma.mediaFolder.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ data: assets, folders: folders, allFolders: allFolders })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json({ error: 'Không thể tải danh sách ảnh' }, { status: 500 })
  }
}
