"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

const sidebarNavItems = [
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
  },
  {
    title: "Danh mục",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    title: "Thương hiệu",
    href: "/admin/brands",
    icon: Layers,
  },
  {
    title: "Chính sách",
    href: "/admin/policies",
    icon: ShieldCheck,
  },
  {
    title: "Quản lý kho",
    href: "/admin/inventory",
    icon: Warehouse,
  },
  {
    title: "DỊCH VỤ & CHO THUÊ",
    isHeader: true,
  },
  {
    title: "Thuê máy",
    href: "/admin/rentals",
    icon: CalendarClock,
  },
  {
    title: "Sửa chữa & Bảo hành",
    href: "/admin/maintenance",
    icon: Wrench,
    badge: "3",
  },
  {
    title: "Dịch vụ trọn gói",
    href: "/admin/services",
    icon: Layers,
  },
  {
    title: "KINH DOANH",
    isHeader: true,
  },
  {
    title: "Đơn hàng",
    href: "/admin/orders",
    icon: ShoppingCart,

  },
  {
    title: "Hóa đơn & Thu chi",
    href: "/admin/invoices",
    icon: Receipt,
  },
  {
    title: "KHÁCH HÀNG",
    isHeader: true,
  },
  {
    title: "Danh sách",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Liên hệ",
    href: "/admin/feedback",
    icon: MessageSquare,
  },
  {
    title: "NỘI DUNG",
    isHeader: true,
  },
  {
    title: "Bài viết & Tin tức",
    href: "/admin/posts",
    icon: Newspaper,
  },
  {
    title: "Danh mục Bài viết",
    href: "/admin/post-categories",
    icon: Tags,
  },
  {
    title: "Trang Giới Thiệu",
    href: "/admin/about",
    icon: FileText,
  },
  {
    title: "Dự án tiêu biểu",
    href: "/admin/projects",
    icon: Briefcase,
  },
  {
    title: "Câu hỏi thường gặp",
    href: "/admin/faqs",
    icon: HelpCircle,
  },
  {
    title: "Sliders & Banners",
    href: "/admin/sliders",
    icon: ImageIcon,
  },
  {
    title: "Thư viện Media",
    href: "/admin/media",
    icon: ImageIcon,
  },
  {
    title: "HỆ THỐNG",
    isHeader: true,
  },
  {
    title: "Quản trị viên",
    href: "/admin/staff",
    icon: UserCog,
  },
  {
    title: "Phân quyền",
    href: "/admin/roles",
    icon: ShieldCheck,
  },
  {
    title: "Cài đặt chung",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  isUnfoldable: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function AdminSidebar({ isOpen, isUnfoldable, setIsOpen }: AdminSidebarProps) {
  const pathname = usePathname();

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
            {sidebarNavItems.map((item, index) => {
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
