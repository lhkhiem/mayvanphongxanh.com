import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import "dotenv/config"

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const categoryIconsMap: Record<string, string> = {
  "may-in": "/icons/categories/may-in.svg",
  "may-photocopy": "/icons/categories/may-photocopy.svg",
  "may-scanner": "/icons/categories/may-scanner.svg",
  "may-cham-cong": "/icons/categories/may-cham-cong.svg",
  "may-dem-tien": "/icons/categories/may-dem-tien.svg",
  "may-soi-tien": "/icons/categories/may-soi-tien.svg",
  "may-huy-tai-lieu": "/icons/categories/may-huy-tai-lieu.svg",
  "may-ep-plastic": "/icons/categories/may-ep-plastic.svg",
  "may-dong-sach": "/icons/categories/may-dong-sach.svg",
  "muc-in-cartridge": "/icons/categories/muc-in-cartridge.svg",
  "linh-kien": "/icons/categories/linh-kien-may-van-phong.svg",
  "vat-tu": "/icons/categories/vat-tu-giay-in.svg",
  "cho-thue-may-photo": "/icons/categories/cho-thue-may-photo.svg",
  "may-chieu": "/icons/categories/may-chieu.svg",
  "con-dau": "/icons/categories/con-dau.svg",
}

async function main() {
  console.log("Cập nhật đường dẫn SVG cho các danh mục...")
  const categories = await prisma.category.findMany()

  for (const cat of categories) {
    let iconPath = ""
    const slug = cat.slug.toLowerCase()
    
    if (slug.includes("in") && !slug.includes("muc")) iconPath = "/icons/categories/may-in.svg"
    else if (slug.includes("photo") || slug.includes("copy")) iconPath = "/icons/categories/may-photocopy.svg"
    else if (slug.includes("scan")) iconPath = "/icons/categories/may-scanner.svg"
    else if (slug.includes("cham-cong")) iconPath = "/icons/categories/may-cham-cong.svg"
    else if (slug.includes("dem-tien")) iconPath = "/icons/categories/may-dem-tien.svg"
    else if (slug.includes("huy")) iconPath = "/icons/categories/may-huy-tai-lieu.svg"
    else if (slug.includes("ep") || slug.includes("plastic")) iconPath = "/icons/categories/may-ep-plastic.svg"
    else if (slug.includes("dong-sach")) iconPath = "/icons/categories/may-dong-sach.svg"
    else if (slug.includes("muc") || slug.includes("cartridge")) iconPath = "/icons/categories/muc-in-cartridge.svg"
    else if (slug.includes("vat-tu") || slug.includes("giay")) iconPath = "/icons/categories/vat-tu-giay-in.svg"
    else if (slug.includes("thue")) iconPath = "/icons/categories/cho-thue-may-photo.svg"
    else if (slug.includes("chieu")) iconPath = "/icons/categories/may-chieu.svg"
    else if (slug.includes("dau")) iconPath = "/icons/categories/con-dau.svg"
    else if (slug.includes("linh-kien") || slug.includes("thiet-bi")) iconPath = "/icons/categories/linh-kien-may-van-phong.svg"
    else iconPath = "/icons/categories/may-photocopy.svg"

    await prisma.category.update({
      where: { id: cat.id },
      data: { icon: iconPath }
    })
    console.log(`- Đã cập nhật "${cat.name}" -> ${iconPath}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
