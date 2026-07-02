'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ArrowRight, Star } from 'lucide-react';
import { categories, products } from '@/lib/mockData';

import { slugify, productSlug } from '@/lib/utils';

// Generate some dummy subcategories based on categories
const megaMenuData = categories.map((cat) => {
  let subCategories: { name: string; href: string }[] = [];
  const catSlug = slugify(cat.name);
  
  if (cat.name === 'Máy in') {
    subCategories = [
      { name: 'Máy in Laser', href: `/danh-muc/${catSlug}?type=laser` },
      { name: 'Máy in Phun màu', href: `/danh-muc/${catSlug}?type=inkjet` },
      { name: 'Máy in Mã vạch', href: `/danh-muc/${catSlug}?type=barcode` },
      { name: 'Máy in Hóa đơn', href: `/danh-muc/${catSlug}?type=receipt` },
      { name: 'Máy in Khổ lớn', href: `/danh-muc/${catSlug}?type=large-format` },
    ];
  } else if (cat.name === 'Vật tư') {
    subCategories = [
      { name: 'Mực in chính hãng', href: `/danh-muc/${catSlug}?type=ink-original` },
      { name: 'Mực in tương thích', href: `/danh-muc/${catSlug}?type=ink-compatible` },
      { name: 'Giấy in các loại', href: `/danh-muc/${catSlug}?type=paper` },
      { name: 'Ruy băng & Fim fax', href: `/danh-muc/${catSlug}?type=ribbon` },
      { name: 'Linh kiện thay thế', href: `/danh-muc/${catSlug}?type=spare-parts` },
    ];
  } else if (cat.name === 'Hệ thống POS') {
    subCategories = [
      { name: 'Máy POS cảm ứng', href: `/danh-muc/${catSlug}?type=touch-pos` },
      { name: 'Ngăn kéo đựng tiền', href: `/danh-muc/${catSlug}?type=cash-drawer` },
      { name: 'Máy quét mã vạch', href: `/danh-muc/${catSlug}?type=scanner` },
      { name: 'Màn hình hiển thị', href: `/danh-muc/${catSlug}?type=display` },
    ];
  } else if (cat.name === 'Mạng viễn thông') {
    subCategories = [
      { name: 'Router WiFi', href: `/danh-muc/${catSlug}?type=router` },
      { name: 'Switch PoE', href: `/danh-muc/${catSlug}?type=switch` },
      { name: 'Hệ thống WiFi Mesh', href: `/danh-muc/${catSlug}?type=mesh` },
      { name: 'Firewall & Bảo mật', href: `/danh-muc/${catSlug}?type=firewall` },
      { name: 'Cáp mạng & Phụ kiện', href: `/danh-muc/${catSlug}?type=cables` },
    ];
  } else if (cat.name === 'Thiết bị') {
    subCategories = [
      { name: 'Máy hủy tài liệu', href: `/danh-muc/${catSlug}?type=shredder` },
      { name: 'Máy chấm công', href: `/danh-muc/${catSlug}?type=time-attendance` },
      { name: 'Máy chiếu', href: `/danh-muc/${catSlug}?type=projector` },
      { name: 'Thiết bị họp trực tuyến', href: `/danh-muc/${catSlug}?type=video-conference` },
    ];
  } else {
    subCategories = [
      { name: 'Bảo trì máy in', href: '/danh-muc/dich-vu?type=printer-maintenance' },
      { name: 'Sửa chữa tận nơi', href: '/danh-muc/dich-vu?type=repair' },
      { name: 'Nạp mực in', href: '/danh-muc/dich-vu?type=ink-refill' },
      { name: 'Thiết kế thi công mạng', href: '/danh-muc/dich-vu?type=network-setup' },
    ];
  }

  return { ...cat, subCategories };
});

export function ProductsMegaMenu() {
  const [activeCategory, setActiveCategory] = useState(megaMenuData[0]);
  const featuredProduct = products.find(p => p.id === 1); // Example featured product

  return (
    <div className="group relative">
      <Link
        href="/san-pham"
        className="flex items-center gap-1 text-white/90 hover:text-white font-medium text-sm h-11 px-3 hover:bg-white/10 rounded transition-colors"
      >
        Sản phẩm
        <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
      </Link>

      {/* Mega Menu Dropdown */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-[800px] bg-background border border-border shadow-2xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 z-50 overflow-hidden mt-2">
        <div className="flex h-[400px]">
          {/* Sidebar: Categories (Level 1) */}
          <div className="w-1/3 bg-secondary/30 border-r border-border py-4">
            {megaMenuData.map((category) => (
              <div
                key={category.id}
                onMouseEnter={() => setActiveCategory(category)}
                className={`px-6 py-3 cursor-pointer flex items-center justify-between transition-colors ${
                  activeCategory.id === category.id
                    ? 'bg-background border-l-4 border-primary text-primary font-semibold'
                    : 'hover:bg-secondary text-foreground hover:text-primary border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{category.icon}</span>
                  <span className="text-sm">{category.name}</span>
                </div>
                <ArrowRight className={`w-4 h-4 transition-opacity ${activeCategory.id === category.id ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            ))}
          </div>

          {/* Main Content: Subcategories & Featured (Level 2) */}
          <div className="w-2/3 p-6 flex flex-col justify-between">
            <div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-2">
                {activeCategory.subCategories.map((sub, idx) => (
                  <Link
                    key={idx}
                    href={sub.href}
                    className="text-sm text-muted-foreground hover:text-primary hover:underline flex items-center gap-2 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Featured Product Banner */}
            {featuredProduct && activeCategory.id === 1 && (
              <div className="mt-8 bg-gradient-to-r from-primary/10 to-transparent rounded-lg p-4 border border-primary/20 flex gap-4 items-center">
                <div className="w-20 h-20 bg-background rounded-md overflow-hidden shrink-0 shadow-sm border border-border">
                  <img src={featuredProduct.image} alt={featuredProduct.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold mb-1">
                    <Star className="w-3 h-3 fill-current" /> Sản phẩm nổi bật
                  </div>
                  <h4 className="text-sm font-bold text-foreground line-clamp-1">{featuredProduct.name}</h4>
                  <div className="text-primary font-semibold text-sm mt-1">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(featuredProduct.price)}
                  </div>
                  <Link href={`/san-pham/${productSlug(featuredProduct.name, featuredProduct.id)}`} className="text-xs text-primary hover:underline mt-2 inline-block">
                    Xem chi tiết &rarr;
                  </Link>
                </div>
              </div>
            )}

            {/* Promo banner for other categories */}
            {activeCategory.id !== 1 && (
              <div className="mt-8 bg-secondary rounded-lg p-5 flex justify-between items-center border border-border">
                <div>
                  <h4 className="text-sm font-bold text-foreground">Giảm giá lên đến 20%</h4>
                  <p className="text-xs text-muted-foreground mt-1">Cho các đơn hàng {activeCategory.name.toLowerCase()} trong tháng này.</p>
                </div>
                <Link href={`/danh-muc/${slugify(activeCategory.name)}`} className="text-xs font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                  Khám phá
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="bg-primary/5 px-6 py-3 border-t border-border flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Bạn cần tư vấn trực tiếp?</span>
          <Link href="/lien-he" className="text-xs font-medium text-primary hover:underline">
            Liên hệ chuyên gia
          </Link>
        </div>
      </div>
    </div>
  );
}
