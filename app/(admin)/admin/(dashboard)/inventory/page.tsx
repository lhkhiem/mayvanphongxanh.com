"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getInventoryProducts,
  getInventoryStats,
  getInventoryCategories,
  getInventoryLogs,
} from "./actions"
import { StockAdjustModal } from "./stock-adjust-modal"
import { ThresholdModal } from "./threshold-modal"
import { CategoryFilterDropdown } from "@/components/admin/category-filter-dropdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Warehouse,
  PackageCheck,
  AlertTriangle,
  PackageX,
  Boxes,
  Search,
  RefreshCw,
  PlusCircle,
  History,
  SlidersHorizontal,
  ArrowDownRight,
  ArrowUpRight,
  ShoppingCart,
  RotateCcw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<string>("stock")

  // Stats
  const [stats, setStats] = useState({
    totalVariants: 0,
    outOfStock: 0,
    lowStock: 0,
    inStock: 0,
    totalStockUnits: 0,
  })
  const [statsLoading, setStatsLoading] = useState<boolean>(true)

  // Categories
  const [categories, setCategories] = useState<any[]>([])

  // Tab 1: Products Stock State
  const [products, setProducts] = useState<any[]>([])
  const [productsLoading, setProductsLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>("")
  const [categoryId, setCategoryId] = useState<string>("all")
  const [stockStatus, setStockStatus] = useState<string>("all")
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalProducts, setTotalProducts] = useState<number>(0)

  // Tab 2: Logs State
  const [logs, setLogs] = useState<any[]>([])
  const [logsLoading, setLogsLoading] = useState<boolean>(false)
  const [logSearch, setLogSearch] = useState<string>("")
  const [logType, setLogType] = useState<string>("all")
  const [logPage, setLogPage] = useState<number>(1)
  const [logTotalPages, setLogTotalPages] = useState<number>(1)
  const [logTotal, setLogTotal] = useState<number>(0)

  // Modals state
  const [adjustTargetVariant, setAdjustTargetVariant] = useState<any | null>(null)
  const [isAdjustOpen, setIsAdjustOpen] = useState<boolean>(false)

  const [thresholdTargetVariant, setThresholdTargetVariant] = useState<any | null>(null)
  const [isThresholdOpen, setIsThresholdOpen] = useState<boolean>(false)

  // Fetch Stats
  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    const res = await getInventoryStats()
    if (res.data) {
      setStats(res.data)
    }
    setStatsLoading(false)
  }, [])

  // Fetch Categories
  useEffect(() => {
    getInventoryCategories().then((res) => {
      if (res.data) setCategories(res.data)
    })
  }, [])

  // Fetch Products
  const loadProducts = useCallback(async () => {
    setProductsLoading(true)
    const res = await getInventoryProducts({
      search,
      categoryId: categoryId === "all" ? "all" : Number(categoryId),
      stockStatus: stockStatus as any,
      page,
      pageSize: 15,
    })
    if (res.data) {
      setProducts(res.data)
      setTotalPages(res.totalPages || 1)
      setTotalProducts(res.total || 0)
    }
    setProductsLoading(false)
  }, [search, categoryId, stockStatus, page])

  // Fetch Logs
  const loadLogs = useCallback(async () => {
    setLogsLoading(true)
    const res = await getInventoryLogs({
      search: logSearch,
      type: logType as any,
      page: logPage,
      pageSize: 20,
    })
    if (res.data) {
      setLogs(res.data)
      setLogTotalPages(res.totalPages || 1)
      setLogTotal(res.total || 0)
    }
    setLogsLoading(false)
  }, [logSearch, logType, logPage])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    if (activeTab === "stock") {
      loadProducts()
    } else if (activeTab === "logs") {
      loadLogs()
    }
  }, [activeTab, loadProducts, loadLogs])

  const handleRefresh = () => {
    loadStats()
    if (activeTab === "stock") loadProducts()
    if (activeTab === "logs") loadLogs()
  }

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Warehouse className="h-7 w-7 text-blue-600" />
            Quản Lý Kho Hàng & Tồn Kho
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi tồn kho sản phẩm, nhập/xuất kho và tự động trừ hàng khi giao dịch thành công.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng số mặt hàng */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Tổng mặt hàng (SKU)
            </p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : stats.totalVariants}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Tổng lượng tồn: <span className="font-semibold text-gray-700">{stats.totalStockUnits}</span> sản phẩm
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Boxes className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Đủ tồn kho */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Tồn kho an toàn
            </p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : stats.inStock}
            </h3>
            <p className="text-xs text-emerald-600/80 mt-1">Đủ cung ứng bán hàng</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <PackageCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Sắp hết hàng */}
        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm flex items-center justify-between bg-amber-50/30">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Sắp hết hàng
            </p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : stats.lowStock}
            </h3>
            <p className="text-xs text-amber-600 mt-1 font-medium">Cần lên kế hoạch nhập bổ sung</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4: Hết hàng */}
        <div className="bg-white rounded-xl border border-red-200 p-4 shadow-sm flex items-center justify-between bg-red-50/30">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
              Hết hàng (Tồn = 0)
            </p>
            <h3 className="text-2xl font-extrabold text-red-600 mt-1">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-gray-400" /> : stats.outOfStock}
            </h3>
            <p className="text-xs text-red-600 mt-1 font-medium">Cần nhập kho gấp</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <PackageX className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-100 p-1 rounded-lg">
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <Boxes className="h-4 w-4" />
            Tồn Kho Sản Phẩm
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Lịch Sử Nhập / Xuất Kho
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Product Stock */}
        <TabsContent value="stock" className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm theo tên SP, SKU..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-9 h-9"
                />
              </div>

              {/* Category Filter */}
              <CategoryFilterDropdown
                categories={categories}
                value={categoryId === "all" ? undefined : Number(categoryId)}
                onChange={(id) => {
                  setCategoryId(id ? id.toString() : "all")
                  setPage(1)
                }}
              />

              {/* Stock Status Filter */}
              <div className="w-full sm:w-52">
                <select
                  value={stockStatus}
                  onChange={(e) => {
                    setStockStatus(e.target.value)
                    setPage(1)
                  }}
                  className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả trạng thái tồn kho</option>
                  <option value="in_stock">🟢 Tồn kho an toàn</option>
                  <option value="low_stock">🟡 Sắp hết hàng</option>
                  <option value="out_of_stock">🔴 Hết hàng</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-gray-500 whitespace-nowrap self-end sm:self-center">
              Hiển thị <span className="font-semibold text-gray-900">{totalProducts}</span> mặt hàng
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[80px]">Ảnh</TableHead>
                  <TableHead>Mặt hàng & SKU</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead className="text-center">Số lượng tồn kho</TableHead>
                  <TableHead className="text-center">Ngưỡng báo</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span>Đang tải dữ liệu kho hàng...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                      Không tìm thấy sản phẩm phù hợp với bộ lọc.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((item) => {
                    const imgUrl =
                      item.images && Array.isArray(item.images) && item.images.length > 0
                        ? item.images[0]
                        : item.product.images && Array.isArray(item.product.images) && item.product.images.length > 0
                        ? item.product.images[0]
                        : "/images/placeholder.png"

                    const isOutOfStock = item.stockQuantity === 0
                    const isLowStock = !isOutOfStock && item.stockQuantity <= item.lowStockThreshold

                    return (
                      <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell>
                          <div className="relative h-12 w-12 rounded-lg border border-gray-200 overflow-hidden bg-slate-100 shrink-0">
                            <Image
                              src={imgUrl}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              unoptimized={imgUrl.startsWith("http")}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <Link
                              href={`/admin/products/${item.product.id}/edit`}
                              className="font-semibold text-gray-900 hover:text-blue-600 transition-colors flex items-center gap-1.5 group"
                            >
                              <span>{item.product.name}</span>
                              {item.name && <span className="text-xs text-gray-500">({item.name})</span>}
                              <ExternalLink className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                                SKU: {item.sku}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {item.product.category?.name || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          <span
                            className={`text-base ${
                              isOutOfStock
                                ? "text-red-600"
                                : isLowStock
                                ? "text-amber-600"
                                : "text-emerald-700"
                            }`}
                          >
                            {item.stockQuantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-500">
                          {item.lowStockThreshold}
                        </TableCell>
                        <TableCell className="text-center">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                              Hết hàng
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
                              Sắp hết hàng
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              Tồn an toàn
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-slate-300 hover:bg-blue-50 hover:text-blue-600 text-xs gap-1"
                              onClick={() => {
                                setAdjustTargetVariant(item)
                                setIsAdjustOpen(true)
                              }}
                            >
                              <PlusCircle className="h-3.5 w-3.5" />
                              Nhập / Xuất kho
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs text-gray-500 hover:text-gray-900"
                              title="Cấu hình ngưỡng báo sắp hết"
                              onClick={() => {
                                setThresholdTargetVariant(item)
                                setIsThresholdOpen(true)
                              }}
                            >
                              <SlidersHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-slate-50/50">
                <div className="text-xs text-gray-500">
                  Trang {page} / {totalPages}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: Inventory History Logs */}
        <TabsContent value="logs" className="space-y-4">
          {/* Logs Filters */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm nhật ký theo SKU, lý do, mã ĐH..."
                  value={logSearch}
                  onChange={(e) => {
                    setLogSearch(e.target.value)
                    setLogPage(1)
                  }}
                  className="pl-9 h-9"
                />
              </div>

              {/* Log Type Filter */}
              <div className="w-full sm:w-56">
                <select
                  value={logType}
                  onChange={(e) => {
                    setLogType(e.target.value)
                    setLogPage(1)
                  }}
                  className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả loại giao dịch</option>
                  <option value="IMPORT">🟢 Nhập kho thủ công</option>
                  <option value="EXPORT">🟠 Xuất kho thủ công</option>
                  <option value="SALE">🛍️ Bán hàng (Trừ kho tự động)</option>
                  <option value="RETURN">↩️ Trả hàng (Hoàn kho)</option>
                  <option value="ADJUSTMENT">🔵 Điều chỉnh kiểm kê</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-gray-500 whitespace-nowrap self-end sm:self-center">
              Tổng số <span className="font-semibold text-gray-900">{logTotal}</span> bản ghi nhật ký
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Sản phẩm / SKU</TableHead>
                  <TableHead className="text-center">Loại biến động</TableHead>
                  <TableHead className="text-center">Thay đổi</TableHead>
                  <TableHead className="text-center">Tồn kho (Trước → Sau)</TableHead>
                  <TableHead>Lý do / Mã tham chiếu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span>Đang tải nhật ký xuất nhập kho...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                      Chưa có lịch sử biến động kho nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const isPositive = log.quantity > 0
                    const createdDate = new Date(log.createdAt).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })

                    return (
                      <TableRow key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <TableCell className="text-xs text-gray-500 font-mono">
                          {createdDate}
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className="font-semibold text-gray-900 text-sm">
                              {log.variant.product.name}
                            </span>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">
                              SKU: {log.variant.sku}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {log.type === "IMPORT" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
                              <ArrowDownRight className="h-3.5 w-3.5" />
                              Nhập kho
                            </span>
                          ) : log.type === "EXPORT" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full">
                              <ArrowUpRight className="h-3.5 w-3.5" />
                              Xuất kho
                            </span>
                          ) : log.type === "SALE" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full">
                              <ShoppingCart className="h-3.5 w-3.5" />
                              Bán hàng
                            </span>
                          ) : log.type === "RETURN" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                              <RotateCcw className="h-3.5 w-3.5" />
                              Hoàn kho
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                              <RefreshCw className="h-3.5 w-3.5" />
                              Kiểm kê
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          <span className={isPositive ? "text-emerald-600" : "text-amber-600"}>
                            {isPositive ? `+${log.quantity}` : log.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-sm font-mono text-gray-600">
                          {log.previousStock} → <span className="font-bold text-gray-900">{log.newStock}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-700">{log.reason || "—"}</div>
                          {log.referenceId && (
                            <div className="text-xs text-blue-600 font-mono mt-0.5">
                              Ref ID: {log.referenceId}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {logTotalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-slate-50/50">
                <div className="text-xs text-gray-500">
                  Trang {logPage} / {logTotalPages}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={logPage <= 1}
                    onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={logPage >= logTotalPages}
                    onClick={() => setLogPage((p) => Math.min(logTotalPages, p + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <StockAdjustModal
        variant={adjustTargetVariant}
        isOpen={isAdjustOpen}
        onClose={() => {
          setIsAdjustOpen(false)
          setAdjustTargetVariant(null)
        }}
        onSuccess={() => {
          loadStats()
          loadProducts()
          if (activeTab === "logs") loadLogs()
        }}
      />

      <ThresholdModal
        variant={thresholdTargetVariant}
        isOpen={isThresholdOpen}
        onClose={() => {
          setIsThresholdOpen(false)
          setThresholdTargetVariant(null)
        }}
        onSuccess={() => {
          loadStats()
          loadProducts()
        }}
      />
    </div>
  )
}
