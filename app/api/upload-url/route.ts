import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

let sharp: any = null
try {
  sharp = require('sharp')
} catch (e) {
  console.warn('Sharp native module is not available:', e)
}

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

    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'URL không trỏ đến một ảnh hợp lệ' }, { status: 400 })
    }

    const arrayBuffer = await response.arrayBuffer()
    let buffer = Buffer.from(arrayBuffer)
    
    const isSvg = contentType.includes('svg');
    let originalName = path.basename(parsedUrl.pathname) || 'downloaded-image'
    
    // Remove query params or hashes from original name
    originalName = originalName.split('?')[0].split('#')[0];
    const ext = path.extname(originalName)
    const baseName = path.basename(originalName, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || crypto.randomBytes(8).toString('hex')

    let finalExt = ext || '.jpg'
    let finalMimeType = contentType
    let finalFileName = originalName

    if (isSvg) {
      finalExt = '.svg'
      finalMimeType = contentType
    } else if (sharp) {
      try {
        const compressed = await sharp(buffer).webp({ quality: 80 }).toBuffer()
        buffer = compressed
        finalExt = '.webp'
        finalMimeType = 'image/webp'
        finalFileName = `${baseName}.webp`
      } catch (error) {
        console.warn(`Failed to compress image from URL ${url}, using original`, error)
      }
    }

    const uniqueName = `${baseName}-${Date.now()}${finalExt}`

    const now = new Date()
    const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`
    
    let rootDir = process.cwd()
    if (rootDir.includes('.next/standalone') || rootDir.includes('.next\\standalone')) {
      rootDir = path.join(rootDir, '../../')
    }
    const uploadDir = path.join(rootDir, 'public', 'uploads', yearMonth)
    await mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, uniqueName)
    await writeFile(filePath, buffer)

    const publicUrl = `/uploads/${yearMonth}/${uniqueName}`

    const asset = await prisma.asset.create({
      data: {
        url: publicUrl,
        fileName: finalFileName,
        mimeType: finalMimeType,
        sizeBytes: buffer.length,
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

