"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  PieChart,
  Bell,
  Box,
  Layers,
} from "lucide-react";

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Typography",
    href: "/admin/typography",
    icon: Box,
  },
  {
    title: "COMPONENTS",
    isHeader: true,
  },
  {
    title: "Base",
    href: "/admin/base",
    icon: Layers,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    badge: "NEW",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "PLUGINS",
    isHeader: true,
  },
  {
    title: "Charts",
    href: "/admin/charts",
    icon: PieChart,
  },
  {
    title: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    badge: "PRO",
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-[#212631] text-white md:flex">
      {/* Logo/Brand */}
      <div className="flex h-14 items-center justify-center border-b border-gray-700 font-bold text-lg">
        <Link href="/admin" className="flex items-center gap-2">
          <Box className="h-6 w-6" />
          <span>COREUI NEXT.JS</span>
          <span className="text-xs bg-blue-600 px-1 py-0.5 rounded text-white font-normal ml-1">
            PRO
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-2 text-sm font-medium">
          {sidebarNavItems.map((item, index) => {
            if (item.isHeader) {
              return (
                <div
                  key={index}
                  className="px-4 py-2 mt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  {item.title}
                </div>
              );
            }

            return (
              <Link
                key={index}
                href={item.href || "#"}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-gray-300 transition-all hover:bg-white/10 hover:text-white",
                  pathname === item.href ? "bg-white/10 text-white" : ""
                )}
              >
                {item.icon && <item.icon className="h-5 w-5" />}
                {item.title}
                {item.badge && (
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
    </aside>
  );
}
