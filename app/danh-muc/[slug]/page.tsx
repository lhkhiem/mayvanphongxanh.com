'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { products, categories } from '@/lib/mockData';
import { ChevronDown, Filter, LayoutGrid, ChevronRight } from 'lucide-react';
import { slugify } from '@/lib/utils';
import Link from 'next/link';

const SORT_OPTIONS = [
  { label: 'Nổi bật', value: 'featured' },
  { label: 'Giá: Thấp đến Cao', value: 'price-asc' },
  { label: 'Giá: Cao đến Thấp', value: 'price-desc' },
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Bán chạy nhất', value: 'best-sellers' },
];

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  // Find category by slug
  const category = categories.find(c => slugify(c.name) === slug);
  
  if (!category) {
    notFound();
  }

  // Generate subcategories for the current category
  let subCategories: { name: string; href: string }[] = [];
  const catSlug = slugify(category.name);
  
  if (category.name === 'Máy in') {
    subCategories = [
      { name: 'Máy in Laser', href: `/category/${catSlug}?type=laser` },
      { name: 'Máy in Phun màu', href: `/category/${catSlug}?type=inkjet` },
      { name: 'Máy in Mã vạch', href: `/category/${catSlug}?type=barcode` },
      { name: 'Máy in Hóa đơn', href: `/category/${catSlug}?type=receipt` },
      { name: 'Máy in Khổ lớn', href: `/category/${catSlug}?type=large-format` },
    ];
  } else if (category.name === 'Vật tư') {
    subCategories = [
      { name: 'Mực in chính hãng', href: `/category/${catSlug}?type=ink-original` },
      { name: 'Mực in tương thích', href: `/category/${catSlug}?type=ink-compatible` },
      { name: 'Giấy in các loại', href: `/category/${catSlug}?type=paper` },
      { name: 'Ruy băng & Fim fax', href: `/category/${catSlug}?type=ribbon` },
      { name: 'Linh kiện thay thế', href: `/category/${catSlug}?type=spare-parts` },
    ];
  } else if (category.name === 'Hệ thống POS') {
    subCategories = [
      { name: 'Máy POS cảm ứng', href: `/category/${catSlug}?type=touch-pos` },
      { name: 'Ngăn kéo đựng tiền', href: `/category/${catSlug}?type=cash-drawer` },
      { name: 'Máy quét mã vạch', href: `/category/${catSlug}?type=scanner` },
      { name: 'Màn hình hiển thị', href: `/category/${catSlug}?type=display` },
    ];
  } else if (category.name === 'Mạng viễn thông') {
    subCategories = [
      { name: 'Router WiFi', href: `/category/${catSlug}?type=router` },
      { name: 'Switch PoE', href: `/category/${catSlug}?type=switch` },
      { name: 'Hệ thống WiFi Mesh', href: `/category/${catSlug}?type=mesh` },
      { name: 'Firewall & Bảo mật', href: `/category/${catSlug}?type=firewall` },
      { name: 'Cáp mạng & Phụ kiện', href: `/category/${catSlug}?type=cables` },
    ];
  } else if (category.name === 'Thiết bị') {
    subCategories = [
      { name: 'Máy hủy tài liệu', href: `/category/${catSlug}?type=shredder` },
      { name: 'Máy chấm công', href: `/category/${catSlug}?type=time-attendance` },
      { name: 'Máy chiếu', href: `/category/${catSlug}?type=projector` },
      { name: 'Thiết bị họp trực tuyến', href: `/category/${catSlug}?type=video-conference` },
    ];
  } else {
    subCategories = [
      { name: 'Bảo trì máy in', href: '/services/printer-maintenance' },
      { name: 'Sửa chữa tận nơi', href: '/services/repair' },
      { name: 'Nạp mực in', href: '/services/ink-refill' },
      { name: 'Thiết kế thi công mạng', href: '/services/network-setup' },
    ];
  }

  const [sortBy, setSortBy] = useState('featured');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000000);
  const [showFilters, setShowFilters] = useState(false);

  // Filter products by this category and price range
  const categoryProducts = products.filter((p) => {
    const isInCategory = p.category === category.name;
    const priceMatch = p.price >= minPrice && p.price <= maxPrice;
    return isInCategory && priceMatch;
  });

  const sortedProducts = [...categoryProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'newest':
        return b.id - a.id;
      case 'best-sellers':
        return b.reviews - a.reviews;
      default:
        return 0;
    }
  });

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Simple Breadcrumb */}
      <div className="w-full max-w-7xl mx-auto px-4 pt-6 pb-1">
        <div className="flex items-center justify-start gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/san-pham" className="hover:text-primary transition-colors">Sản phẩm</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{category.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-2 pb-8 lg:pt-4 lg:pb-12 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex justify-between items-center mb-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-card text-foreground"
            >
              <Filter className="w-4 h-4" />
              Lọc sản phẩm
            </button>
            <div className="text-sm text-muted-foreground">
              {sortedProducts.length} sản phẩm
            </div>
          </div>

          {/* Sidebar Filters */}
          <aside className={`w-full lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-card border border-border rounded-xl p-6 sticky top-28 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-lg mb-6 pb-4 border-b border-border">
                <Filter className="w-5 h-5 text-primary" />
                Bộ lọc
              </div>

              {/* Price Filter */}
              <div className="mb-8">
                <h3 className="font-semibold text-foreground mb-4 flex justify-between items-center">
                  Khoảng giá
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>Thấp nhất</span>
                      <span className="font-medium text-foreground">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(minPrice)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50000000"
                      step="500000"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="w-full accent-primary h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-2">
                      <span>Cao nhất</span>
                      <span className="font-medium text-foreground">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(maxPrice)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50000000"
                      step="500000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-primary h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Sub Categories */}
              <div className="border-t border-border pt-8 mt-6">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                    <LayoutGrid className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-foreground text-lg tracking-tight">{category.name}</h3>
                </div>
                
                <div className="flex flex-col p-1.5 bg-secondary/30 rounded-xl border border-border/50 shadow-inner">
                  {subCategories.map((sub, idx) => (
                    <Link 
                      key={idx} 
                      href={sub.href}
                      className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-background hover:shadow-sm text-sm text-muted-foreground hover:text-primary transition-all duration-300 group relative overflow-hidden"
                    >
                      {/* Active indicator bar */}
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-primary rounded-r-full transition-all duration-300 group-hover:h-3/4 opacity-0 group-hover:opacity-100"></span>
                      
                      <div className="flex items-center gap-3 pl-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 group-hover:bg-primary transition-colors group-hover:scale-125"></span>
                        <span className="font-medium">{sub.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0 text-primary" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and Results Bar */}
            <div className="hidden lg:flex items-center justify-between mb-8 bg-card border border-border p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <LayoutGrid className="w-5 h-5 text-primary" />
                <span>Hiển thị <strong className="text-foreground">{sortedProducts.length}</strong> sản phẩm {category.name}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Sắp xếp theo:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-background border border-border px-4 py-2 rounded-lg text-sm font-medium text-foreground pr-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50 transition-colors"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card border border-border rounded-xl">
                <div className="text-6xl mb-4 opacity-50">{category.icon}</div>
                <h3 className="text-xl font-bold text-foreground mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Không có sản phẩm nào trong danh mục này phù hợp với bộ lọc giá của bạn. Vui lòng điều chỉnh lại khoảng giá.
                </p>
                <button 
                  onClick={() => {
                    setMinPrice(0);
                    setMaxPrice(50000000);
                  }}
                  className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Xóa bộ lọc giá
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
