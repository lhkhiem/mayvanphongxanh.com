import { prisma } from './lib/db';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=1200&h=500&fit=crop',
    badge: '⭐ Giải pháp #1 doanh nghiệp',
    title: 'Giải pháp Văn phòng\nChuyên nghiệp & Toàn diện',
    description: 'Đối tác tin cậy của hàng nghìn doanh nghiệp — máy in, thiết bị văn phòng, vật tư chính hãng và hỗ trợ kỹ thuật chuyên gia.',
    btnPrimaryLabel: 'Xem Sản phẩm',
    btnPrimaryUrl: '/products',
    btnSecondaryLabel: 'Nhận Tư vấn',
    btnSecondaryUrl: '/contact',
    order: 1,
    isActive: true,
  },
  {
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3af4abd8?w=1200&h=500&fit=crop',
    badge: '🔥 Khuyến mãi tháng 7',
    title: 'Máy In Đa Chức Năng\nGiảm Đến 30%',
    description: 'Nâng cấp hiệu suất văn phòng với dòng máy in laser tốc độ cao. Tặng 1 năm bảo trì miễn phí và bộ mực in chính hãng.',
    btnPrimaryLabel: 'Mua Ngay',
    btnPrimaryUrl: '/products',
    btnSecondaryLabel: 'Tìm hiểu thêm',
    btnSecondaryUrl: '/contact',
    order: 2,
    isActive: true,
  },
  {
    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&h=500&fit=crop',
    badge: '💡 Giải pháp số hóa',
    title: 'Hệ thống POS &\nMạng Doanh Nghiệp',
    description: 'Chuyển đổi số toàn diện cho doanh nghiệp bán lẻ và văn phòng. Wifi Mesh không điểm mù & máy POS cấu hình cao.',
    btnPrimaryLabel: 'Khám phá Dịch vụ',
    btnPrimaryUrl: '/contact',
    btnSecondaryLabel: 'Xem thiết bị',
    btnSecondaryUrl: '/products',
    order: 3,
    isActive: true,
  },
];

const bottomTiles = [
  {
    image: '', // Can be a URL
    icon: '💻',
    title: 'Laptop Doanh Nghiệp',
    subTitle: 'Gaming – Đồ họa – Văn phòng',
    url: '/san-pham',
    order: 1,
    isActive: true,
  },
  {
    image: '',
    icon: '🖥️',
    title: 'PC Văn Phòng & Server',
    subTitle: 'Gaming – Workstation – Server',
    url: '/san-pham',
    order: 2,
    isActive: true,
  },
  {
    image: '',
    icon: '🔧',
    title: 'Sửa Chữa – Vệ Sinh',
    subTitle: 'Máy in – Scan – Photocopy',
    url: '/danh-muc/dich-vu',
    order: 3,
    isActive: true,
  },
];

async function main() {
  console.log('Seeding Sliders...');
  for (const slide of slides) {
    await prisma.slider.create({ data: slide });
  }
  console.log('Seeding Banners...');
  for (const tile of bottomTiles) {
    await prisma.banner.create({ data: tile });
  }
  console.log('Seed completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
