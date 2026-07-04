"use client";

import { useState, useEffect } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { usePathname } from "next/navigation";

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile state
  const [isSidebarUnfoldable, setIsSidebarUnfoldable] = useState(false); // Desktop state

  const pathname = usePathname();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
      <AdminSidebar
        isOpen={isSidebarOpen}
        isUnfoldable={isSidebarUnfoldable}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex flex-1 flex-col overflow-hidden w-full relative">
        <AdminHeader
          toggleSidebarMobile={() => setIsSidebarOpen(!isSidebarOpen)}
          toggleSidebarDesktop={() => setIsSidebarUnfoldable(!isSidebarUnfoldable)}
        />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
