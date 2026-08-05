'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Package } from 'lucide-react';
import { getMenuByLocationSync, Menu, MenuItem } from '@/lib/menuData';
import { CategoryIcon } from './CategoryIcon';

interface MobileMenuProps {
  onClose: () => void;
  categories?: any[];
}

export function MobileMenu({ onClose, categories: initialCategories = [] }: MobileMenuProps) {
  const [mobileMenu, setMobileMenu] = useState<Menu | null>(null);
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const menu = getMenuByLocationSync('mobile') || getMenuByLocationSync('header');
    setMobileMenu(menu);
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
      .catch(err => console.error('Lỗi fetch categories trong MobileMenu:', err));

    return () => {
      isMounted = false;
    };
  }, [initialCategories]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!mobileMenu || mobileMenu.items.length === 0) {
    return <div className="p-4 text-sm text-gray-500">Đang tải menu...</div>;
  }

  // Inject categories into "Sản phẩm" menu item
  const getEnrichedItems = (): MenuItem[] => {
    return mobileMenu.items.map(item => {
      const isProductMenu =
        item.componentType === 'mega-products' ||
        item.url === '/san-pham' ||
        item.label.trim().toLowerCase() === 'sản phẩm';

      if (isProductMenu && categories.length > 0) {
        const categoryChildren: MenuItem[] = [
          {
            id: 'mob-cat-all',
            label: 'Tất cả sản phẩm',
            url: '/san-pham',
          },
          ...categories.map(cat => ({
            id: `mob-cat-${cat.id || cat.slug || cat.name}`,
            label: cat.name,
            url: `/danh-muc/${cat.slug || encodeURIComponent(cat.name)}`,
            icon: cat.icon,
            color: cat.color,
            children: cat.children && cat.children.length > 0
              ? cat.children.map((sub: any) => ({
                  id: `mob-sub-${sub.id || sub.slug || sub.name}`,
                  label: sub.name,
                  url: `/danh-muc/${sub.slug || encodeURIComponent(sub.name)}`,
                  icon: sub.icon,
                  color: sub.color,
                }))
              : undefined
          }))
        ];

        return {
          ...item,
          children: categoryChildren,
        };
      }
      return item;
    });
  };

  const enrichedItems = getEnrichedItems();

  const renderItem = (item: MenuItem & { icon?: string | null; color?: string | null }, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = !!expandedItems[item.id];

    return (
      <div key={item.id} className="w-full">
        <div
          className={`flex items-center justify-between rounded-lg transition-colors ${
            depth === 0
              ? 'px-4 py-3 hover:bg-gray-100/80 text-gray-800'
              : depth === 1
              ? 'px-3 py-2.5 my-0.5 bg-gray-50/90 hover:bg-primary/10 text-gray-700'
              : 'px-3 py-2 my-0.5 bg-gray-100/50 hover:bg-primary/10 text-gray-600'
          }`}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {depth === 1 && item.id !== 'mob-cat-all' && (
              <CategoryIcon
                icon={item.icon}
                name={item.label}
                color={item.color}
                className="w-5 h-5 text-primary shrink-0"
                fallbackSize="sm"
              />
            )}
            {depth === 1 && item.id === 'mob-cat-all' && (
              <Package className="w-4 h-4 text-primary shrink-0" />
            )}
            {depth > 1 && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
            )}

            <Link
              href={item.url || '#'}
              onClick={(e) => {
                if (!item.url || item.url === '#') {
                  e.preventDefault();
                  if (hasChildren) toggleExpand(item.id);
                } else {
                  onClose();
                }
              }}
              className={`flex-1 truncate ${
                depth === 0
                  ? 'font-semibold text-sm text-gray-900'
                  : depth === 1
                  ? 'font-medium text-sm text-gray-800'
                  : 'text-[13px] text-gray-600'
              }`}
            >
              {item.label}
            </Link>
          </div>

          {hasChildren && (
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-primary transition-colors shrink-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleExpand(item.id);
              }}
              aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="flex flex-col pl-3 border-l-2 border-primary/20 my-1 ml-3 space-y-0.5">
            {item.children!.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border-t border-gray-200 bg-white py-2 lg:hidden max-h-[75vh] overflow-y-auto shadow-inner">
      <div className="flex flex-col px-3 space-y-0.5">
        {enrichedItems.map(item => renderItem(item, 0))}
      </div>
    </div>
  );
}

