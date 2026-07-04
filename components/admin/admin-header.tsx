"use client";

import Link from "next/link";
import { Bell, List, Mail, Menu, Moon, Sun, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/components/providers";

interface AdminHeaderProps {
  toggleSidebarMobile: () => void;
  toggleSidebarDesktop: () => void;
}

export function AdminHeader({ toggleSidebarMobile, toggleSidebarDesktop }: AdminHeaderProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:px-6 shadow-sm z-10">
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggleSidebarMobile}
        aria-label="Toggle Menu Mobile"
      >
        <Menu className="h-5 w-5 text-gray-500" />
      </Button>

      {/* Desktop Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden lg:flex"
        onClick={toggleSidebarDesktop}
        aria-label="Toggle Menu Desktop"
      >
        <Menu className="h-5 w-5 text-gray-500" />
      </Button>

      {/* Breadcrumb equivalent / Quick Links */}
      <div className="hidden md:flex items-center text-sm ml-2">
        <Link href="/admin" className="text-gray-500 hover:text-gray-900 transition-colors">
          Home
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Dashboard</span>
      </div>

      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100 rounded-full">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100 rounded-full hidden sm:flex">
          <List className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100 rounded-full hidden sm:flex">
          <Mail className="h-5 w-5" />
        </Button>
        
        <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-500 hover:bg-gray-100 rounded-full"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-9 w-9 rounded-full overflow-hidden border border-gray-200 p-0 ml-1 flex items-center justify-center hover:bg-gray-100 transition-colors focus:outline-none">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/placeholder-user.jpg" alt="@user" />
              <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">{session?.user?.name?.charAt(0) || "AD"}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mt-2" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal bg-gray-50 p-3 -mx-1 -mt-1 rounded-t-sm mb-1 border-b">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold text-gray-900">{session?.user?.name || "Admin User"}</p>
                  <p className="text-xs text-gray-500 font-medium">
                    {session?.user?.email || "admin@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Hồ sơ cá nhân</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Cài đặt hệ thống</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-1">
              <button 
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="w-full flex items-center px-2 py-2 text-sm outline-none transition-colors hover:bg-red-50 hover:text-red-700 text-red-600 rounded-sm cursor-pointer font-medium"
              >
                Đăng xuất
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
