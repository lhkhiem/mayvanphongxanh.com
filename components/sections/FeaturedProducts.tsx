'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/products/ProductCard';
import { ChevronRight, ChevronLeft, TrendingUp } from 'lucide-react';

const CARD_WIDTH = 228; // px

export function FeaturedProducts({ products = [], categories = [] }: { products?: any[], categories?: any[] }) {
  const allCategories = ['Tất cả', ...categories.map(c => c.name)];
  const [activeTab, setActiveTab] = useState('Tất cả');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = activeTab === 'Tất cả'
    ? products.filter(p => p.category !== 'Gói dịch vụ').slice(0, 12)
    : products.filter(p => p.category === activeTab).slice(0, 12);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = CARD_WIDTH * 2 + 16;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="py-8 bg-[#F4F7F6]">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1 h-6 rounded-full bg-primary inline-block" />
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-gray-800">Sản phẩm Nổi bật</h2>
          </div>
          <Link
            href="/san-pham"
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group"
          >
            Xem tất cả
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Carousel */}
        <div className="relative group/carousel">
          {/* Left arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:text-primary hover:border-primary transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-105"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable row */}
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filtered.map(product => (
              <div key={product.id} className="shrink-0 w-full sm:w-[228px] snap-center">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  category={product.category}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  rating={product.rating}
                  reviews={product.reviews}
                  image={product.image}
                  stock={product.stock}
                />
              </div>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:text-primary hover:border-primary transition-all opacity-0 group-hover/carousel:opacity-100 hover:scale-105"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
