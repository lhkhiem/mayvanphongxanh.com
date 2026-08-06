"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Box,
  Tags,
  Warehouse,
  Wrench,
  CalendarClock,
  ShoppingCart,
  Receipt,
  Users,
  MessageSquare,
  Newspaper,
  Image as ImageIcon,
  UserCog,
  ShieldCheck,
  Settings,
  Layers,
  Briefcase,
  FileText,
  HelpCircle,
  Handshake,
  Star,
  History,
} from "lucide-react";

interface SidebarItem {
  title: string;
  href?: string;
  icon?: any;
  isHeader?: boolean;
  badge?: string;
  adminOnly?: boolean;
  permissionCode?: string;
}

const sidebarNavItems: SidebarItem[] = [
  {
    title: "Tổng quan",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "SẢN PHẨM & KHO",
    isHeader: true,
  },
  {
    title: "Sản phẩm",
    href: "/admin/products",
    icon: Box,
    permissionCode: "VIEW_PRODUCTS",
  },
  {
    title: "Danh mục",
    href: "/admin/categories",
    icon: Tags,
    permissionCode: "MANAGE_CATEGORIES",
  },
  {
    title: "Thương hiệu",
    href: "/admin/brands",
    icon: Layers,
    permissionCode: "MANAGE_BRANDS",
  },
  {
    title: "Chính sách",
    href: "/admin/policies",
    icon: ShieldCheck,
    permissionCode: "MANAGE_PRODUCTS",
  },
  {
    title: "Quản lý kho",
    href: "/admin/inventory",
    icon: Warehouse,
    permissionCode: "MANAGE_INVENTORY",
  },
  {
    title: "DỊCH VỤ & CHO THUÊ",
    isHeader: true,
  },
  {
    title: "Thuê máy",
    href: "/admin/rentals",
    icon: CalendarClock,
    permissionCode: "MANAGE_RENTALS",
  },
  {
    title: "Sửa chữa & Bảo hành",
    href: "/admin/maintenance",
    icon: Wrench,
    permissionCode: "MANAGE_MAINTENANCE",
  },
  {
    title: "Dịch vụ trọn gói",
    href: "/admin/services",
    icon: Layers,
    permissionCode: "MANAGE_SERVICES",
  },
  {
    title: "KINH DOANH",
    isHeader: true,
  },
  {
    title: "Đơn hàng",
    href: "/admin/orders",
    icon: ShoppingCart,
    permissionCode: "VIEW_ORDERS",
  },
  {
    title: "Hóa đơn & Thu chi",
    href: "/admin/invoices",
    icon: Receipt,
    permissionCode: "VIEW_ORDERS",
  },
  {
    title: "KHÁCH HÀNG",
    isHeader: true,
  },
  {
    title: "Danh sách",
    href: "/admin/customers",
    icon: Users,
    permissionCode: "MANAGE_CUSTOMERS",
  },
  {
    title: "Liên hệ",
    href: "/admin/feedback",
    icon: MessageSquare,
    permissionCode: "MANAGE_CUSTOMERS",
  },
  {
    title: "NỘI DUNG",
    isHeader: true,
  },
  {
    title: "Bài viết & Tin tức",
    href: "/admin/posts",
    icon: Newspaper,
    permissionCode: "MANAGE_POSTS",
  },
  {
    title: "Danh mục Bài viết",
    href: "/admin/post-categories",
    icon: Tags,
    permissionCode: "MANAGE_POSTS",
  },
  {
    title: "Trang Giới Thiệu",
    href: "/admin/about",
    icon: FileText,
    permissionCode: "MANAGE_POSTS",
  },
  {
    title: "Dự án tiêu biểu",
    href: "/admin/projects",
    icon: Briefcase,
    permissionCode: "MANAGE_PROJECTS",
  },
  {
    title: "Đối tác",
    href: "/admin/partners",
    icon: Handshake,
    permissionCode: "MANAGE_PARTNERS",
  },
  {
    title: "Câu hỏi thường gặp",
    href: "/admin/faqs",
    icon: HelpCircle,
    permissionCode: "MANAGE_FAQS",
  },
  {
    title: "Đánh giá khách hàng",
    href: "/admin/testimonials",
    icon: Star,
    permissionCode: "MANAGE_FAQS",
  },
  {
    title: "Sliders & Banners",
    href: "/admin/sliders",
    icon: ImageIcon,
    permissionCode: "MANAGE_SLIDERS",
  },
  {
    title: "Thư viện Media",
    href: "/admin/media",
    icon: ImageIcon,
    permissionCode: "MANAGE_POSTS",
  },
  {
    title: "HỆ THỐNG",
    isHeader: true,
    adminOnly: true,
  },
  {
    title: "Quản trị viên",
    href: "/admin/staff",
    icon: UserCog,
    adminOnly: true,
    permissionCode: "MANAGE_STAFF",
  },
  {
    title: "Phân quyền",
    href: "/admin/roles",
    icon: ShieldCheck,
    adminOnly: true,
    permissionCode: "MANAGE_ROLES",
  },
  {
    title: "Nhật ký hoạt động",
    href: "/admin/logs",
    icon: History,
    adminOnly: true,
    permissionCode: "VIEW_LOGS",
  },
  {
    title: "Cài đặt chung",
    href: "/admin/settings",
    icon: Settings,
    adminOnly: true,
    permissionCode: "MANAGE_SETTINGS",
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  isUnfoldable: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function AdminSidebar({ isOpen, isUnfoldable, setIsOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const userPermissions = session?.user?.permissions || [];
  const isAdmin = userRole === "Admin" || userPermissions.includes("*");

  const hasPermission = (code?: string) => {
    if (isAdmin) return true;
    if (!code) return true;
    return userPermissions.includes(code);
  };

  const navItems = sidebarNavItems.filter((item, index) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.isHeader) {
      const nextItems = sidebarNavItems.slice(index + 1);
      const nextHeaderIdx = nextItems.findIndex(i => i.isHeader);
      const groupItems = nextHeaderIdx === -1 ? nextItems : nextItems.slice(0, nextHeaderIdx);
      return groupItems.some(i => hasPermission(i.permissionCode) && (!i.adminOnly || isAdmin));
    }
    return hasPermission(item.permissionCode);
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-[#212631] text-white transition-all duration-300 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isUnfoldable ? "lg:w-[70px]" : "w-64"
        )}
      >
        {/* Logo/Brand */}
        <div className="flex h-14 items-center justify-center bg-[#1a1e27] border-b border-gray-800 font-bold text-lg overflow-hidden shrink-0">
          <Link href="/admin" className="flex items-center gap-2 px-4 whitespace-nowrap">
            <Box className="h-7 w-7 text-blue-500 shrink-0" />
            <div className={cn("flex items-center gap-2 transition-opacity duration-300", isUnfoldable ? "opacity-0 w-0 hidden" : "opacity-100")}>
              <span>MVPX</span>
              <span className="text-[10px] bg-blue-600 px-1.5 py-0.5 rounded text-white font-normal">
                CMS
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
          <nav className="grid items-start px-3 text-sm font-medium gap-1">
            {navItems.map((item, index) => {
              if (item.isHeader) {
                return (
                  <div
                    key={index}
                    className={cn(
                      "px-3 mt-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider transition-all",
                      isUnfoldable ? "opacity-0 hidden" : "opacity-100"
                    )}
                  >
                    {item.title}
                  </div>
                );
              }

              const isActive = pathname === item.href;

              return (
                <Link
                  key={index}
                  href={item.href || "#"}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-gray-300 transition-all hover:bg-white/10 hover:text-white group relative",
                    isActive ? "bg-white/10 text-white" : "",
                    isUnfoldable ? "justify-center px-0" : ""
                  )}
                  title={isUnfoldable ? item.title : undefined}
                >
                  {item.icon && <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-200")} />}

                  <span className={cn("whitespace-nowrap transition-all duration-300", isUnfoldable ? "opacity-0 w-0 hidden" : "opacity-100")}>
                    {item.title}
                  </span>

                  {item.badge && !isUnfoldable && (
                    <span
                      className={cn(
                        "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full text-white",
                        item.badge === "NEW" ? "bg-blue-500" : "bg-red-500"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Copyright */}
        <div className={cn("shrink-0 p-4 border-t border-gray-800 text-[11px] text-gray-500", isUnfoldable ? "hidden" : "block")}>
          © {new Date().getFullYear()} Máy Văn Phòng Xanh.
        </div>
      </aside>
    </>
  );
}
