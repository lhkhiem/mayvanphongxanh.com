"use client"

import { useEffect, useState } from "react"
import type { RentalStatus } from "@prisma/client"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateRentalInfo } from "./actions"
import type { Rental } from "./page"

const RENTAL_STATUSES: Array<{ value: RentalStatus; label: string }> = [
  { value: "ACTIVE", label: "Đang thuê" },
  { value: "RETURNED", label: "Đã trả" },
  { value: "MAINTENANCE", label: "Bảo trì" },
  { value: "OVERDUE", label: "Quá hạn" },
]

export function RentalDialog({
  rental,
  open,
  onOpenChange,
  onUpdated,
}: {
  rental: Rental | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [serialNumber, setSerialNumber] = useState("")
  const [endDate, setEndDate] = useState("")
  const [status, setStatus] = useState<RentalStatus>("ACTIVE")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (rental) {
      setSerialNumber(rental.serialNumber || "")
      setEndDate(
        rental.endDate
          ? new Date(rental.endDate).toISOString().split("T")[0]
          : ""
      )
      setStatus(rental.status)
      setNotes(rental.notes || "")
    }
  }, [rental])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rental) return

    setLoading(true)
    const data = {
      serialNumber: serialNumber || undefined,
      endDate: endDate ? new Date(endDate) : null,
      status,
      notes: notes || undefined,
    }

    const res = await updateRentalInfo(rental.id, data)
    
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Cập nhật thông tin máy thuê thành công")
      onUpdated()
      onOpenChange(false)
    }
    setLoading(false)
  }

  if (!rental) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Cập nhật máy thuê</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tên khách hàng</Label>
              <Input value={rental.customerName} disabled className="bg-gray-50" />
            </div>
            
            <div className="grid gap-2">
              <Label>Sản phẩm thuê</Label>
              <Input value={rental.productName} disabled className="bg-gray-50" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="serialNumber">Số Serial</Label>
              <Input
                id="serialNumber"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Nhập số Serial của máy..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as RentalStatus)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-[#2a303d] dark:text-white"
              >
                {RENTAL_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endDate">Ngày kết thúc (Dự kiến / Thực tế)</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Thêm ghi chú bảo trì, vấn đề..."
                className="min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-[#2a303d] dark:text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
