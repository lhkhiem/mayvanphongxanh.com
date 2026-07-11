import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SERVICES = [
  {
    title: 'Cung cấp thiết bị công nghệ',
    excerpt: 'Danh mục thiết bị đầy đủ cho văn phòng, giáo dục, vận hành và hạ tầng CNTT.',
    items: ['Laptop & Máy tính để bàn', 'Máy chủ & NAS', 'Máy in & Máy photocopy', 'Máy scan chuyên dụng', 'Thiết bị mạng & Router'],
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80',
    icon: 'bg-primary'
  },
  {
    title: 'Dịch vụ kỹ thuật & bảo trì',
    excerpt: 'Đội ngũ kỹ thuật hỗ trợ từ tư vấn, thiết kế đến vận hành sau triển khai.',
    items: ['Bảo trì thiết bị CNTT', 'Sửa chữa máy in & PC', 'Tư vấn giải pháp công nghệ', 'Thiết kế hệ thống mạng', 'Hỗ trợ kỹ thuật tận nơi'],
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
    icon: 'bg-teal-600'
  },
  {
    title: 'Giải pháp hạ tầng tổng thể',
    excerpt: 'Triển khai hạ tầng công nghệ thông tin toàn diện cho doanh nghiệp và tổ chức.',
    items: ['Hạ tầng mạng LAN / WiFi', 'Hệ thống Camera CCTV', 'Âm thanh hội nghị', 'Data Center doanh nghiệp', 'Hệ thống POS bán lẻ'],
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    icon: 'bg-orange-600'
  }
];

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/([^0-9a-z-\s])/g, "")
    .replace(/(\s+)/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log('Seeding Services...');
  await prisma.service.deleteMany(); // Xóa dữ liệu cũ nếu có
  
  let order = 1;
  for (const s of SERVICES) {
    const htmlContent = `<ul>${s.items.map(item => `<li>${item}</li>`).join('')}</ul>`;
    await prisma.service.create({
      data: {
        title: s.title,
        slug: generateSlug(s.title),
        excerpt: s.excerpt,
        content: htmlContent,
        image: s.image,
        icon: s.icon,
        order: order++,
        isActive: true,
      }
    });
  }
  console.log('Done seeding services!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
