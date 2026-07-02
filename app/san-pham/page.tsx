'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { products } from '@/lib/mockData';
import { ChevronDown, ChevronRight, Search, Home, Filter } from 'lucide-react';

const SORT_OPTIONS = [
  { label: 'Phù hợp nhất', value: 'featured' },
  { label: 'Giá: Thấp đến Cao', value: 'price-asc' },
  { label: 'Giá: Cao đến Thấp', value: 'price-desc' },
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Bán chạy', value: 'best-sellers' },
];

const MOCK_BRANDS = ['HP', 'Canon', 'Epson', 'Brother', 'Dell', 'Lenovo', 'Asus'];

export default function ProductsPage() {
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Multiple selections for Category and Brand
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000000);

  // Calculate dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(100000000);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
    // Since we don't have brand in mockData yet, we'll pretend it matches if no brand is selected
    // If brand is selected, we filter out everything (or mock it randomly, but for now just pass if empty)
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand || 'HP');
    const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
    
    return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
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
    <main className="min-h-screen bg-[#F4F7F6]">
      <Header />
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-[13px] text-gray-500">
          <Link href="/" className="hover:text-primary flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Trang chủ
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium">Sản phẩm</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-[250px] shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <h2 className="font-bold text-gray-800 text-[15px] flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  Bộ lọc
                </h2>
                <button 
                  onClick={clearFilters}
                  className="text-[12px] text-blue-500 hover:text-blue-700 hover:underline"
                >
                  Xóa tất cả
                </button>
              </div>

              {/* Khoảng giá */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 text-[14px] mb-4">
                  Khoảng giá
                </h3>
                
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-center text-[12px] text-gray-600 mb-2">
                      <span>Thấp nhất</span>
                      <span className="font-semibold text-gray-900">{new Intl.NumberFormat('vi-VN').format(minPrice)} ₫</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100000000"
                      step="500000"
                      value={minPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val <= maxPrice) setMinPrice(val);
                      }}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center text-[12px] text-gray-600 mb-2">
                      <span>Cao nhất</span>
                      <span className="font-semibold text-gray-900">{new Intl.NumberFormat('vi-VN').format(maxPrice)} ₫</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100000000"
                      step="500000"
                      value={maxPrice}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= minPrice) setMaxPrice(val);
                      }}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Danh Mục */}
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 text-[13px] uppercase mb-3 flex items-center justify-between cursor-pointer">
                  DANH MỤC
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </h3>
                <div className="space-y-2.5 max-h-[250px] overflow-y-auto custom-scrollbar">
                  {categoryCounts.map((cat) => (
                    <label key={cat.name} className="flex items-start gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.name)}
                        onChange={() => handleCategoryChange(cat.name)}
                        className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary w-3.5 h-3.5"
                      />
                      <span className="text-[13px] text-gray-600 group-hover:text-primary flex-1 leading-snug">
                        {cat.name}
                      </span>
                      <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 rounded">
                        {cat.count}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Thương Hiệu */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 text-[13px] uppercase mb-3 flex items-center justify-between cursor-pointer">
                  THƯƠNG HIỆU
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </h3>
                <div className="space-y-2.5 max-h-[250px] overflow-y-auto custom-scrollbar">
                  {MOCK_BRANDS.map((brand) => (
                    <label key={brand} className="flex items-start gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandChange(brand)}
                        className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary w-3.5 h-3.5"
                      />
                      <span className="text-[13px] text-gray-600 group-hover:text-primary flex-1 leading-snug">
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Top Bar: Search & Sort */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tìm tên sản phẩm, mã SP, giải pháp..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded bg-white border border-gray-200 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              
              <div className="relative shrink-0 sm:w-56 w-full">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none w-full h-10 bg-white border border-gray-200 px-4 py-2 rounded text-sm text-gray-700 pr-10 cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      Sắp xếp: {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>
            </div>

            {/* Products Grid */}
            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg text-center py-16 flex flex-col items-center">
                <Search className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">Không tìm thấy sản phẩm nào phù hợp.</p>
                <button 
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded text-sm hover:bg-primary/90 transition-colors"
                >
                  Xóa bộ lọc
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
