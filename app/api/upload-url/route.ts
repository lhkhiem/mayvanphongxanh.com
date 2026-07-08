import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/db'
import sharp from 'sharp'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { url, folderId } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL không được để trống' }, { status: 400 })
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'URL không hợp lệ' }, { status: 400 })
    }

    const response = await fetch(url)
    if (!response.ok) {
      return NextResponse.json({ error: 'Không thể tải ảnh từ URL' }, { status: 400 })
    }

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'URL không trỏ đến một ảnh hợp lệ' }, { status: 400 })
    }

    const arrayBuffer = await response.arrayBuffer()
    let buffer = Buffer.from(arrayBuffer)
    
    const isSvg = contentType.includes('svg');
    let finalExt = isSvg ? '.svg' : '.webp';
    let finalMimeType = isSvg ? contentType : 'image/webp';
    let originalName = path.basename(parsedUrl.pathname) || 'downloaded-image'
    
    // Remove query params or hashes from original name
    originalName = originalName.split('?')[0].split('#')[0];
    const ext = path.extname(originalName)
    const baseName = path.basename(originalName, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || crypto.randomBytes(8).toString('hex')

    if (!isSvg) {
      try {
        buffer = await sharp(buffer).webp({ quality: 80 }).toBuffer()
      } catch (error) {
        console.warn(`Failed to compress image from URL ${url}, using original`, error)
        finalExt = ext || '.jpg' // Fallback
        finalMimeType = contentType
      }
    }

    const uniqueName = `${baseName}-${Date.now()}${finalExt}`

    const now = new Date()
    const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', yearMonth)
    await mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, uniqueName)
    await writeFile(filePath, buffer)

    const publicUrl = `/uploads/${yearMonth}/${uniqueName}`

    let resolvedFolderId = folderId
    if (resolvedFolderId === 'root' || resolvedFolderId === 'null') resolvedFolderId = null

    const asset = await prisma.asset.create({
      data: {
        url: publicUrl,
        fileName: isSvg ? originalName : `${baseName}.webp`,
        mimeType: finalMimeType,
        sizeBytes: buffer.length,
        folderId: resolvedFolderId
      }
    })

    return NextResponse.json({ success: true, data: asset })
  } catch (error) {
    console.error('Upload URL error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống. Không thể tải file từ URL.' }, { status: 500 })
  }
}
