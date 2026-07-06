import 'dotenv/config';
import { prisma } from './lib/db';
async function main() {
  const brands = [
    { name: 'HP', slug: 'hp', description: 'Tập đoàn công nghệ thông tin lớn nhất thế giới, cung cấp các sản phẩm máy in, máy tính cá nhân chất lượng cao.' },
    { name: 'Canon', slug: 'canon', description: 'Thương hiệu hàng đầu đến từ Nhật Bản, nổi tiếng với các sản phẩm máy ảnh, máy in, máy photocopy.' },
    { name: 'Brother', slug: 'brother', description: 'Thương hiệu uy tín cung cấp các giải pháp in ấn, scan và thiết bị dành cho văn phòng.' },
    { name: 'Epson', slug: 'epson', description: 'Nhà sản xuất máy in, máy chiếu hàng đầu thế giới với công nghệ in phun độc quyền.' },
    { name: 'Ricoh', slug: 'ricoh', description: 'Thương hiệu Nhật Bản nổi tiếng cung cấp máy photocopy và thiết bị văn phòng công suất lớn.' },
    { name: 'Toshiba', slug: 'toshiba', description: 'Cung cấp các dòng máy photocopy đa chức năng mạnh mẽ và bền bỉ.' },
    { name: 'Fuji Xerox', slug: 'fuji-xerox', description: 'Thương hiệu tiên phong về máy in laser và giải pháp tài liệu chuyên nghiệp.' }
  ];

  for (const b of brands) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b
    });
  }
  console.log('Seeded brands successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
