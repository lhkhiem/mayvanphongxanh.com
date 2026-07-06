"use client"

import { Fragment, useCallback, useEffect, useState } from "react"
import type { OrderStatus, PaymentStatus } from "@prisma/client"
import { toast } from "sonner"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  Copy,
  CreditCard,
  MapPin,
  PackageCheck,
  Phone,
  ReceiptText,
  Search,
  ShoppingCart,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getOrders,
  getOrderStats,
  updateOrderPaymentStatus,
  updateOrderStatus,
} from "./actions"

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

const ORDER_STATUSES: Array<{ value: OrderStatus | "all"; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "SHIPPED", label: "Đang giao" },
  { value: "DELIVERED", label: "Hoàn tất" },
  { value: "CANCELLED", label: "Đã hủy" },
]

const PAYMENT_STATUSES: Array<{ value: PaymentStatus | "all"; label: string }> = [
  { value: "all", label: "Tất cả thanh toán" },
  { value: "UNPAID", label: "Chưa thanh toán" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
]

const orderStatusMeta: Record<OrderStatus, { label: string; className: string; selectClassName: string }> = {
  PENDING: { label: "Chờ xử lý", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", selectClassName: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-900/20 dark:text-amber-200" },
  PROCESSING: { label: "Đang xử lý", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", selectClassName: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-200" },
  SHIPPED: { label: "Đang giao", className: "border-cyan-200 bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300", selectClassName: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900/60 dark:bg-cyan-900/20 dark:text-cyan-200" },
  DELIVERED: { label: "Hoàn tất", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", selectClassName: "border-green-200 bg-green-50 text-green-700 dark:border-green-900/60 dark:bg-green-900/20 dark:text-green-200" },
  CANCELLED: { label: "Đã hủy", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", selectClassName: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-200" },
}

const paymentStatusMeta: Record<PaymentStatus, { label: string; className: string; selectClassName: string }> = {
  UNPAID: { label: "Chưa thanh toán", className: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200", selectClassName: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" },
  PAID: { label: "Đã thanh toán", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", selectClassName: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-200" },
  REFUNDED: { label: "Đã hoàn tiền", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", selectClassName: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/60 dark:bg-purple-900/20 dark:text-purple-200" },
}

type OrderItem = {
  id: number
  productName: string
  variantName: string | null
  sku: string
  price: number
  quantity: number
  customOptions: unknown
  variant?: { product: { productType: string } } | null
}

type Order = {
  id: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  shippingAddress: string
  subTotal: number
  shippingFee: number
  discount: number
  totalAmount: number
  status: OrderStatus
  paymentMethod: string
  paymentStatus: PaymentStatus
  notes: string | null
  createdAt: Date | string
  updatedAt: Date | string
  items: OrderItem[]
}

type Stats = {
  total: number
  pending: number
  processing: number
  unpaid: number
  paidRevenue: number
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value))
}


function getCustomOptionLines(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return ""
      const data = item as Record<string, unknown>
      const group = typeof data.group === "string" ? data.group : "Tùy chọn"
      const choiceName = typeof data.choiceName === "string" ? data.choiceName : ""
      const priceModifier = typeof data.priceModifier === "number" ? data.priceModifier : 0
      return `${group}: ${choiceName}${priceModifier > 0 ? ` (+${formatCurrency(priceModifier)})` : ""}`
    })
    .filter(Boolean)
}

function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <span>
          Hiển thị <span className="font-medium text-gray-800 dark:text-gray-100">{from}-{to}</span> / {total} đơn hàng
        </span>
        <select
          value={pageSize}
          onChange={(event) => {
            onPageSizeChange(Number(event.target.value))
            onPageChange(1)
          }}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-[#2a303d] dark:text-gray-100"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>{size} / trang</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-700"
          title="Trang đầu"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-700"
          title="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-20 px-2 text-center text-sm font-medium text-gray-700 dark:text-gray-200">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-700"
          title="Trang sau"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-700"
          title="Trang cuối"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, processing: 0, unpaid: 0, paidRevenue: 0 })
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<OrderStatus | "all">("all")
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "all">("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const res = await getOrders({
      search: search || undefined,
      status,
      paymentStatus,
      page,
      pageSize,
    })

    if (res.error) {
      toast.error(res.error)
    } else {
      setOrders((res.data || []) as Order[])
      setTotal(res.total || 0)
      setTotalPages(res.totalPages || 1)
    }
    setLoading(false)
  }, [search, status, paymentStatus, page, pageSize])

  const fetchStats = useCallback(async () => {
    const res = await getOrderStats()
    if (res.error) toast.error(res.error)
    else if (res.data) setStats(res.data)
  }, [])

  useEffect(() => {
    const timer = setTimeout(fetchOrders, 250)
    return () => clearTimeout(timer)
  }, [fetchOrders])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    setPage(1)
    setExpandedId(null)
  }, [search, status, paymentStatus, pageSize])

  const refresh = async () => {
    await Promise.all([fetchOrders(), fetchStats()])
  }

  const handleStatusChange = async (order: Order, nextStatus: OrderStatus) => {
    if (order.status === nextStatus) return
    setUpdatingId(order.id)
    const res = await updateOrderStatus(order.id, nextStatus)
    if (res.error) toast.error(res.error)
    else {
      toast.success("Đã cập nhật trạng thái đơn hàng.")
      await refresh()
    }
    setUpdatingId(null)
  }

  const handlePaymentStatusChange = async (order: Order, nextStatus: PaymentStatus) => {
    if (order.paymentStatus === nextStatus) return
    setUpdatingId(order.id)
    const res = await updateOrderPaymentStatus(order.id, nextStatus)
    if (res.error) toast.error(res.error)
    else {
      toast.success("Đã cập nhật trạng thái thanh toán.")
      await refresh()
    }
    setUpdatingId(null)
  }

  const copyOrderId = async (id: string) => {
    await navigator.clipboard.writeText(id)
    toast.success("Đã sao chép mã đơn hàng.")
  }

  const statCards = [
    { label: "Tổng đơn", value: stats.total, icon: ReceiptText, className: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300" },
    { label: "Chờ xử lý", value: stats.pending, icon: Clock3, className: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300" },
    { label: "Đang xử lý", value: stats.processing, icon: PackageCheck, className: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-300" },
    { label: "Chưa thanh toán", value: stats.unpaid, icon: CreditCard, className: "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200" },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Quản lý Đơn hàng</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {loading ? "Đang tải..." : `${total} đơn hàng • trang ${page}/${totalPages}`}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300">
          Doanh thu đã thanh toán: <span className="font-bold">{formatCurrency(stats.paidRevenue)}</span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, className }) => (
          <div key={label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-[#2a303d]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
              </div>
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", className)}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1 lg:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm mã đơn, tên, SĐT, email..."
            className="w-full rounded-md border border-gray-300 bg-transparent py-2 pl-9 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:text-gray-100"
          />
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderStatus | "all")}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-[#2a303d] dark:text-gray-100"
        >
          {ORDER_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>

        <select
          value={paymentStatus}
          onChange={(event) => setPaymentStatus(event.target.value as PaymentStatus | "all")}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-[#2a303d] dark:text-gray-100"
        >
          {PAYMENT_STATUSES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#2a303d]">
        {loading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-24 animate-pulse bg-gray-100 dark:bg-gray-800/60" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
            <ShoppingCart className="mb-3 h-10 w-10 text-gray-300" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Không tìm thấy đơn hàng</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Thử thay đổi từ khóa hoặc bộ lọc trạng thái.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left dark:border-gray-700 dark:bg-gray-800/50">
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Đơn hàng</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Khách hàng</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Sản phẩm</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Tổng tiền</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Trạng thái</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Thanh toán</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                  {orders.map((order) => {
                    const isExpanded = expandedId === order.id
                    const hasRental = order.items.some(item => item.variant?.product?.productType === 'rental')
                    const hasSale = order.items.some(item => item.variant?.product?.productType !== 'rental')
                    return (
                      <Fragment key={order.id}>
                        <tr className="align-top transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30">
                          <td className="px-4 py-4">
                            <div className="flex items-start gap-2">
                              <ReceiptText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <div>
                                <button
                                  type="button"
                                  onClick={() => copyOrderId(order.id)}
                                  className="inline-flex max-w-[260px] items-center gap-1 font-mono text-xs font-semibold text-gray-900 hover:text-primary dark:text-gray-100"
                                  title="Sao chép mã đơn đầy đủ"
                                >
                                  <span className="truncate">{order.id}</span>
                                  <Copy className="h-3 w-3" />
                                </button>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</p>
                                {hasRental && hasSale ? (
                                  <span className="mt-1.5 inline-block rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                    MUA & THUÊ
                                  </span>
                                ) : hasRental ? (
                                  <span className="mt-1.5 inline-block rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    ĐƠN THUÊ MÁY
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <p className="flex items-center gap-1 font-medium text-gray-900 dark:text-gray-100">
                                <User className="h-3.5 w-3.5 text-gray-400" />
                                {order.customerName}
                              </p>
                              <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Phone className="h-3.5 w-3.5" />
                                {order.customerPhone}
                              </p>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{order.items.length} dòng hàng</p>
                            <p className="mt-1 max-w-56 truncate text-xs text-gray-500 dark:text-gray-400">
                              {order.items.map((item) => item.productName).join(", ")}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(order.totalAmount)}</p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{order.paymentMethod}</p>
                          </td>

                          <td className="px-4 py-4">
                            <select
                              aria-label="Cập nhật trạng thái đơn hàng"
                              value={order.status}
                              disabled={updatingId === order.id}
                              onChange={(event) => handleStatusChange(order, event.target.value as OrderStatus)}
                              className={cn(
                                "h-9 w-40 rounded-full border px-3 text-xs font-semibold shadow-sm outline-none transition-colors focus:ring-2 focus:ring-primary disabled:cursor-wait disabled:opacity-60",
                                orderStatusMeta[order.status].selectClassName
                              )}
                            >
                              {ORDER_STATUSES.filter((item) => item.value !== "all").map((item) => (
                                <option key={item.value} value={item.value}>{item.label}</option>
                              ))}
                            </select>
                          </td>

                          <td className="px-4 py-4">
                            <select
                              aria-label="Cập nhật trạng thái thanh toán"
                              value={order.paymentStatus}
                              disabled={updatingId === order.id}
                              onChange={(event) => handlePaymentStatusChange(order, event.target.value as PaymentStatus)}
                              className={cn(
                                "h-9 w-40 rounded-full border px-3 text-xs font-semibold shadow-sm outline-none transition-colors focus:ring-2 focus:ring-primary disabled:cursor-wait disabled:opacity-60",
                                paymentStatusMeta[order.paymentStatus].selectClassName
                              )}
                            >
                              {PAYMENT_STATUSES.filter((item) => item.value !== "all").map((item) => (
                                <option key={item.value} value={item.value}>{item.label}</option>
                              ))}
                            </select>
                          </td>

                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setExpandedId(isExpanded ? null : order.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                            >
                              {isExpanded ? "Thu gọn" : "Xem"}
                              <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr key={`${order.id}-detail`} className="bg-gray-50/80 dark:bg-gray-800/30">
                            <td colSpan={7} className="px-4 py-4">
                              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                                <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#252b38]">
                                  <div className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                                    Sản phẩm trong đơn
                                  </div>
                                  <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                    {order.items.map((item) => {
                                      const optionLines = getCustomOptionLines(item.customOptions)
                                      return (
                                        <div key={item.id} className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto]">
                                          <div>
                                            <div className="flex items-center gap-2">
                                              <p className="font-medium text-gray-900 dark:text-gray-100">{item.productName}</p>
                                              {item.variant?.product?.productType === 'rental' && (
                                                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                                                  Thuê
                                                </span>
                                              )}
                                            </div>
                                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                              SKU: {item.sku} • {item.variantName || "Mặc định"}
                                            </p>
                                            {optionLines.length > 0 && (
                                              <div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                                                {optionLines.map((line) => <p key={line}>{line}</p>)}
                                              </div>
                                            )}
                                          </div>
                                          <div className="text-left sm:text-right">
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(item.price)}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">x {item.quantity}</p>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-[#252b38]">
                                    <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Giao hàng</h3>
                                    <p className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                                      {order.shippingAddress}
                                    </p>
                                    {order.customerEmail && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Email: {order.customerEmail}</p>}
                                    {order.notes && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Ghi chú: {order.notes}</p>}
                                  </div>

                                  <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-[#252b38]">
                                    <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Thanh toán</h3>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Tạm tính</span><span>{formatCurrency(order.subTotal)}</span></div>
                                      <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Phí giao hàng</span><span>{formatCurrency(order.shippingFee)}</span></div>
                                      <div className="flex justify-between text-gray-500 dark:text-gray-400"><span>Giảm giá</span><span>{formatCurrency(order.discount)}</span></div>
                                      <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-gray-900 dark:border-gray-700 dark:text-gray-100">
                                        <span>Tổng cộng</span><span>{formatCurrency(order.totalAmount)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </div>
    </div>
  )
}