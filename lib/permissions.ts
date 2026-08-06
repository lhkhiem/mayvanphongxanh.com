export interface PermissionDefinition {
  code: string;
  name: string;
  module: "CATALOG" | "SERVICES" | "BUSINESS" | "CMS" | "SYSTEM";
  moduleName: string;
  description: string;
}

export const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  // CATALOG (Sản phẩm & Kho)
  { code: "VIEW_PRODUCTS", name: "Xem Sản phẩm", module: "CATALOG", moduleName: "Sản phẩm & Kho", description: "Xem danh sách và chi tiết sản phẩm" },
  { code: "MANAGE_PRODUCTS", name: "Quản lý Sản phẩm", module: "CATALOG", moduleName: "Sản phẩm & Kho", description: "Thêm, sửa, xóa sản phẩm" },
  { code: "MANAGE_CATEGORIES", name: "Quản lý Danh mục", module: "CATALOG", moduleName: "Sản phẩm & Kho", description: "Thêm, sửa, xóa danh mục sản phẩm" },
  { code: "MANAGE_BRANDS", name: "Quản lý Thương hiệu", module: "CATALOG", moduleName: "Sản phẩm & Kho", description: "Thêm, sửa, xóa thương hiệu & đối tác" },
  { code: "MANAGE_INVENTORY", name: "Quản lý Tồn kho", module: "CATALOG", moduleName: "Sản phẩm & Kho", description: "Nhập, xuất, điều chỉnh tồn kho" },

  // SERVICES (Dịch vụ & Cho thuê)
  { code: "MANAGE_RENTALS", name: "Quản lý Cho thuê máy", module: "SERVICES", moduleName: "Dịch vụ & Cho thuê", description: "Theo dõi máy cho thuê, hợp đồng" },
  { code: "MANAGE_MAINTENANCE", name: "Sửa chữa & Bảo hành", module: "SERVICES", moduleName: "Dịch vụ & Cho thuê", description: "Quản lý yêu cầu bảo hành, sửa chữa" },
  { code: "MANAGE_SERVICES", name: "Dịch vụ trọn gói", module: "SERVICES", moduleName: "Dịch vụ & Cho thuê", description: "Quản lý dịch vụ văn phòng" },

  // BUSINESS (Kinh doanh & Khách hàng)
  { code: "VIEW_ORDERS", name: "Xem Đơn hàng", module: "BUSINESS", moduleName: "Kinh doanh & Khách hàng", description: "Xem danh sách đơn hàng & hóa đơn" },
  { code: "MANAGE_ORDERS", name: "Xử lý Đơn hàng", module: "BUSINESS", moduleName: "Kinh doanh & Khách hàng", description: "Duyệt đơn, chuyển trạng thái đơn hàng" },
  { code: "MANAGE_CUSTOMERS", name: "Quản lý Khách hàng", module: "BUSINESS", moduleName: "Kinh doanh & Khách hàng", description: "Xem danh sách khách hàng & liên hệ" },

  // CMS (Nội dung Website)
  { code: "MANAGE_POSTS", name: "Bài viết & Tin tức", module: "CMS", moduleName: "Nội dung Website", description: "Đăng, sửa, xóa bài viết tin tức & danh mục tin" },
  { code: "MANAGE_PROJECTS", name: "Dự án tiêu biểu", module: "CMS", moduleName: "Nội dung Website", description: "Quản lý dự án công trình" },
  { code: "MANAGE_PARTNERS", name: "Đối tác & Chứng nhận", module: "CMS", moduleName: "Nội dung Website", description: "Quản lý đối tác và giấy chứng nhận" },
  { code: "MANAGE_SLIDERS", name: "Sliders & Banners", module: "CMS", moduleName: "Nội dung Website", description: "Quản lý hình ảnh slider, banner" },
  { code: "MANAGE_FAQS", name: "Câu hỏi thường gặp", module: "CMS", moduleName: "Nội dung Website", description: "Quản lý danh sách FAQ" },

  // SYSTEM (Hệ thống)
  { code: "MANAGE_STAFF", name: "Quản lý Quản trị viên", module: "SYSTEM", moduleName: "Hệ thống", description: "Tạo, sửa, xóa tài khoản quản trị" },
  { code: "MANAGE_ROLES", name: "Quản lý Phân quyền", module: "SYSTEM", moduleName: "Hệ thống", description: "Tạo nhóm quyền & ma trận phân quyền" },
  { code: "VIEW_LOGS", name: "Nhật ký hoạt động", module: "SYSTEM", moduleName: "Hệ thống", description: "Truy vết lịch sử thao tác hệ thống" },
  { code: "MANAGE_SETTINGS", name: "Cài đặt chung", module: "SYSTEM", moduleName: "Hệ thống", description: "Cấu hình website, SMTP email" },
];

export const PERMISSIONS_BY_MODULE = SYSTEM_PERMISSIONS.reduce((acc, perm) => {
  if (!acc[perm.module]) {
    acc[perm.module] = {
      moduleName: perm.moduleName,
      items: []
    };
  }
  acc[perm.module].items.push(perm);
  return acc;
}, {} as Record<string, { moduleName: string; items: PermissionDefinition[] }>);
