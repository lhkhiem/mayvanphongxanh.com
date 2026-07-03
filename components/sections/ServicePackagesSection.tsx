'use client';

import Link from 'next/link';
import { productSlug } from '@/lib/utils';
import { ChevronRight, CheckCircle2, Package, ArrowRight } from 'lucide-react';

export function ServicePackagesSection({ products = [] }: { products?: any[] }) {
  const servicePackages = products;

  if (servicePackages.length === 0) return null;

  return (
    <section className="py-8 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-1 h-6 rounded-full bg-primary inline-block" />
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-gray-800">Gói Dịch Vụ Trọn Gói</h2>
          </div>
          <Link href="/danh-muc/goi-dich-vu" className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 group">
            Xem tất cả
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {servicePackages.map((pkg, idx) => {
            const discount = pkg.originalPrice
              ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)
              : 0;

            const gradients = [
              'from-blue-600 to-indigo-700',
              'from-purple-600 to-pink-700',
              'from-green-600 to-teal-700',
            ];

            return (
              <div
                key={pkg.id}
                className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Colored top bar */}
                <div className={`h-2 bg-gradient-to-r ${gradients[idx % gradients.length]}`} />

                {/* Image */}
                <div className="relative h-40 overflow-hidden bg-gray-100">
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {discount > 0 && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      -{discount}%
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-800 text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{pkg.description}</p>

                  {/* Included items */}
                  {(pkg as any).includedItems && (
                    <ul className="space-y-1 mb-4">
                      {((pkg as any).includedItems as string[]).slice(0, 4).map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                      {((pkg as any).includedItems as string[]).length > 4 && (
                        <li className="text-xs text-primary font-medium pl-5.5">
                          +{((pkg as any).includedItems as string[]).length - 4} hạng mục khác...
                        </li>
                      )}
                    </ul>
                  )}

                  {/* Price & CTA */}
                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-extrabold text-primary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}
                      </p>
                      {pkg.originalPrice && (
                        <p className="text-xs text-gray-400 line-through">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.originalPrice)}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/san-pham/${productSlug(pkg.name || pkg.title || '', pkg.id)}`}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors group/btn"
                    >
                      Chi tiết
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
