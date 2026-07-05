"use client"

import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import type { WarrantyEventType, WarrantyStatus } from "@prisma/client"
import { toast } from "sonner"
import {
  AlertCircle,
  CalendarClock,
  ChevronDown,
  ClipboardList,
  Edit,
  History,
  Plus,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Wrench,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  addWarrantyEvent,
  createWarrantyRecord,
  deleteWarrantyRecord,
  getWarrantyRecords,
  getWarrantyStats,
  updateWarrantyRecord,
  type WarrantyInput,
} from "./actions"

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

const WARRANTY_STATUSES: Array<{ value: WarrantyStatus | "all"; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "ACTIVE", label: "Còn bảo hành" },
  { value: "EXPIRED", label: "Hết hạn" },
  { value: "VOIDED", label: "Đã hủy" },
]

const EVENT_TYPES: Array<{ value: WarrantyEventType; label: string }> = [
  { value: "ACTIVATED", label: "Kích hoạt" },
  { value: "REPAIR_RECEIVED", label: "Nhận máy sửa" },
  { value: "REPAIRING", label: "Đang sửa" },
  { value: "REPAIRED", label: "Đã sửa xong" },
  { value: "RETURNED", label: "Đã trả máy" },
  { value: "NOTE", label: "Ghi chú" },
]

const statusMeta: Record<WarrantyStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Còn bảo hành", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  EXPIRED: { label: "Hết hạn", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  VOIDED: { label: "Đã hủy", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
}

type WarrantyEvent = {
  id: number
  type: WarrantyEventType
  title: string
  note: string | null
  eventDate: Date | string
}

type WarrantyRecord = {
  id: string
  serialNumber: string
  productName: string
  sku: string | null
  customerName: string
  customerPhone: string
  customerEmail: string | null
  orderId: string | null
  orderItemId: number | null
  purchaseDate: Date | string
  warrantyMonths: number
  expiresAt: Date | string
  status: WarrantyStatus
  notes: string | null
  events: WarrantyEvent[]
}

type Stats = {
  total: number
  active: number
  expired: number
  voided: number
  expiringSoon: number
}

const DEFAULT_FORM: WarrantyInput = {
  serialNumber: "",
  productName: "",
  sku: "",
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  orderId: "",
  orderItemId: null,
  purchaseDate: new Date().toISOString().slice(0, 10),
  warrantyMonths: 12,
  status: "ACTIVE",
  notes: "",
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value))
}

function toDateInputValue(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10)
}

function isExpired(record: WarrantyRecord) {
  return record.status === "EXPIRED" || new Date(record.expiresAt).getTime() < Date.now()
}

function WarrantyForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: WarrantyRecord | null
  onSubmit: (data: WarrantyInput) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState<WarrantyInput>(() => initialData ? {
    serialNumber: initialData.serialNumber,
    productName: initialData.productName,
    sku: initialData.sku || "",
    customerName: initialData.customerName,
    customerPhone: initialData.customerPhone,
    customerEmail: initialData.customerEmail || "",
    orderId: initialData.orderId || "",
    orderItemId: initialData.orderItemId,
    purchaseDate: toDateInputValue(initialData.purchaseDate),
    warrantyMonths: initialData.warrantyMonths,
    status: initialData.status,
    notes: initialData.notes || "",
  } : DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    await onSubmit(form)
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-primary/30 bg-white p-5 shadow-sm dark:bg-[#2a303d] space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {initialData ? "Cập nhật phiếu bảo hành" : "Tạo phiếu bảo hành"}
        </h2>
        <button type="button" onClick={onCancel} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Serial/SN *</span>
          <input value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value.toUpperCase() })} required className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:text-gray-100" />
        </label>
        <label className="space-y-1.5 xl:col-span-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tên sản phẩm *</span>
          <input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} required className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:text-gray-100" />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SKU</span>
          <input value={form.sku || ""} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:text-gray-100" />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tên khách *</span>
          <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:text-gray-100" />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">SĐT *</span>
          <input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} required className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:text-gray-100" />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
          <input value={form.customerEmail || ""} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:text-gray-100" />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trạng thái</span>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as WarrantyStatus })} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-[#2a303d] dark:text-gray-100">
            {WARRANTY_STATUSES.filter((item) => item.value !== "all").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ngày mua *</span>
          <input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} required className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:text-gray-100" />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Số tháng BH *</span>
          <input type="number" min={1} max={120} value={form.warrantyMonths} onChange={(e) => setForm({ ...form, warrantyMonths: Number(e.target.value) })} required className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:text-gray-100" />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mã đơn</span>
          <input value={form.orderId || ""} onChange={(e) => setForm({ ...form, orderId: e.target.value })} className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:text-gray-100" />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Order item ID</span>
          <input type="number" value={form.orderItemId || ""} onChange={(e) => setForm({ ...form, orderItemId: e.target.value ? Number(e.target.value) : null })} className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:text-gray-100" />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ghi chú</span>
        <textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:text-gray-100" />
      </label>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">Hủy</button>
        <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50">
          <Save className="h-4 w-4" />
          {submitting ? "Đang lưu..." : "Lưu phiếu"}
        </button>
      </div>
    </form>
  )
}

function EventForm({ warrantyId, onDone }: { warrantyId: string; onDone: () => Promise<void> }) {
  const [type, setType] = useState<WarrantyEventType>("NOTE")
  const [title, setTitle] = useState("")
  const [note, setNote] = useState("")
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10))
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    const res = await addWarrantyEvent({ warrantyId, type, title, note, eventDate })
    if (res.error) toast.error(res.error)
    else {
      toast.success("Đã thêm lịch sử bảo hành.")
      setTitle("")
      setNote("")
      await onDone()
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-[#252b38] md:grid-cols-[160px_1fr_150px_auto]">
      <select value={type} onChange={(e) => setType(e.target.value as WarrantyEventType)} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-[#2a303d] dark:text-gray-100">
        {EVENT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nội dung lịch sử" required className="rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-600 dark:text-gray-100" />
      <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-600 dark:text-gray-100" />
      <button disabled={submitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Thêm</button>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú chi tiết" rows={2} className="md:col-span-4 rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-600 dark:text-gray-100" />
    </form>
  )
}

export default function MaintenancePage() {
  const [records, setRecords] = useState<WarrantyRecord[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, expired: 0, voided: 0, expiringSoon: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<WarrantyStatus | "all">("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<WarrantyRecord | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    const res = await getWarrantyRecords({ search: search || undefined, status, page, pageSize })
    if (res.error) toast.error(res.error)
    else {
      setRecords((res.data || []) as WarrantyRecord[])
      setTotal(res.total || 0)
      setTotalPages(res.totalPages || 1)
    }
    setLoading(false)
  }, [search, status, page, pageSize])

  const fetchStats = useCallback(async () => {
    const res = await getWarrantyStats()
    if (res.error) toast.error(res.error)
    else if (res.data) setStats(res.data)
  }, [])

  const refresh = async () => Promise.all([fetchRecords(), fetchStats()]).then(() => undefined)

  useEffect(() => {
    const timer = setTimeout(fetchRecords, 250)
    return () => clearTimeout(timer)
  }, [fetchRecords])

  useEffect(() => { fetchStats() }, [fetchStats])

  useEffect(() => {
    setPage(1)
    setExpandedId(null)
  }, [search, status, pageSize])

  const handleSubmit = async (data: WarrantyInput) => {
    const res = editing ? await updateWarrantyRecord(editing.id, data) : await createWarrantyRecord(data)
    if (res.error) toast.error(res.error)
    else {
      toast.success(editing ? "Đã cập nhật phiếu bảo hành." : "Đã tạo phiếu bảo hành.")
      setShowForm(false)
      setEditing(null)
      await refresh()
    }
  }

  const handleDelete = async (record: WarrantyRecord) => {
    if (!confirm(`Xóa phiếu bảo hành serial ${record.serialNumber}?`)) return
    const res = await deleteWarrantyRecord(record.id)
    if (res.error) toast.error(res.error)
    else {
      toast.success("Đã xóa phiếu bảo hành.")
      await refresh()
    }
  }

  const statCards = useMemo(() => [
    { label: "Tổng phiếu", value: stats.total, icon: ClipboardList, className: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300" },
    { label: "Còn bảo hành", value: stats.active, icon: ShieldCheck, className: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300" },
    { label: "Sắp hết hạn", value: stats.expiringSoon, icon: CalendarClock, className: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300" },
    { label: "Hết hạn/Hủy", value: stats.expired + stats.voided, icon: ShieldAlert, className: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300" },
  ], [stats])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Sửa chữa & Bảo hành</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{loading ? "Đang tải..." : `${total} phiếu bảo hành • trang ${page}/${totalPages}`}</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Tạo phiếu bảo hành
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, className }) => (
          <div key={label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-[#2a303d]">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-sm text-gray-500 dark:text-gray-400">{label}</p><p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p></div>
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", className)}><Icon className="h-5 w-5" /></div>
            </div>
          </div>
        ))}
      </div>

      {(showForm || editing) && <WarrantyForm initialData={editing} onSubmit={handleSubmit} onCancel={() => { setShowForm(false); setEditing(null) }} />}

      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1 lg:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm serial, sản phẩm, khách, SĐT, email..." className="w-full rounded-md border border-gray-300 bg-transparent py-2 pl-9 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:text-gray-100" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as WarrantyStatus | "all")} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm dark:border-gray-600 dark:bg-[#2a303d] dark:text-gray-100">
          {WARRANTY_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm dark:border-gray-600 dark:bg-[#2a303d] dark:text-gray-100">
          {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size} / trang</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#2a303d]">
        {loading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">{[1, 2, 3, 4].map((item) => <div key={item} className="h-24 animate-pulse bg-gray-100 dark:bg-gray-800/60" />)}</div>
        ) : records.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center"><Wrench className="mb-3 h-10 w-10 text-gray-300" /><h2 className="font-semibold text-gray-900 dark:text-gray-100">Chưa có phiếu bảo hành phù hợp</h2></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-sm">
              <thead><tr className="border-b border-gray-200 bg-gray-50 text-left dark:border-gray-700 dark:bg-gray-800/50"><th className="px-4 py-3 font-semibold">Serial</th><th className="px-4 py-3 font-semibold">Sản phẩm</th><th className="px-4 py-3 font-semibold">Khách hàng</th><th className="px-4 py-3 font-semibold">Thời hạn</th><th className="px-4 py-3 font-semibold">Trạng thái</th><th className="px-4 py-3 text-right font-semibold">Thao tác</th></tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {records.map((record) => {
                  const expanded = expandedId === record.id
                  const effectiveStatus = isExpired(record) && record.status === "ACTIVE" ? "EXPIRED" : record.status
                  return (
                    <Fragment key={record.id}>
                      <tr className="align-top hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-4 py-4 font-mono text-xs font-semibold text-gray-900 dark:text-gray-100">{record.serialNumber}</td>
                        <td className="px-4 py-4"><p className="font-semibold text-gray-900 dark:text-gray-100">{record.productName}</p><p className="mt-1 text-xs text-gray-500">{record.sku || "Chưa có SKU"}</p></td>
                        <td className="px-4 py-4"><p className="font-medium text-gray-900 dark:text-gray-100">{record.customerName}</p><p className="mt-1 text-xs text-gray-500">{record.customerPhone}</p></td>
                        <td className="px-4 py-4"><p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(record.purchaseDate)} - {formatDate(record.expiresAt)}</p><p className="mt-1 text-xs text-gray-500">{record.warrantyMonths} tháng</p></td>
                        <td className="px-4 py-4"><span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", statusMeta[effectiveStatus].className)}>{statusMeta[effectiveStatus].label}</span></td>
                        <td className="px-4 py-4 text-right"><div className="inline-flex gap-1"><button onClick={() => setExpandedId(expanded ? null : record.id)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">{expanded ? "Thu gọn" : "Xem"} <ChevronDown className={cn("inline h-4 w-4", expanded && "rotate-180")} /></button><button onClick={() => { setEditing(record); setShowForm(false) }} className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"><Edit className="h-4 w-4" /></button><button onClick={() => handleDelete(record)} className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"><Trash2 className="h-4 w-4" /></button></div></td>
                      </tr>
                      {expanded && (
                        <tr className="bg-gray-50/80 dark:bg-gray-800/30"><td colSpan={6} className="px-4 py-4"><div className="space-y-4"><EventForm warrantyId={record.id} onDone={refresh} /><div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#252b38]"><div className="border-b border-gray-100 px-4 py-3 font-semibold dark:border-gray-700"><History className="mr-2 inline h-4 w-4 text-primary" />Lịch sử bảo hành/sửa chữa</div><div className="divide-y divide-gray-100 dark:divide-gray-700/60">{record.events.length > 0 ? record.events.map((event) => <div key={event.id} className="grid gap-2 px-4 py-3 md:grid-cols-[120px_1fr]"><p className="text-sm text-gray-500">{formatDate(event.eventDate)}</p><div><p className="font-medium text-gray-900 dark:text-gray-100">{event.title}</p>{event.note && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{event.note}</p>}</div></div>) : <p className="px-4 py-5 text-sm text-gray-500">Chưa có lịch sử.</p>}</div></div>{record.notes && <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600 dark:border-gray-700 dark:bg-[#252b38] dark:text-gray-300">Ghi chú: {record.notes}</div>}</div></td></tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm text-gray-500 dark:border-gray-700"><span>Hiển thị {records.length} / {total} phiếu</span><div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-md border px-3 py-1 disabled:opacity-40">Trước</button><span className="px-2 py-1 font-medium text-gray-800 dark:text-gray-100">{page}/{totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-md border px-3 py-1 disabled:opacity-40">Sau</button></div></div>
          </div>
        )}
      </div>
    </div>
  )
}