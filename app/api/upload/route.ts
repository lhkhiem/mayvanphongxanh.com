import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/db'
import { compressImage } from '@/lib/image-compressor'

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB Max Upload
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
          { error: `File "${file.name}" quá lớn. Giới hạn 25MB.` },
          { status: 400 }
        )
      }

      const bytes = await file.arrayBuffer()
      const rawBuffer = Buffer.from(bytes)

      // Nén ảnh bằng Sharp sang WebP chất lượng 80
      const compressedResult = await compressImage(rawBuffer, file.name, file.type)

      const baseNameWithoutExt = path.basename(compressedResult.fileName, compressedResult.extension)
      const uniqueName = `${baseNameWithoutExt}-${Date.now()}${compressedResult.extension}`

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
      await writeFile(filePath, compressedResult.buffer)

      const publicUrl = `/uploads/${yearMonth}/${uniqueName}`

      // Lưu thông tin vào DB
      const asset = await prisma.asset.create({
        data: {
          url: publicUrl,
          fileName: compressedResult.fileName,
          mimeType: compressedResult.mimeType,
          sizeBytes: compressedResult.sizeBytes,
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
