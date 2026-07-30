import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/db'
import crypto from 'crypto'
import { compressImage } from '@/lib/image-compressor'

export async function POST(request: NextRequest) {
  try {
    const { url, folderId: rawFolderId } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL không được để trống' }, { status: 400 })
    }

    let folderId: string | null = null
    if (rawFolderId && rawFolderId !== 'root' && rawFolderId !== 'null' && rawFolderId !== 'undefined' && rawFolderId.trim() !== '') {
      try {
        const folderExists = await prisma.mediaFolder.findUnique({ where: { id: rawFolderId } })
        if (folderExists) {
          folderId = rawFolderId
        }
      } catch (dbErr) {
        console.warn('Could not verify folderId existence:', dbErr)
      }
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

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'URL không trỏ đến một ảnh hợp lệ' }, { status: 400 })
    }

    const arrayBuffer = await response.arrayBuffer()
    const rawBuffer = Buffer.from(arrayBuffer)
    
    let originalName = path.basename(parsedUrl.pathname) || 'downloaded-image'
    originalName = originalName.split('?')[0].split('#')[0];

    // Nén ảnh bằng Sharp sang WebP chất lượng 80
    const compressedResult = await compressImage(rawBuffer, originalName, contentType)

    const baseNameWithoutExt = path.basename(compressedResult.fileName, compressedResult.extension)
    const uniqueName = `${baseNameWithoutExt}-${Date.now()}${compressedResult.extension}`

    const now = new Date()
    const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`
    
    let rootDir = process.cwd()
    if (rootDir.includes('.next/standalone') || rootDir.includes('.next\\standalone')) {
      rootDir = path.join(rootDir, '../../')
    }
    const uploadDir = path.join(rootDir, 'public', 'uploads', yearMonth)
    await mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, uniqueName)
    await writeFile(filePath, compressedResult.buffer)

    const publicUrl = `/uploads/${yearMonth}/${uniqueName}`

    const asset = await prisma.asset.create({
      data: {
        url: publicUrl,
        fileName: compressedResult.fileName,
        mimeType: compressedResult.mimeType,
        sizeBytes: compressedResult.sizeBytes,
        folderId: folderId
      }
    })

    return NextResponse.json({ success: true, data: asset })
  } catch (error: any) {
    console.error('Upload URL error:', error)
    return NextResponse.json({ 
      error: 'Lỗi hệ thống. Không thể tải file từ URL.',
      details: error?.message || String(error)
    }, { status: 500 })
  }
}
