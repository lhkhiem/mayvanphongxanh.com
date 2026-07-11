'use client';

import { useCompare } from '@/context/CompareContext';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { slugify } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function CompareBar() {
  const { items, isOpen, setIsOpen, removeCompareItem, clearCompare } = useCompare();
  const pathname = usePathname();

  // Hide on compare page, admin pages, or if no items
  if (items.length === 0 || pathname === '/compare' || pathname?.startsWith('/admin')) return null;

  return (
    <div className={`fixed bottom-0 left-0 w-full z-50 bg-background border-t shadow-[0_-4px_10px_rgba(0,0,0,0.05)] transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-40px)]'}`}>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background border border-b-0 rounded-t-lg px-4 py-2 flex items-center gap-2 shadow-[0_-4px_6px_rgba(0,0,0,0.02)] text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        Thu gọn so sánh ({items.length})
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>

      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
        {/* Products List */}
        <div className="flex gap-4 items-center flex-1 min-w-max">
          {[0, 1, 2].map((index) => {
            const item = items[index];
            return (
              <div key={index} className="w-40 md:w-48 flex-shrink-0 flex items-center border border-border rounded-lg bg-card overflow-hidden h-24 md:h-28 relative group">
                {item ? (
                  <>
                    <button 
                      onClick={() => removeCompareItem(item.id)}
                      className="absolute top-1 right-1 z-10 w-6 h-6 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-20 md:w-24 h-full relative bg-secondary flex-shrink-0 border-r border-border">
                      <Image src={item.image} alt={item.name} fill className="object-cover p-1" />
                    </div>
                    <div className="p-2 flex-1 flex flex-col justify-center">
                      <p className="text-xs md:text-sm font-medium line-clamp-2 text-foreground" title={item.name}>{item.name}</p>
                    </div>
                  </>
                ) : (
                  <Link 
                    href={items.length > 0 ? `/danh-muc/${slugify(items[0].category)}` : '/san-pham'} 
                    className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground border-2 border-dashed border-border/50 rounded-lg hover:border-primary hover:text-primary transition-colors cursor-pointer"
                  >
                    <span className="text-2xl font-light">+</span>
                    <span className="text-xs">Thêm sản phẩm</span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0 min-w-[140px] pl-4 border-l border-border">
          <Link 
            href="/so-sanh" 
            className={`w-full py-2.5 rounded-lg text-sm font-medium text-center transition-colors ${items.length >= 2 ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground pointer-events-none'}`}
          >
            So sánh ngay
          </Link>
          <button 
            onClick={clearCompare}
            className="w-full py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            Xóa tất cả
          </button>
        </div>
      </div>
    </div>
  );
}
