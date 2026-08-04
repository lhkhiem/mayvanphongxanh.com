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
  "man-hinh": "/icons/categories/man-hinh.svg",
  "software": "/icons/categories/software.svg",
  "phan-mem": "/icons/categories/phan-mem.svg",
  "pc": "/icons/categories/pc.svg",
  "may-tinh-pc": "/icons/categories/may-tinh-pc.svg",
  "laptop": "/icons/categories/laptop.svg",
  "muc-nap": "/icons/categories/muc-nap.svg",
  "cartridge": "/icons/categories/cartridge.svg",
  "hop-muc": "/icons/categories/hop-muc.svg",
  "van-phong-pham": "/icons/categories/van-phong-pham.svg",
  "thiet-bi-mang": "/icons/categories/thiet-bi-mang.svg",
  "ban-phim-chuot": "/icons/categories/ban-phim-chuot.svg",
  "am-thanh-tai-nghe": "/icons/categories/am-thanh-tai-nghe.svg",
  "camera-giam-sat": "/icons/categories/camera-giam-sat.svg",
  "noi-that-van-phong": "/icons/categories/noi-that-van-phong.svg",
  "bo-luu-dien-ups": "/icons/categories/bo-luu-dien-ups.svg",
  "bang-tu-van-phong": "/icons/categories/bang-tu-van-phong.svg",
  "bia-ho-so": "/icons/categories/bia-ho-so.svg",
  "dung-cu-van-phong": "/icons/categories/dung-cu-van-phong.svg",
  "the-deo-van-phong": "/icons/categories/the-deo-van-phong.svg",
  "dich-vu-bao-tri": "/icons/categories/dich-vu-bao-tri.svg",
  "thiet-bi-luu-tru": "/icons/categories/thiet-bi-luu-tru.svg",
  "cap-ket-noi": "/icons/categories/cap-ket-noi.svg",
  "may-tinh-cam-tay": "/icons/categories/may-tinh-cam-tay.svg"
}

async function main() {
  console.log("Cập nhật đường dẫn SVG cho các danh mục...")
  const categories = await prisma.category.findMany()

  // First sync icons folder in MediaAsset table
  let iconsFolder = await prisma.mediaFolder.findFirst({
    where: { name: 'Icons', parentId: null }
  })
  if (!iconsFolder) {
    iconsFolder = await prisma.mediaFolder.create({
      data: { name: 'Icons', parentId: null }
    })
  }

  for (const cat of categories) {
    let iconPath = ""
    const slug = cat.slug.toLowerCase()
    const name = cat.name.toLowerCase()
    
    if (slug.includes("man-hinh") || name.includes("màn hình") || name.includes("monitor")) iconPath = "/icons/categories/man-hinh.svg"
    else if (slug.includes("software") || slug.includes("phan-mem") || name.includes("phần mềm")) iconPath = "/icons/categories/software.svg"
    else if (slug.includes("laptop") || name.includes("laptop")) iconPath = "/icons/categories/laptop.svg"
    else if (slug.includes("pc") || name.includes("máy tính để bàn") || name.includes("máy tính pc")) iconPath = "/icons/categories/pc.svg"
    else if (slug.includes("muc-nap") || name.includes("mực nạp")) iconPath = "/icons/categories/muc-nap.svg"
    else if (slug.includes("cartridge") || name.includes("cartridge") || name.includes("hộp mực")) iconPath = "/icons/categories/cartridge.svg"
    else if (slug.includes("van-phong-pham") || name.includes("văn phòng phẩm")) iconPath = "/icons/categories/van-phong-pham.svg"
    else if (slug.includes("mang") || name.includes("mạng") || name.includes("router") || name.includes("wifi")) iconPath = "/icons/categories/thiet-bi-mang.svg"
    else if (slug.includes("ban-phim") || slug.includes("chuot") || name.includes("bàn phím") || name.includes("chuột")) iconPath = "/icons/categories/ban-phim-chuot.svg"
    else if (slug.includes("tai-nghe") || slug.includes("am-thanh") || name.includes("tai nghe") || name.includes("âm thanh") || name.includes("loa")) iconPath = "/icons/categories/am-thanh-tai-nghe.svg"
    else if (slug.includes("camera") || name.includes("camera") || name.includes("giám sát")) iconPath = "/icons/categories/camera-giam-sat.svg"
    else if (slug.includes("noi-that") || name.includes("bàn ghế") || name.includes("nội thất")) iconPath = "/icons/categories/noi-that-van-phong.svg"
    else if (slug.includes("ups") || name.includes("lưu điện")) iconPath = "/icons/categories/bo-luu-dien-ups.svg"
    else if (slug.includes("bang") || name.includes("bảng")) iconPath = "/icons/categories/bang-tu-van-phong.svg"
    else if (slug.includes("ho-so") || slug.includes("bia") || name.includes("bìa") || name.includes("hồ sơ")) iconPath = "/icons/categories/bia-ho-so.svg"
    else if (slug.includes("dung-cu") || name.includes("kéo") || name.includes("dao rọc")) iconPath = "/icons/categories/dung-cu-van-phong.svg"
    else if (slug.includes("the-deo") || name.includes("thẻ đeo")) iconPath = "/icons/categories/the-deo-van-phong.svg"
    else if (slug.includes("bao-tri") || name.includes("bảo trì") || name.includes("sửa chữa")) iconPath = "/icons/categories/dich-vu-bao-tri.svg"
    else if (slug.includes("luu-tru") || name.includes("ổ cứng") || name.includes("usb")) iconPath = "/icons/categories/thiet-bi-luu-tru.svg"
    else if (slug.includes("cap") || name.includes("cáp")) iconPath = "/icons/categories/cap-ket-noi.svg"
    else if (slug.includes("may-tinh-cam-tay") || name.includes("máy tính cầm tay") || name.includes("casio")) iconPath = "/icons/categories/may-tinh-cam-tay.svg"
    else if (slug.includes("in") && !slug.includes("muc")) iconPath = "/icons/categories/may-in.svg"
    else if (slug.includes("photo") || slug.includes("copy")) iconPath = "/icons/categories/may-photocopy.svg"
    else if (slug.includes("scan")) iconPath = "/icons/categories/may-scanner.svg"
    else if (slug.includes("cham-cong")) iconPath = "/icons/categories/may-cham-cong.svg"
    else if (slug.includes("dem-tien")) iconPath = "/icons/categories/may-dem-tien.svg"
    else if (slug.includes("soi-tien")) iconPath = "/icons/categories/may-soi-tien.svg"
    else if (slug.includes("huy")) iconPath = "/icons/categories/may-huy-tai-lieu.svg"
    else if (slug.includes("ep") || slug.includes("plastic")) iconPath = "/icons/categories/may-ep-plastic.svg"
    else if (slug.includes("dong-sach")) iconPath = "/icons/categories/may-dong-sach.svg"
    else if (slug.includes("muc")) iconPath = "/icons/categories/muc-in-cartridge.svg"
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
