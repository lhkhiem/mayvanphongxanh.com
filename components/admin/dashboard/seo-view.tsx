"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Globe,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { SeoDashboardData } from "@/app/(admin)/admin/(dashboard)/actions";

export function SeoDashboardView({ data }: { data: SeoDashboardData }) {
  // Score color scheme
  let scoreColor = "text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400";
  let scoreBorder = "border-emerald-500";
  if (data.seoHealthScore < 70) {
    scoreColor = "text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-400";
    scoreBorder = "border-amber-500";
  }
  if (data.seoHealthScore < 50) {
    scoreColor = "text-red-600 bg-red-100 dark:bg-red-950 dark:text-red-400";
    scoreBorder = "border-red-500";
  }

  const getEditLink = (type: string) => {
    switch (type) {
      case "Product":
        return "/admin/products";
      case "Post":
        return "/admin/posts";
      case "Category":
        return "/admin/categories";
      case "Page":
        return "/admin/pages";
      case "Service":
        return "/admin/services";
      default:
        return "/admin";
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Overview & Health Score */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main SEO Score Card */}
        <Card className={`shadow-sm border-l-4 ${scoreBorder}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Điểm Sức Khỏe SEO
                </p>
                <h2 className="text-4xl font-extrabold mt-2 text-foreground">
                  {data.seoHealthScore}<span className="text-xl font-bold">%</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-2">
                  Đã tối ưu <span className="font-semibold text-emerald-600">{data.optimizedItems}</span> / {data.totalTrackedItems} thực thể
                </p>
              </div>
              <div className={`p-4 rounded-full ${scoreColor} shadow-inner`}>
                <Sparkles className="w-8 h-8" />
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 mt-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  data.seoHealthScore >= 70 ? "bg-emerald-500" : data.seoHealthScore >= 50 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${data.seoHealthScore}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Breakdown by Type (2 columns) */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Tỷ Lệ Tối Ưu SEO Theo Phân Loại</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
              {/* Products */}
              <div className="p-3 bg-muted/40 rounded-lg border">
                <p className="text-[11px] text-muted-foreground font-medium">Sản Phẩm</p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {data.breakdown.products.optimized}/{data.breakdown.products.total}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  {data.breakdown.products.total > 0
                    ? Math.round((data.breakdown.products.optimized / data.breakdown.products.total) * 100)
                    : 100}%
                </p>
              </div>

              {/* Posts */}
              <div className="p-3 bg-muted/40 rounded-lg border">
                <p className="text-[11px] text-muted-foreground font-medium">Bài Viết</p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {data.breakdown.posts.optimized}/{data.breakdown.posts.total}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  {data.breakdown.posts.total > 0
                    ? Math.round((data.breakdown.posts.optimized / data.breakdown.posts.total) * 100)
                    : 100}%
                </p>
              </div>

              {/* Categories */}
              <div className="p-3 bg-muted/40 rounded-lg border">
                <p className="text-[11px] text-muted-foreground font-medium">Danh Mục</p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {data.breakdown.categories.optimized}/{data.breakdown.categories.total}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  {data.breakdown.categories.total > 0
                    ? Math.round((data.breakdown.categories.optimized / data.breakdown.categories.total) * 100)
                    : 100}%
                </p>
              </div>

              {/* Pages */}
              <div className="p-3 bg-muted/40 rounded-lg border">
                <p className="text-[11px] text-muted-foreground font-medium">Trang Tĩnh</p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {data.breakdown.pages.optimized}/{data.breakdown.pages.total}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  {data.breakdown.pages.total > 0
                    ? Math.round((data.breakdown.pages.optimized / data.breakdown.pages.total) * 100)
                    : 100}%
                </p>
              </div>

              {/* Services */}
              <div className="p-3 bg-muted/40 rounded-lg border col-span-2 md:col-span-1">
                <p className="text-[11px] text-muted-foreground font-medium">Dịch Vụ</p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {data.breakdown.services.optimized}/{data.breakdown.services.total}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                  {data.breakdown.services.total > 0
                    ? Math.round((data.breakdown.services.optimized / data.breakdown.services.total) * 100)
                    : 100}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Action Items & Technical SEO */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* SEO Issues / Need Optimization List (2 columns) */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <CardTitle className="text-base font-semibold">Danh Sách Cần Tối Ưu SEO Gấp</CardTitle>
                <p className="text-xs text-muted-foreground">Các trang thiếu thẻ Meta Title hoặc Description</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {data.missingSeoCount} mục cần bổ sung
            </span>
          </CardHeader>
          <CardContent className="pt-2">
            {data.issuesList.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm flex flex-col items-center gap-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <p className="font-semibold text-foreground">Tuyệt vời! Tất cả thực thể đã được chuẩn hóa SEO.</p>
                <p className="text-xs">Không có trang nào thiếu Meta Title hay Meta Description.</p>
              </div>
            ) : (
              <div className="divide-y divide-border text-xs">
                {data.issuesList.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground line-clamp-1">{item.title}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-muted font-medium uppercase text-muted-foreground">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px] font-mono mt-0.5 line-clamp-1">{item.url}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.missingTitle && (
                          <span className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                            • Thiếu Meta Title
                          </span>
                        )}
                        {item.missingDescription && (
                          <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                            • Thiếu Meta Description
                          </span>
                        )}
                      </div>
                    </div>

                    <Link href={getEditLink(item.type)}>
                      <Button variant="outline" size="sm" className="text-xs h-8 gap-1">
                        <Edit className="w-3.5 h-3.5" /> Chỉnh sửa
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Technical SEO Checklist (1 column) */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <div>
                <CardTitle className="text-base font-semibold">Checklist Kỹ Thuật SEO</CardTitle>
                <p className="text-xs text-muted-foreground">Cấu hình tiêu chuẩn tìm kiếm</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-3 text-xs">
            <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="font-semibold text-foreground">Sitemap.xml</p>
                  <p className="text-[10px] text-muted-foreground">Tự động cập nhật URL</p>
                </div>
              </div>
              <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-0.5 text-[11px]">
                Mở <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="font-semibold text-foreground">Robots.txt</p>
                  <p className="text-[10px] text-muted-foreground">Điều hướng Googlebot</p>
                </div>
              </div>
              <a href="/robots.txt" target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-0.5 text-[11px]">
                Mở <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="font-semibold text-foreground">Structured Data (JSON-LD)</p>
                  <p className="text-[10px] text-muted-foreground">Schema Product & Article</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Đã tích hợp
              </span>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="font-semibold text-foreground">Open Graph & Social</p>
                  <p className="text-[10px] text-muted-foreground">Xem trước Zalo / Facebook</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Sẵn sàng
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
