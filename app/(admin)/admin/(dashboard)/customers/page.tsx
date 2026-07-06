"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react"
import { getCustomers } from "./actions"

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

type Customer = {
  id: string
  name: string
  phone: string
  email: string | null
  address: string | null
  createdAt: Date
  _count: {
    orders: number
    warranties: number
  }
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value))
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    const res = await getCustomers({
      search: search || undefined,
      page,
      pageSize,
    })

    if (res.error) {
      toast.error(res.error)
    } else {
      setCustomers((res.data || []) as Customer[])
      setTotal(res.total || 0)
      setTotalPages(res.totalPages || 1)
    }
    setLoading(false)
  }, [search, page, pageSize])

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, 300)
    return () => clearTimeout(timer)
  }, [fetchCustomers])

  useEffect(() => {
    setPage(1)
  }, [search, pageSize])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Danh sách Khách hàng</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {loading ? "Đang tải..." : `Tổng cộng ${total} khách hàng • trang ${page}/${totalPages}`}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1 lg:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên, SĐT, email..."
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-[#2a303d] dark:text-gray-100"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#2a303d]">
        {loading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-16 animate-pulse bg-gray-100 dark:bg-gray-800/60" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
            <Users className="mb-3 h-10 w-10 text-gray-300" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Không tìm thấy khách hàng</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Chưa có khách hàng nào trong hệ thống hoặc không khớp với tìm kiếm.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left dark:border-gray-700 dark:bg-gray-800/50">
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Khách hàng</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Thông tin liên hệ</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Hoạt động</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 text-right">Ngày tham gia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="align-top transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{customer.name}</p>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              ID: {customer.id.slice(-6)}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            {customer.phone}
                          </p>
                          {customer.email && (
                            <p className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                              <Mail className="h-3.5 w-3.5 text-gray-400" />
                              {customer.email}
                            </p>
                          )}
                          {customer.address && (
                            <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs truncate" title={customer.address}>
                              <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                              <span className="truncate">{customer.address}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {customer._count.orders} đơn hàng
                          </p>
                          {customer._count.warranties > 0 && (
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              {customer._count.warranties} bảo hành
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-end gap-1.5">
                          {formatDate(customer.createdAt)}
                          <Calendar className="h-4 w-4" />
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-3 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value))
                    setPage(1)
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
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage(page - 1)}
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
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
