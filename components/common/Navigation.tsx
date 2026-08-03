'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LayoutGrid, ArrowRight } from 'lucide-react';
import { getMenuByLocationSync, Menu, MenuItem } from '@/lib/menuData';
import { CategoryIcon } from './CategoryIcon';

export function Navigation({ categories: initialCategories = [] }: { categories?: any[] }) {
  const [headerMenu, setHeaderMenu] = useState<Menu | null>(null);
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [activeSide, setActiveSide] = useState<number | null>(null);
  const catDropdownRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    setHeaderMenu(getMenuByLocationSync('header'));
  }, []);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories);
      return;
    }

    let isMounted = true;
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (isMounted && Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(err => console.error('Error fetching categories in Navigation:', err));

    return () => {
      isMounted = false;
    };
  }, [initialCategories.length]);

  // Click outside to close category dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(event.target as Node)) {
        setIsCatOpen(false);
        setActiveSide(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      <div ref={catDropdownRef} className="relative flex items-center mr-1">
        {isHomePage ? (
          <div className="relative flex items-center gap-2 px-3 h-11 text-white font-bold text-[13px] uppercase tracking-wider cursor-default select-none">
            <LayoutGrid className="w-4 h-4" />
            <span>DANH MỤC SẢN PHẨM</span>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => { setIsCatOpen(!isCatOpen); setActiveSide(null); }}
              className="relative flex items-center gap-2 px-3 h-11 text-white/90 hover:text-white font-bold text-[13px] uppercase tracking-wider transition-colors cursor-pointer group after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[3px] after:bg-white after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-center"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>DANH MỤC SẢN PHẨM</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCatOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCatOpen && (
              <div
                className="absolute top-full left-0 mt-1 z-[999] flex pointer-events-auto shadow-2xl rounded-lg"
                onMouseLeave={() => setActiveSide(null)}
              >
                {/* Main category list */}
                <div className="w-[240px] bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden flex flex-col max-h-[80vh]">
                  <div className="overflow-y-auto py-2">
                    {categories.length > 0 ? (
                      categories.map((cat: any, idx: number) => (
                        <div
                          key={cat.id ?? cat.slug ?? cat.name}
                          className="relative"
                          onMouseEnter={() => setActiveSide(idx)}
                        >
                          <Link
                            href={`/danh-muc/${cat.slug ?? encodeURIComponent(cat.name)}`}
                            onClick={() => setIsCatOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-all ${
                              activeSide === idx
                                ? 'bg-gray-50 text-primary'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                            }`}
                          >
                            <CategoryIcon
                              icon={cat.icon}
                              name={cat.name}
                              color={cat.color}
                              className="w-5 h-5 text-primary shrink-0"
                              fallbackSize="sm"
                            />
                            <span className="flex-1 truncate">{cat.name}</span>
                            {cat.children && cat.children.length > 0 && (
                              <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-gray-400 shrink-0" />
                            )}
                          </Link>
                        </div>
                      ))
                    ) : (
                      <Link
                        href="/san-pham"
                        onClick={() => setIsCatOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-all"
                      >
                        <CategoryIcon name="Tất cả" className="w-5 h-5 text-primary shrink-0" fallbackSize="sm" />
                        Tất cả sản phẩm
                      </Link>
                    )}
                  </div>
                </div>

                {/* Flyout submenu */}
                {activeSide !== null && categories[activeSide]?.children?.length > 0 && (
                  <div className="ml-1 w-[280px] bg-white border border-gray-200 shadow-xl rounded-lg p-4 max-h-[80vh] overflow-y-auto">
                    <div className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2 pb-2 border-b border-gray-100 text-gray-900">
                      <CategoryIcon
                        icon={categories[activeSide].icon}
                        name={categories[activeSide].name}
                        color={categories[activeSide].color}
                        className="w-5 h-5 text-primary shrink-0"
                        fallbackSize="sm"
                      />
                      {categories[activeSide].name}
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {categories[activeSide].children.map((sub: any) => (
                        <Link
                          key={sub.slug ?? sub.name}
                          href={`/danh-muc/${sub.slug ?? encodeURIComponent(sub.name)}`}
                          onClick={() => setIsCatOpen(false)}
                          className="flex items-center gap-2 py-1.5 px-2 text-[13px] text-gray-600 hover:text-primary hover:bg-primary/5 rounded-md transition-colors group"
                        >
                          <span className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-primary transition-colors shrink-0" />
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Other nav items */}
      <div className="flex items-center">
        {headerMenu.items.map(renderMenuItem)}
      </div>
    </div>
  );
}
