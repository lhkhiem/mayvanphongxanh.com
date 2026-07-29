import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const pathSegments = resolvedParams.path || []

    // Xác định thư mục rootDir chuẩn xác
    let rootDir = process.cwd()
    if (rootDir.includes('.next/standalone') || rootDir.includes('.next\\standalone')) {
      rootDir = path.join(rootDir, '../../')
    }

    // Đường dẫn trỏ tới thư mục uploads thật sự
    const filePath = path.join(rootDir, 'public', 'uploads', ...pathSegments)

    // Kiểm tra file có tồn tại không
    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 })
    }

    // Đọc file
    const fileBuffer = fs.readFileSync(filePath)
    const ext = path.extname(filePath).toLowerCase()
    
    // Set Content-Type phù hợp
    let contentType = 'application/octet-stream'
    if (ext === '.webp') contentType = 'image/webp'
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
    else if (ext === '.png') contentType = 'image/png'
    else if (ext === '.svg') contentType = 'image/svg+xml'
    else if (ext === '.gif') contentType = 'image/gif'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error: any) {
    console.error('Lỗi khi đọc file serve-uploads:', error)
    return new NextResponse(`Internal Server Error: ${error?.message || String(error)}`, { status: 500 })
  }
}
