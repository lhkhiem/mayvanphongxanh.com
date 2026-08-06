"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, FileText, Search, RefreshCw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalesDashboardView } from "./sales-view";
import { ContentDashboardView } from "./content-view";
import { SeoDashboardView } from "./seo-view";
import { SalesDashboardData, ContentDashboardData, SeoDashboardData } from "@/app/(admin)/admin/(dashboard)/actions";
import { useRouter } from "next/navigation";

export function DashboardClient({
  salesData,
  contentData,
  seoData,
}: {
  salesData: SalesDashboardData;
  contentData: ContentDashboardData;
  seoData: SeoDashboardData;
}) {
  const [activeTab, setActiveTab] = useState("sales");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <LayoutDashboard className="w-7 h-7 text-primary" />
            Tổng Quan Dashboard Bán Hàng, Nội Dung & SEO
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Hệ thống báo cáo thời gian thực MayVanPhongXanh.com
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
            Làm mới dữ liệu
          </Button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <Tabs defaultValue="sales" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-xl h-11 p-1 bg-muted rounded-xl">
          <TabsTrigger
            value="sales"
            className="text-xs sm:text-sm font-medium gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            <span>Bán Hàng</span>
          </TabsTrigger>
          <TabsTrigger
            value="content"
            className="text-xs sm:text-sm font-medium gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <FileText className="w-4 h-4 text-sky-600" />
            <span>Nội Dung</span>
          </TabsTrigger>
          <TabsTrigger
            value="seo"
            className="text-xs sm:text-sm font-medium gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Search className="w-4 h-4 text-purple-600" />
            <span>Sức Khỏe SEO</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-6">
          <SalesDashboardView data={salesData} />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <ContentDashboardView data={contentData} />
        </TabsContent>

        <TabsContent value="seo" className="mt-6">
          <SeoDashboardView data={seoData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
