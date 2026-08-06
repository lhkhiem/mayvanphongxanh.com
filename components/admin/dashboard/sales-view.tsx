"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import Link from "next/link";
import { SalesDashboardData } from "@/app/(admin)/admin/(dashboard)/actions";

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export function SalesDashboardView({ data }: { data: SalesDashboardData }) {
  return (
    <div className="space-y-6">
      {/* 1. Summary KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue Card */}
        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Tổng Doanh Thu
                </p>
                <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                  {formatVND(data.totalRevenue)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Đơn đã giao thành công
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders Card */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Tổng Đơn Hàng
                </p>
                <h3 className="text-2xl font-bold mt-1 text-foreground">
                  {data.totalOrders} <span className="text-sm font-normal text-muted-foreground">đơn</span>
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="text-amber-600 font-medium">{data.pendingOrders} chờ duyệt</span>
                  <span>•</span>
                  <span className="text-blue-600 font-medium">{data.processingOrders} xử lý</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Order Value (AOV) */}
        <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Giá Trị Đơn Trung Bình (AOV)
                </p>
                <h3 className="text-2xl font-bold mt-1 text-indigo-600">
                  {formatVND(data.averageOrderValue)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Tính trên đơn giao thành công</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rental Machines Active */}
        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Máy Cho Thuê Đang Chạy
                </p>
                <h3 className="text-2xl font-bold mt-1 text-purple-600">
                  {data.rentalSummary.totalActive}{" "}
                  <span className="text-sm font-normal text-muted-foreground">máy</span>
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  {data.rentalSummary.totalOverdue > 0 ? (
                    <span className="text-red-500 font-semibold">
                      {data.rentalSummary.totalOverdue} quá hạn
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-medium">Không có nợ quá hạn</span>
                  )}
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <Printer className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Charts & Action Grids */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Revenue Chart (2 Columns) */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Doanh Thu & Số Lượng Đơn Hàng</CardTitle>
              <p className="text-xs text-muted-foreground">Biến động doanh thu theo tháng</p>
            </div>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                Xem tất cả đơn <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.revenueChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: any, name: any) =>
                      name === "Doanh thu" ? [formatVND(value), name] : [value, name]
                    }
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" name="Doanh thu" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="orders" name="Đơn hàng" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Breakdown & Rental Machine Quick Widget (1 Column) */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Tình Trạng Đơn Hàng & Thuê Máy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="flex items-center gap-1 text-amber-600">
                  <Clock className="w-3.5 h-3.5" /> Chờ xử lý
                </span>
                <span>{data.pendingOrders} đơn</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{
                    width: `${data.totalOrders > 0 ? (data.pendingOrders / data.totalOrders) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="flex items-center gap-1 text-blue-600">
                  <Package className="w-3.5 h-3.5" /> Đang xử lý / giao hàng
                </span>
                <span>{data.processingOrders} đơn</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{
                    width: `${data.totalOrders > 0 ? (data.processingOrders / data.totalOrders) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Giao thành công
                </span>
                <span>{data.deliveredOrders} đơn</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{
                    width: `${data.totalOrders > 0 ? (data.deliveredOrders / data.totalOrders) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="flex items-center gap-1 text-red-600">
                  <XCircle className="w-3.5 h-3.5" /> Đã hủy
                </span>
                <span>{data.cancelledOrders} đơn</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-red-500 h-full rounded-full"
                  style={{
                    width: `${data.totalOrders > 0 ? (data.cancelledOrders / data.totalOrders) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <hr className="my-3 border-border" />

            <div className="bg-muted/50 p-3 rounded-lg space-y-2">
              <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Trạng thái dịch vụ thuê máy</span>
                <Link href="/admin/rentals" className="text-primary hover:underline text-[11px]">
                  Quản lý
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-background p-2 rounded border">
                  <p className="text-muted-foreground text-[10px]">Đang thuê</p>
                  <p className="font-bold text-purple-600">{data.rentalSummary.totalActive} máy</p>
                </div>
                <div className="bg-background p-2 rounded border">
                  <p className="text-muted-foreground text-[10px]">Bảo trì</p>
                  <p className="font-bold text-amber-600">{data.rentalSummary.totalMaintenance} máy</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Bottom Row: Low Stock Alert & Top Selling Products */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Low Stock Alert */}
        <Card className="shadow-sm border-amber-200 dark:border-amber-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 text-amber-700 rounded dark:bg-amber-950 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Cảnh Báo Tồn Kho Thấp</CardTitle>
                <p className="text-xs text-muted-foreground">Sản phẩm sắp hết hàng cần nhập bổ sung</p>
              </div>
            </div>
            <Link href="/admin/inventory">
              <Button variant="outline" size="sm" className="text-xs">
                Quản lý kho
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            {data.lowStockVariants.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <p>Kho hàng đang ở trạng thái an toàn, không có mặt hàng nào thiếu hụt.</p>
              </div>
            ) : (
              <div className="divide-y divide-border text-xs">
                {data.lowStockVariants.slice(0, 5).map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{item.productName}</p>
                      <p className="text-muted-foreground text-[11px]">
                        SKU: <span className="font-mono">{item.sku}</span> | Biến thể: {item.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                        Còn {item.stock} cái
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Ngưỡng: {item.threshold}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Top Sản Phẩm Bán Chạy</CardTitle>
              <p className="text-xs text-muted-foreground">Sản phẩm có số lượng bán nhiều nhất</p>
            </div>
            <Link href="/admin/products">
              <Button variant="outline" size="sm" className="text-xs">
                Xem sản phẩm
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            {data.topProducts.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Chưa có dữ liệu bán hàng ghi nhận.
              </div>
            ) : (
              <div className="divide-y divide-border text-xs">
                {data.topProducts.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 flex items-center justify-center font-bold rounded-full bg-muted text-foreground text-xs">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-muted-foreground text-[11px]">SKU: {item.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{item.quantity} đã bán</p>
                      <p className="text-emerald-600 font-medium text-[11px]">
                        {formatVND(item.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
