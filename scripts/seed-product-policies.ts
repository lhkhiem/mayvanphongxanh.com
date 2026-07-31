import 'dotenv/config';
import { prisma } from '../lib/db';

const defaultPolicies = [
  { id: 1, icon: 'Truck', title: 'Giao hàng miễn phí', description: 'Cho đơn hàng từ 1.000.000đ' },
  { id: 2, icon: 'Wrench', title: 'Hỗ trợ cài đặt sử dụng', description: 'Tối đa 3 thiết bị / Hướng dẫn tận nơi' },
  { id: 3, icon: 'Gift', title: 'Giảm giá mực nạp 15%', description: 'Áp dụng cho lần nạp mực đầu tiên' },
  { id: 4, icon: 'ShieldCheck', title: 'Bảo hành chính hãng', description: 'Cam kết 100% chính hãng, bảo hành 12-24 tháng' },
  { id: 5, icon: 'RefreshCw', title: 'Đổi trả 1 đổi 1', description: 'Trong 30 ngày nếu lỗi từ nhà sản xuất' },
  { id: 6, icon: 'Headphones', title: 'Hỗ trợ kỹ thuật 24/7', description: 'Đội ngũ kỹ thuật tư vấn nhanh chóng' },
  { id: 7, icon: 'CheckCircle2', title: 'Miễn phí mực & bảo trì', description: 'Đã bao gồm trọn gói trong dịch vụ thuê' },
  { id: 8, icon: 'Clock', title: 'Giao hàng hỏa tốc 2H', description: 'Nội thành TP.HCM & Hà Nội' },
];

async function main() {
  console.log('Seeding Product Policies...');
  for (const pol of defaultPolicies) {
    await prisma.productPolicy.upsert({
      where: { id: pol.id },
      update: { icon: pol.icon, title: pol.title, description: pol.description },
      create: pol,
    });
  }
  console.log('Product Policies seeded successfully!');

  // Now let's link specific, different policies to products based on their category/type/brand!
  const products = await prisma.product.findMany({
    include: { category: true }
  });

  for (const p of products) {
    let policyIds: number[] = [];
    const catName = p.category?.name?.toLowerCase() || '';
    const isRental = p.productType === 'rental' || p.name.toLowerCase().includes('thuê');

    if (isRental) {
      // Rental policies
      policyIds = [7, 6, 5, 1]; // Miễn phí mực & bảo trì, Hỗ trợ kỹ thuật 24/7, Đổi trả 1 đổi 1, Giao hàng miễn phí
    } else if (catName.includes('mực') || catName.includes('vật tư') || catName.includes('phụ kiện')) {
      // Ink / Consumable policies
      policyIds = [8, 4, 3, 1]; // Giao hàng 2H, Bảo hành chính hãng, Giảm giá mực nạp 15%, Giao hàng miễn phí
    } else if (p.name.toLowerCase().includes('đơn năng') || p.name.toLowerCase().includes('p2500') || p.name.toLowerCase().includes('p3300')) {
      // Single function printers
      policyIds = [1, 4, 5, 8]; // Giao hàng miễn phí, Bảo hành chính hãng, Đổi trả 1 đổi 1, Giao hàng hỏa tốc 2H
    } else if (p.name.toLowerCase().includes('đa năng') || p.name.toLowerCase().includes('m6702') || p.name.toLowerCase().includes('bm5100')) {
      // Multi-function printers
      policyIds = [1, 2, 3, 4]; // Giao hàng miễn phí, Hỗ trợ cài đặt, Giảm 15% mực, Bảo hành chính hãng
    } else {
      // Standard printer policies
      policyIds = [1, 4, 5, 6]; // Giao hàng miễn phí, Bảo hành chính hãng, Đổi trả 1 đổi 1, Hỗ trợ kỹ thuật 24/7
    }

    await prisma.product.update({
      where: { id: p.id },
      data: {
        policies: {
          set: policyIds.map(id => ({ id }))
        }
      }
    });
    console.log(`Updated product ID ${p.id} (${p.name}): policyIds = [${policyIds.join(', ')}]`);
  }

  console.log('All products updated with customized policy sets!');
}

main().catch(console.error).finally(() => process.exit(0));
