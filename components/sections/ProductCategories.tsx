'use client';

import Link from 'next/link';
import { categories } from '@/lib/mockData';
import { slugify } from '@/lib/utils';
import { ChevronRight, LayoutGrid } from 'lucide-react';

const categoryColors: Record<string, string> = {
  'Máy in': 'from-blue-50 to-blue-100 border-blue-200 hover:border-blue-400',
  'Vật tư': 'from-green-50 to-green-100 border-green-200 hover:border-green-400',
  'Hệ thống POS': 'from-purple-50 to-purple-100 border-purple-200 hover:border-purple-400',
  'Mạng viễn thông': 'from-cyan-50 to-cyan-100 border-cyan-200 hover:border-cyan-400',
  'Thiết bị': 'from-orange-50 to-orange-100 border-orange-200 hover:border-orange-400',
  'Dịch vụ': 'from-red-50 to-red-100 border-red-200 hover:border-red-400',
  'Gói dịch vụ': 'from-yellow-50 to-yellow-100 border-yellow-200 hover:border-yellow-400',
};

export function ProductCategories() {
  return (
    <section className="py-6 bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1 h-6 rounded-full bg-primary inline-block" />
            <LayoutGrid className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-gray-800">Danh mục Sản phẩm</h2>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 group">
            Tất cả danh mục
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${slugify(cat.name)}`}
              className={`group flex flex-col items-center gap-2 p-3.5 rounded-xl border bg-gradient-to-b ${categoryColors[cat.name] || 'from-gray-50 to-gray-100 border-gray-200 hover:border-gray-400'} transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
              <span className="text-xs font-semibold text-gray-700 text-center leading-tight group-hover:text-primary transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
