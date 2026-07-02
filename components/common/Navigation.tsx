'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, LayoutGrid, ArrowRight } from 'lucide-react';
import { getMenuByLocationSync, Menu, MenuItem } from '@/lib/menuData';

export function Navigation() {
  const [headerMenu, setHeaderMenu] = useState<Menu | null>(null);

  useEffect(() => {
    setHeaderMenu(getMenuByLocationSync('header'));
  }, []);

  if (!headerMenu || headerMenu.items.length === 0) {
    return (
      <div className="flex items-center gap-1 h-11">
        <span className="text-sm text-white/60">Đang tải menu...</span>
      </div>
    );
  }

  const renderMenuItem = (item: MenuItem) => {

    if (item.children && item.children.length > 0) {
      return (
        <div key={item.id} className="relative group h-11 flex items-center">
          <button className="relative flex items-center gap-1 text-white/90 hover:text-white font-bold text-[13px] uppercase tracking-wider transition-colors h-full px-3 cursor-pointer after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[3px] after:bg-white after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-center">
            {item.label}
            <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
          </button>
          <div className="absolute top-full left-0 w-52 bg-white border border-gray-200 rounded-b-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-1.5">
            {item.children.map(child => (
              <Link
                key={child.id}
                href={child.url || '#'}
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors uppercase"
              >
                <ArrowRight className="w-3 h-3 text-primary/60" />
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.url || '#'}
        className="relative flex items-center text-white/90 hover:text-white font-bold text-[13px] uppercase tracking-wider transition-colors h-11 px-3 group after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[3px] after:bg-white after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-center"
      >
        {item.label}
      </Link>
    );
  };

  return (
    <div className="flex items-center">
      {/* Danh mục sản phẩm link */}
      <div className="flex items-center mr-1">
        <Link href="/san-pham" className="relative flex items-center gap-2 px-3 h-11 text-white/90 hover:text-white font-bold text-[13px] uppercase tracking-wider transition-colors group after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[3px] after:bg-white after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-center">
          <LayoutGrid className="w-4 h-4" />
          <span>DANH MỤC SẢN PHẨM</span>
        </Link>
      </div>

      {/* Other nav items */}
      <div className="flex items-center">
        {headerMenu.items.map(renderMenuItem)}
      </div>
    </div>
  );
}
