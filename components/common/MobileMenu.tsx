'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getMenuByLocationSync, Menu, MenuItem } from '@/lib/menuData';

interface MobileMenuProps {
  onClose: () => void;
}

export function MobileMenu({ onClose }: MobileMenuProps) {
  const [mobileMenu, setMobileMenu] = useState<Menu | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Thường lấy menu 'header' cho mobile nếu không có menu 'mobile' riêng
    const menu = getMenuByLocationSync('mobile') || getMenuByLocationSync('header');
    setMobileMenu(menu);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!mobileMenu || mobileMenu.items.length === 0) {
    return <div className="p-4 text-sm">Đang tải menu...</div>;
  }

  const renderItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id];

    return (
      <div key={item.id} className="w-full">
        <div className="flex items-center justify-between px-4 py-3 hover:bg-secondary rounded-md transition-colors">
          <Link
            href={item.url || '#'}
            onClick={() => { if (!hasChildren) onClose(); }}
            className="flex-1 font-medium text-foreground"
            style={{ paddingLeft: `${depth * 16}px` }}
          >
            {item.label}
          </Link>
          
          {hasChildren && (
            <button 
              className="p-2 text-muted-foreground"
              onClick={(e) => {
                e.preventDefault();
                toggleExpand(item.id);
              }}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="flex flex-col bg-secondary/30 rounded-md mt-1 mb-2">
            {item.children!.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="border-t border-border bg-background py-2 lg:hidden max-h-[70vh] overflow-y-auto">
      <div className="flex flex-col px-2">
        {mobileMenu.items.map(item => renderItem(item, 0))}
      </div>
    </div>
  );
}
