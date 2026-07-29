import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/db'

let sharp: any = null
try {
  sharp = require('sharp')
} catch (e) {
  console.warn('Sharp native module is not available:', e)
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    let rawFolderId = formData.get('folderId') as string | null

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

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Không có file nào được chọn' }, { status: 400 })
    }

    const uploadedAssets = []

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File "${file.name}" không hợp lệ. Chỉ chấp nhận ảnh (JPG, PNG, GIF, WEBP, SVG).` },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" quá lớn. Giới hạn 10MB.` },
          { status: 400 }
        )
      }

      const bytes = await file.arrayBuffer()
      let buffer = Buffer.from(bytes)
      const isSvg = file.type.includes('svg')

      const ext = path.extname(file.name)
      const baseName = path.basename(file.name, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || 'image'

      let finalExt = ext || '.jpg'
      let finalMimeType = file.type || 'image/jpeg'
      let finalFileName = file.name

      if (isSvg) {
        finalExt = ext || '.svg'
        finalMimeType = file.type || 'image/svg+xml'
      } else if (sharp) {
        try {
          const compressed = await sharp(buffer).webp({ quality: 80 }).toBuffer()
          buffer = compressed
          finalExt = '.webp'
          finalMimeType = 'image/webp'
          finalFileName = `${baseName}.webp`
        } catch (sharpError) {
          console.warn(`Failed to compress image ${file.name} with sharp, using original file`, sharpError)
        }
      }

      const uniqueName = `${baseName}-${Date.now()}${finalExt}`

      // Tạo thư mục theo năm/tháng
      const now = new Date()
      const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`
      
      // Xử lý đường dẫn khi chạy bằng Next.js standalone
      let rootDir = process.cwd()
      if (rootDir.includes('.next/standalone') || rootDir.includes('.next\\standalone')) {
        rootDir = path.join(rootDir, '../../')
      }
      const uploadDir = path.join(rootDir, 'public', 'uploads', yearMonth)
      
      await mkdir(uploadDir, { recursive: true })

      const filePath = path.join(uploadDir, uniqueName)
      await writeFile(filePath, buffer)

      const publicUrl = `/uploads/${yearMonth}/${uniqueName}`

      // Lưu thông tin vào DB
      const asset = await prisma.asset.create({
        data: {
          url: publicUrl,
          fileName: finalFileName,
          mimeType: finalMimeType,
          sizeBytes: buffer.length,
          folderId: folderId
        }
      })

      uploadedAssets.push(asset)
    }

    return NextResponse.json({ success: true, data: uploadedAssets })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Lỗi hệ thống. Không thể tải file lên.', 
      details: error?.message || String(error)
    }, { status: 500 })
  }
}

