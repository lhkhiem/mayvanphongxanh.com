'use client';

import { useState, useEffect } from 'react';
import { MenuBuilder } from '@/components/admin/MenuBuilder';
import { Menu, getMenuByLocationSync, updateMenuMock, mockMenus } from '@/lib/menuData';

export default function MenuManagementPage() {
  const [activeMenuLocation, setActiveMenuLocation] = useState<'header' | 'footer' | 'mobile' | 'sidebar'>('header');
  const [currentMenu, setCurrentMenu] = useState<Menu | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Tải dữ liệu menu khi đổi location
    const menu = getMenuByLocationSync(activeMenuLocation);
    // Nếu chưa có menu ở vị trí này, tạo một cái giả
    if (menu) {
      setCurrentMenu(JSON.parse(JSON.stringify(menu))); // Clone để tránh sửa trực tiếp
    } else {
      setCurrentMenu({
        id: `menu-${Date.now()}`,
        name: `Menu ${activeMenuLocation}`,
        location: activeMenuLocation,
        items: []
      });
    }
  }, [activeMenuLocation]);

  const handleSave = (updatedMenu: Menu) => {
    // Gọi API giả lập để lưu
    updateMenuMock(activeMenuLocation, updatedMenu.items);
    setCurrentMenu(updatedMenu);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Menu</h1>
        <p className="text-muted-foreground mt-2">
          Kéo thả và tuỳ chỉnh các menu điều hướng cho website của bạn.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['header', 'footer', 'mobile', 'sidebar'].map(loc => (
          <button
            key={loc}
            onClick={() => setActiveMenuLocation(loc as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeMenuLocation === loc 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {loc.charAt(0).toUpperCase() + loc.slice(1)} Menu
          </button>
        ))}
      </div>

      {isSaved && (
        <div className="p-4 mb-6 bg-green-50 text-green-700 border border-green-200 rounded-md">
          Đã lưu menu thành công! Thay đổi sẽ hiển thị trên giao diện người dùng.
        </div>
      )}

      {currentMenu && (
        // Thêm key để force re-render khi chuyển tab
        <MenuBuilder key={currentMenu.id + currentMenu.location} initialMenu={currentMenu} onSave={handleSave} />
      )}
    </div>
  );
}
