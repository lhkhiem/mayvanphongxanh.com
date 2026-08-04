import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import fs from 'fs'
import path from 'path'
import "dotenv/config"

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function syncIcons() {
  console.log("Bắt đầu đồng bộ hóa tất cả icon vào thư mục 'Icons' trong Media Library DB...")

  // 1. Tìm hoặc tạo thư mục 'Icons'
  let iconsFolder = await prisma.mediaFolder.findFirst({
    where: { name: 'Icons', parentId: null }
  })

  if (!iconsFolder) {
    iconsFolder = await prisma.mediaFolder.create({
      data: {
        name: 'Icons',
        parentId: null
      }
    })
    console.log(`+ Đã tạo thư mục 'Icons' với ID: ${iconsFolder.id}`)
  } else {
    console.log(`✓ Tìm thấy thư mục 'Icons' (ID: ${iconsFolder.id})`)
  }

  // 2. Đọc tất cả file .svg trong public/icons/categories
  const iconsDir = path.join(process.cwd(), 'public', 'icons', 'categories')
  if (!fs.existsSync(iconsDir)) {
    console.error("Thư mục public/icons/categories không tồn tại!")
    return
  }

  const files = fs.readdirSync(iconsDir).filter(file => file.endsWith('.svg'))
  console.log(`Tìm thấy ${files.length} file SVG trong public/icons/categories:`)

  let countNew = 0
  let countUpdated = 0

  for (const fileName of files) {
    const filePath = path.join(iconsDir, fileName)
    const stats = fs.statSync(filePath)
    const url = `/icons/categories/${fileName}`

    // Kiểm tra xem đã có Asset record chưa
    const existingAsset = await prisma.asset.findFirst({
      where: { url }
    })

    if (!existingAsset) {
      await prisma.asset.create({
        data: {
          url,
          fileName,
          mimeType: 'image/svg+xml',
          sizeBytes: stats.size,
          folderId: iconsFolder.id
        }
      })
      console.log(`  + Đã thêm Asset mới: ${fileName}`)
      countNew++
    } else {
      await prisma.asset.update({
        where: { id: existingAsset.id },
        data: {
          fileName,
          mimeType: 'image/svg+xml',
          sizeBytes: stats.size,
          folderId: iconsFolder.id
        }
      })
      console.log(`  ~ Đã cập nhật Asset: ${fileName}`)
      countUpdated++
    }
  }

  console.log(`\nHoàn thành! Mới: ${countNew}, Cập nhật: ${countUpdated}`)
}

syncIcons()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
