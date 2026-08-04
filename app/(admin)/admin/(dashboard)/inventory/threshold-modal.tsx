"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateVariantThreshold } from "./actions"
import { toast } from "sonner"
import { AlertTriangle, Loader2 } from "lucide-react"

type VariantItem = {
  id: string
  sku: string
  name: string | null
  lowStockThreshold: number
  product: {
    name: string
  }
}

interface ThresholdModalProps {
  variant: VariantItem | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ThresholdModal({
  variant,
  isOpen,
  onClose,
  onSuccess,
}: ThresholdModalProps) {
  const [thresholdInput, setThresholdInput] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  if (!variant) return null

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
      setThresholdInput("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const val = parseInt(thresholdInput, 10)
      if (isNaN(val) || val < 0) {
        toast.error("Vui lòng nhập số ngưỡng hợp lệ (>= 0).")
        setLoading(false)
        return
      }

      const res = await updateVariantThreshold(variant.id, val)

      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Đã cập nhật ngưỡng cảnh báo hết hàng thành ${val}.`)
        onSuccess()
        handleOpenChange(false)
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi cập nhật ngưỡng cảnh báo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Cấu hình Cảnh báo Hết hàng</span>
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Đặt mức tồn kho tối thiểu để hệ thống đưa mặt hàng <span className="font-semibold text-gray-900">{variant.product.name}</span> ({variant.sku}) vào danh sách cảnh báo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="threshold">Ngưỡng báo sắp hết (Số lượng)</Label>
            <Input
              id="threshold"
              type="number"
              min="0"
              defaultValue={variant.lowStockThreshold}
              onChange={(e) => setThresholdInput(e.target.value)}
              placeholder="Nhập số lượng ngưỡng..."
              required
            />
            <p className="text-xs text-gray-500">
              Khi tồn kho rơi xuống mức bằng hoặc nhỏ hơn số này, hệ thống sẽ gắn nhãn "Sắp hết hàng".
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu cài đặt"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
