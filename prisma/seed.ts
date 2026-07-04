import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { products, categories as mockCategories, testimonials, blogPosts, companyInfo, projects } from '../lib/mockData'
import bcrypt from 'bcryptjs'
import "dotenv/config"

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Hàm helper để tạo slug
function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

function removeVietnameseTones(str: string) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
  str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
  str = str.replace(/đ/g,"d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
}

async function main() {
  console.log('Bắt đầu dọn dẹp dữ liệu cũ...')
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  await prisma.role.deleteMany()
  await prisma.permission.deleteMany()
  
  // 0. Seed Roles and Admin User
  console.log('Seed Roles and Admin User...')
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
      description: 'Quản trị viên cấp cao',
      isSystem: true
    }
  })
  
  const hashedPassword = await bcrypt.hash('admin', 10)
  await prisma.user.create({
    data: {
      name: 'Admin MVPX',
      email: 'admin@mvpx.vn',
      password: hashedPassword,
      roleId: adminRole.id,
    }
  })
  
  // Dọn dẹp CMS
  await prisma.setting.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.menu.deleteMany()
  await prisma.page.deleteMany()
  await prisma.post.deleteMany()
  await prisma.postCategory.deleteMany()
  await prisma.testimonial.deleteMany()
  await prisma.project.deleteMany()
  await prisma.asset.deleteMany()

  // 1. Seed Settings (Company Info)
  console.log('Seed Settings...')
  await prisma.setting.createMany({
    data: [
      { key: 'company_name', value: companyInfo.name, description: 'Tên công ty' },
      { key: 'company_tagline', value: companyInfo.tagline, description: 'Slogan công ty' },
      { key: 'company_description', value: companyInfo.description, description: 'Mô tả ngắn gọn' },
      { key: 'company_mission', value: companyInfo.mission, description: 'Sứ mệnh' },
      { key: 'company_stats', value: JSON.stringify(companyInfo.stats), description: 'Thống kê (JSON)' }
    ]
  })

  // 2. Seed Testimonials
  console.log('Seed Testimonials...')
  for (const t of testimonials) {
    await prisma.testimonial.create({
      data: {
        name: t.name,
        role: t.role,
        content: t.content,
        rating: t.rating,
        image: t.image
      }
    })
  }

  // 3. Seed Projects
  console.log('Seed Projects...')
  for (const p of projects) {
    await prisma.project.create({
      data: {
        title: p.title,
        client: p.client,
        description: p.description,
        image: p.image,
        category: p.category
      }
    })
  }

  // 4. Seed Blog Posts & Categories
  console.log('Seed Blog...')
  const blogCategoryMap = new Map<string, number>()
  for (const post of blogPosts) {
    let catId = blogCategoryMap.get(post.category)
    if (!catId) {
      const newCat = await prisma.postCategory.create({
        data: {
          name: post.category,
          slug: generateSlug(removeVietnameseTones(post.category))
        }
      })
      catId = newCat.id
      blogCategoryMap.set(post.category, catId)
    }

    await prisma.post.create({
      data: {
        title: post.title,
        slug: post.slug || generateSlug(removeVietnameseTones(post.title)),
        excerpt: post.excerpt,
        content: post.excerpt + ' (Content chi tiết sẽ được cập nhật sau)', // Mock data không có content dài
        image: post.image,
        categoryId: catId,
        publishedAt: new Date(), // Giả lập ngày publish
      }
    })
  }

  // 5. Seed Product Categories
  console.log('Seed Categories...')
  const categoryMap = new Map<string, number>()
  for (const cat of mockCategories) {
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        slug: generateSlug(removeVietnameseTones(cat.name)),
        icon: cat.icon,
        color: cat.color,
      }
    })
    categoryMap.set(cat.name, createdCat.id)
  }

  // 6. Seed Products
  console.log('Seed Products...')
  for (const prod of products) {
    const categoryId = categoryMap.get(prod.category)
    if (!categoryId) {
      continue
    }

    const createdProduct = await prisma.product.create({
      data: {
        name: prod.name,
        slug: generateSlug(removeVietnameseTones(prod.name)),
        categoryId,
        brand: prod.brand,
        description: prod.description,
        productType: prod.productType || 'standard',
        customOptions: prod.customOptions ? (prod.customOptions as any) : null,
      }
    })

    if (prod.productType === 'pre-packaged' && prod.variants && prod.variants.length > 0) {
      for (const v of prod.variants) {
        await prisma.productVariant.create({
          data: {
            productId: createdProduct.id,
            sku: v.sku || `SKU-${v.id}`,
            name: v.name,
            price: v.price,
            originalPrice: v.originalPrice,
            stockQuantity: v.stock,
            attributes: v.attributes ? (v.attributes as any) : null,
            images: [prod.image],
          }
        })
      }
    } else {
      await prisma.productVariant.create({
        data: {
          productId: createdProduct.id,
          sku: `SKU-PROD-${prod.id}`,
          name: 'Mặc định',
          price: prod.basePrice || prod.price,
          originalPrice: prod.originalPrice,
          stockQuantity: prod.stock,
          attributes: prod.attributes ? (prod.attributes as any) : null,
          images: [prod.image], 
        }
      })
    }
  }

  // 7. Seed Menus (Khởi tạo sẵn khung Menu)
  console.log('Seed Menus...')
  await prisma.menu.create({
    data: {
      code: 'HEADER_MAIN',
      name: 'Main Navigation',
      items: {
        create: [
          { label: 'Trang chủ', url: '/', order: 1 },
          { label: 'Sản phẩm', url: '/products', order: 2 },
          { label: 'Dịch vụ', url: '/services', order: 3 },
          { label: 'Tin tức', url: '/blog', order: 4 },
          { label: 'Liên hệ', url: '/contact', order: 5 },
        ]
      }
    }
  })

  console.log('Seed xong toàn bộ hệ thống VIP Pro CMS!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
