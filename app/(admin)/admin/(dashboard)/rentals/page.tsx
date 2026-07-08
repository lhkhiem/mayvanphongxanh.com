"use client"

import { useCallback, useEffect, useState } from "react"
import type { RentalStatus } from "@prisma/client"
import { toast } from "sonner"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Wrench,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react"
import { getRentals } from "./actions"
import { RentalDialog } from "./rental-dialog"

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

const RENTAL_STATUSES: Array<{ value: RentalStatus | "all"; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "ACTIVE", label: "Đang thuê" },
  { value: "RETURNED", label: "Đã trả" },
  { value: "MAINTENANCE", label: "Bảo trì" },
  { value: "OVERDUE", label: "Quá hạn" },
]

const rentalStatusMeta: Record<RentalStatus, { label: string; className: string; icon: React.ReactNode }> = {
  ACTIVE: { label: "Đang thuê", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", icon: <CheckCircle className="w-4 h-4 mr-1 inline" /> },
  RETURNED: { label: "Đã trả", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", icon: <CheckCircle className="w-4 h-4 mr-1 inline" /> },
  MAINTENANCE: { label: "Bảo trì", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", icon: <Wrench className="w-4 h-4 mr-1 inline" /> },
  OVERDUE: { label: "Quá hạn", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300", icon: <AlertTriangle className="w-4 h-4 mr-1 inline" /> },
}

function formatDate(value: Date | string | null) {
  if (!value) return "---"
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value))
}

export type Rental = {
  id: string
  orderId: string | null
  orderItemId: number | null
  productId: number | null
  productName: string
  sku: string | null
  serialNumber: string | null
  customerName: string
  customerPhone: string
  customerEmail: string | null
  customerAddress: string | null
  startDate: Date | string
  endDate: Date | string | null
  status: RentalStatus
  notes: string | null
  createdAt: Date | string
  updatedAt: Date | string
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
          Hiển thị <span className="font-medium text-gray-800 dark:text-gray-100">{from}-{to}</span> / {total} máy thuê
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
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-700"
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
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<RentalStatus | "all">("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null)

  const fetchRentals = useCallback(async () => {
    setLoading(true)
    const res = await getRentals({
      search: search || undefined,
      status,
      page,
      pageSize,
    })

    if (res.error) {
      toast.error(res.error)
    } else {
      setRentals((res.data || []) as Rental[])
      setTotal(res.total || 0)
      setTotalPages(res.totalPages || 1)
    }
    setLoading(false)
  }, [search, status, page, pageSize])

  useEffect(() => {
    fetchRentals()
  }, [fetchRentals])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchRentals()
  }

  const handleUpdated = () => {
    fetchRentals()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Quản lý Máy thuê
        </h1>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#1e232d]">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={handleSearch} className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm khách hàng, số điện thoại, Serial..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-[#2a303d] dark:text-white dark:placeholder-gray-400"
            />
          </form>

          <div className="flex flex-1 items-center gap-3 sm:max-w-xs">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as RentalStatus | "all")
                setPage(1)
              }}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-[#2a303d] dark:text-white"
            >
              {RENTAL_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="border-b border-gray-200 bg-gray-50/50 text-xs font-medium uppercase text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">Khách hàng</th>
                <th className="px-4 py-3 font-medium">Máy thuê</th>
                <th className="px-4 py-3 font-medium">Số Serial</th>
                <th className="px-4 py-3 font-medium">Thời gian</th>
                <th className="px-4 py-3 font-medium text-center">Trạng thái</th>
                <th className="px-4 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : rentals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Không tìm thấy máy thuê nào.
                  </td>
                </tr>
              ) : (
                rentals.map((rental) => {
                  const meta = rentalStatusMeta[rental.status]
                  return (
                    <tr key={rental.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{rental.customerName}</div>
                        <div className="text-xs text-gray-500">{rental.customerPhone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{rental.productName}</div>
                      </td>
                      <td className="px-4 py-3">
                        {rental.serialNumber ? (
                          <span className="font-mono text-xs">{rental.serialNumber}</span>
                        ) : (
                          <span className="text-xs italic text-gray-400">Chưa cập nhật</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div>Bắt đầu: {formatDate(rental.startDate)}</div>
                        <div className={!rental.endDate ? "text-gray-400" : ""}>
                          Kết thúc: {formatDate(rental.endDate)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${meta.className}`}>
                          {meta.icon}
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedRental(rental)}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Cập nhật
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
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
      </div>

      <RentalDialog 
        rental={selectedRental} 
        open={!!selectedRental} 
        onOpenChange={(open) => !open && setSelectedRental(null)} 
        onUpdated={handleUpdated}
      />
    </div>
  )
}
