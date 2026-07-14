import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import "dotenv/config"

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding partners data...');

  // 1. Settings
  const settingsData = [
    { key: 'partner_hero_title', value: 'Hệ sinh thái thương hiệu đẳng cấp quốc tế' },
    { key: 'partner_hero_subtitle', value: 'Máy Văn Phòng Xanh tự hào là đối tác chiến lược và nhà phân phối ủy quyền của các thương hiệu thiết bị văn phòng hàng đầu thế giới.' },
    { key: 'partner_hero_btn1_text', value: 'Trở thành đối tác' },
    { key: 'partner_hero_btn1_url', value: '#contact' },
    { key: 'partner_hero_btn2_text', value: 'Liên hệ tư vấn' },
    { key: 'partner_hero_btn2_url', value: 'tel:19001234' },
    { key: 'partner_cta_title', value: 'Bạn cần tư vấn thiết bị cho dự án?' },
    { key: 'partner_cta_subtitle', value: 'Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ chọn cấu hình và báo giá dự án nhanh chóng.' },
    { key: 'partner_stats', value: JSON.stringify([
      { title: "20+", subtitle: "Thương hiệu", desc: "Hợp tác chiến lược" },
      { title: "100%", subtitle: "Chính hãng", desc: "Đầy đủ CO/CQ" },
      { title: "VAT", subtitle: "Hóa đơn", desc: "Hỗ trợ doanh nghiệp" },
      { title: "63", subtitle: "Tỉnh thành", desc: "Giao hàng toàn quốc" }
    ]) }
  ];

  for (const s of settingsData) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value }
    });
  }

  // 2. Clear old certificates and benefits
  await prisma.partnerCertificate.deleteMany({});
  await prisma.partnerBenefit.deleteMany({});

  // 3. Setup Brands and Certificates
  // We need to ensure Canon, HP, Epson, Brother exist.
  const brandsToEnsure = [
    { name: 'Canon', slug: 'canon', logo: '/images/brands/canon.png', isPartner: true },
    { name: 'HP', slug: 'hp', logo: '/images/brands/hp.png', isPartner: true },
    { name: 'Epson', slug: 'epson', logo: '/images/brands/epson.png', isPartner: true },
    { name: 'Brother', slug: 'brother', logo: '/images/brands/brother.png', isPartner: true },
    { name: 'FujiXerox', slug: 'fujixerox', logo: '/images/brands/fujixerox.png', isPartner: true },
    { name: 'Ricoh', slug: 'ricoh', logo: '/images/brands/ricoh.png', isPartner: true },
    { name: 'Panasonic', slug: 'panasonic', logo: '/images/brands/panasonic.png', isPartner: true },
  ];

  const brandIds: Record<string, number> = {};

  for (const b of brandsToEnsure) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: { isPartner: true },
      create: {
        name: b.name,
        slug: b.slug,
        logo: b.logo,
        isPartner: true
      }
    });
    brandIds[b.name] = brand.id;
  }

  // Add Certificates
  await prisma.partnerCertificate.createMany({
    data: [
      {
        brandId: brandIds['Canon'],
        badge: 'Đối tác Bạc',
        scope: 'Máy in, Máy scan & Giải pháp in ấn',
        region: 'Việt Nam',
        validDate: '01/01/2026 - 31/12/2026',
        order: 1
      },
      {
        brandId: brandIds['HP'],
        badge: 'Đại lý Ủy quyền',
        scope: 'Máy in doanh nghiệp & PC',
        region: 'Việt Nam',
        validDate: '15/06/2025 - 15/06/2026',
        order: 2
      },
      {
        brandId: brandIds['Epson'],
        badge: 'Đối tác Vàng',
        scope: 'Máy in phun & Máy chiếu',
        region: 'Toàn quốc',
        validDate: '01/04/2026 - 31/03/2027',
        order: 3
      },
      {
        brandId: brandIds['Brother'],
        badge: 'Đối tác Chiến lược',
        scope: 'Máy in laser & Nhãn dán',
        region: 'Việt Nam',
        validDate: '01/05/2025 - 01/05/2026',
        order: 4
      }
    ]
  });

  // 4. Add Benefits
  await prisma.partnerBenefit.createMany({
    data: [
      {
        icon: 'CheckCircle',
        title: 'Hàng chính hãng 100%',
        description: 'Đầy đủ CO/CQ, nhập chính ngạch, truy xuất xuất xứ từ hãng.',
        order: 1
      },
      {
        icon: 'ShieldCheck',
        title: 'Bảo hành chuẩn hãng',
        description: 'Bảo hành theo chính sách hãng, hỗ trợ đổi mới trong thời gian quy định.',
        order: 2
      },
      {
        icon: 'Users',
        title: 'Hỗ trợ kỹ thuật 24/7',
        description: 'Đội ngũ kỹ thuật viên giàu kinh nghiệm, hỗ trợ triển khai và bảo trì tận nơi.',
        order: 3
      },
      {
        icon: 'MapPin',
        title: 'Phủ sóng toàn quốc',
        description: 'Giao hàng và lắp đặt tận nơi trên khắp 63 tỉnh thành Việt Nam.',
        order: 4
      }
    ]
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
