import Link from "next/link";
import { Bell, List, Mail, Menu, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth, signOut } from "@/auth";

export async function AdminHeader() {
  const session = await auth();
  
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:px-6 shadow-sm z-10">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Toggle Menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Quick Links / Breadcrumb equivalent for now */}
      <div className="hidden md:flex items-center gap-4 text-sm">
        <Link
          href="/admin"
          className="text-gray-500 hover:text-gray-900 font-medium"
        >
          Dashboard
        </Link>
        <Link
          href="/admin/users"
          className="text-gray-500 hover:text-gray-900 font-medium"
        >
          Users
        </Link>
        <Link
          href="/admin/settings"
          className="text-gray-500 hover:text-gray-900 font-medium"
        >
          Settings
        </Link>
      </div>

      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="text-gray-500">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500">
          <List className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500">
          <Mail className="h-5 w-5" />
        </Button>
        
        <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

        <Button variant="ghost" size="icon" className="text-gray-500">
          <Moon className="h-5 w-5" />
        </Button>

        <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="@user" />
                <AvatarFallback>{session?.user?.name?.charAt(0) || "AD"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session?.user?.name || "Admin User"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email || "admin@example.com"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}>
              <button type="submit" className="w-full flex items-center px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground text-red-600 rounded-sm">
                Đăng xuất
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
