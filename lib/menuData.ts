export interface MenuItem {
  id: string;
  label: string;
  url?: string;
  componentType?: 'mega-products'; // Để render các khối đặc biệt như Mega Menu
  children?: MenuItem[];
}

export interface Menu {
  id: string;
  name: string;
  location: 'header' | 'footer' | 'mobile' | 'sidebar';
  items: MenuItem[];
}

// Giả lập dữ liệu Menu ban đầu từ Database
export let mockMenus: Menu[] = [
  {
    id: '1',
    name: 'Main Header Menu',
    location: 'header',
    items: [
      { id: 'mi-1', label: 'Trang chủ', url: '/' },
      { 
        id: 'mi-2', 
        label: 'Sản phẩm', 
        url: '/san-pham',
        componentType: 'mega-products',
      },
      { id: 'mi-3', label: 'Dịch vụ trọn gói', url: '/danh-muc/goi-dich-vu' },
      { id: 'mi-rental', label: 'Cho thuê máy', url: '/cho-thue-may' },
      { 
        id: 'mi-4', 
        label: 'Tra cứu',
        children: [
          { id: 'mi-4-1', label: 'Đơn hàng', url: '/tra-cuu-don-hang' },
          { id: 'mi-4-2', label: 'Bảo hành', url: '/tra-cuu-bao-hanh' },
        ]
      },
      { 
        id: 'mi-5', 
        label: 'Khám phá',
        children: [
          { id: 'mi-5-1', label: 'Dự án triển khai', url: '/du-an' },
          { id: 'mi-5-2', label: 'Tin tức', url: '/tin-tuc' },
        ]
      },
      { id: 'mi-6', label: 'Đối tác', url: '/doi-tac' },
      { id: 'mi-7', label: 'Giới thiệu', url: '/gioi-thieu' },
      { id: 'mi-8', label: 'Liên hệ', url: '/lien-he' },
    ]
  }
];

// Hàm giả lập đồng bộ (cho client component cần ngay)
export const getMenuByLocationSync = (location: Menu['location']): Menu | null => {
  return mockMenus.find(m => m.location === location) || null;
};

// API Mock để update dữ liệu
export const updateMenuMock = (location: Menu['location'], updatedItems: MenuItem[]) => {
  const menuIndex = mockMenus.findIndex(m => m.location === location);
  if (menuIndex > -1) {
    mockMenus[menuIndex].items = updatedItems;
  }
}

