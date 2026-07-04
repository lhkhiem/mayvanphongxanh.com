import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/db'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

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
      const buffer = Buffer.from(bytes)

      // Tạo tên file an toàn và duy nhất
      const ext = path.extname(file.name)
      const baseName = path.basename(file.name, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      const uniqueName = `${baseName}-${Date.now()}${ext}`

      // Tạo thư mục theo năm/tháng
      const now = new Date()
      const yearMonth = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', yearMonth)
      await mkdir(uploadDir, { recursive: true })

      const filePath = path.join(uploadDir, uniqueName)
      await writeFile(filePath, buffer)

      const publicUrl = `/uploads/${yearMonth}/${uniqueName}`

      // Lưu thông tin vào DB
      const asset = await prisma.asset.create({
        data: {
          url: publicUrl,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        }
      })

      uploadedAssets.push(asset)
    }

    return NextResponse.json({ success: true, data: uploadedAssets })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống. Không thể tải file lên.' }, { status: 500 })
  }
}
