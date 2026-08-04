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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { adjustStock } from "./actions"
import { toast } from "sonner"
import { ArrowDownRight, ArrowUpRight, RefreshCw, Loader2 } from "lucide-react"

type VariantItem = {
  id: string
  sku: string
  name: string | null
  stockQuantity: number
  product: {
    name: string
  }
}

interface StockAdjustModalProps {
  variant: VariantItem | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function StockAdjustModal({
  variant,
  isOpen,
  onClose,
  onSuccess,
}: StockAdjustModalProps) {
  const [type, setType] = useState<"IMPORT" | "EXPORT" | "ADJUSTMENT">("IMPORT")
  const [quantityInput, setQuantityInput] = useState<string>("1")
  const [targetStockInput, setTargetStockInput] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  if (!variant) return null

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
      // reset form
      setType("IMPORT")
      setQuantityInput("1")
      setTargetStockInput("")
      setReason("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let changeQuantity = 0

      if (type === "IMPORT") {
        const qty = parseInt(quantityInput, 10)
        if (isNaN(qty) || qty <= 0) {
          toast.error("Vui lòng nhập số lượng nhập hợp lệ (lớn hơn 0).")
          setLoading(false)
          return
        }
        changeQuantity = qty
      } else if (type === "EXPORT") {
        const qty = parseInt(quantityInput, 10)
        if (isNaN(qty) || qty <= 0) {
          toast.error("Vui lòng nhập số lượng xuất hợp lệ (lớn hơn 0).")
          setLoading(false)
          return
        }
        if (qty > variant.stockQuantity) {
          toast.error(`Số lượng xuất (${qty}) lớn hơn tồn kho hiện tại (${variant.stockQuantity}).`)
          setLoading(false)
          return
        }
        changeQuantity = -qty
      } else if (type === "ADJUSTMENT") {
        const target = parseInt(targetStockInput, 10)
        if (isNaN(target) || target < 0) {
          toast.error("Vui lòng nhập số lượng tồn kho kiểm kê thực tế hợp lệ (>= 0).")
          setLoading(false)
          return
        }
        changeQuantity = target - variant.stockQuantity
        if (changeQuantity === 0) {
          toast.info("Số lượng kiểm kê thực tế không thay đổi so với tồn kho hiện tại.")
          setLoading(false)
          return
        }
      }

      const res = await adjustStock({
        variantId: variant.id,
        type,
        changeQuantity,
        reason: reason.trim() || undefined,
      })

      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(
          type === "IMPORT"
            ? `Đã nhập thêm ${changeQuantity} sản phẩm vào kho.`
            : type === "EXPORT"
            ? `Đã xuất ${Math.abs(changeQuantity)} sản phẩm khỏi kho.`
            : `Đã cập nhật tồn kho mới thành ${variant.stockQuantity + changeQuantity}.`
        )
        onSuccess()
        handleOpenChange(false)
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi thực hiện cập nhật kho.")
    } finally {
      setLoading(false)
    }
  }

  const currentStock = variant.stockQuantity
  let projectedStock = currentStock

  if (type === "IMPORT") {
    const qty = parseInt(quantityInput, 10) || 0
    projectedStock = currentStock + Math.max(0, qty)
  } else if (type === "EXPORT") {
    const qty = parseInt(quantityInput, 10) || 0
    projectedStock = Math.max(0, currentStock - Math.max(0, qty))
  } else if (type === "ADJUSTMENT") {
    const target = parseInt(targetStockInput, 10)
    projectedStock = isNaN(target) ? currentStock : Math.max(0, target)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            {type === "IMPORT" && <ArrowDownRight className="h-6 w-6 text-emerald-600" />}
            {type === "EXPORT" && <ArrowUpRight className="h-6 w-6 text-amber-600" />}
            {type === "ADJUSTMENT" && <RefreshCw className="h-5 w-5 text-blue-600" />}
            <span>
              {type === "IMPORT"
                ? "Nhập hàng vào kho"
                : type === "EXPORT"
                ? "Xuất kho sản phẩm"
                : "Điều chỉnh kho (Kiểm kê)"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Thao tác biến động kho cho mặt hàng <span className="font-semibold text-gray-900">{variant.product.name}</span> ({variant.sku})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Thông tin sản phẩm & Tồn hiện tại */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 font-medium uppercase">Tồn kho hiện tại</div>
              <div className="text-2xl font-extrabold text-slate-800">{currentStock} <span className="text-sm font-normal text-gray-500">sản phẩm</span></div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 font-medium uppercase">Dự kiến sau thay đổi</div>
              <div className={`text-2xl font-extrabold ${projectedStock > currentStock ? "text-emerald-600" : projectedStock < currentStock ? "text-amber-600" : "text-slate-800"}`}>
                {projectedStock} <span className="text-sm font-normal text-gray-500">sản phẩm</span>
              </div>
            </div>
          </div>

          {/* Chọn Loại thao tác */}
          <div className="space-y-1.5">
            <Label htmlFor="type">Loại thao tác kho</Label>
            <Select
              value={type}
              onValueChange={(val) => {
                if (val) setType(val as "IMPORT" | "EXPORT" | "ADJUSTMENT")
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn loại thao tác" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IMPORT">🟢 Nhập kho (Tăng số lượng)</SelectItem>
                <SelectItem value="EXPORT">🟠 Xuất kho (Giảm số lượng)</SelectItem>
                <SelectItem value="ADJUSTMENT">🔵 Điều chỉnh theo kiểm kê thực tế</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Số lượng nhập/xuất hoặc Số lượng sau kiểm kê */}
          {type !== "ADJUSTMENT" ? (
            <div className="space-y-1.5">
              <Label htmlFor="quantity">
                {type === "IMPORT" ? "Số lượng nhập thêm" : "Số lượng xuất kho"}
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                placeholder="Nhập số lượng..."
                required
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="targetStock">Số lượng tồn kho thực tế kiểm kê được</Label>
              <Input
                id="targetStock"
                type="number"
                min="0"
                value={targetStockInput}
                onChange={(e) => setTargetStockInput(e.target.value)}
                placeholder={`Nhập số lượng thực tế (Hiện tại: ${currentStock})...`}
                required
              />
            </div>
          )}

          {/* Ghi chú / Lý do */}
          <div className="space-y-1.5">
            <Label htmlFor="reason">Ghi chú / Lý do biến động</Label>
            <Textarea
              id="reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                type === "IMPORT"
                  ? "Ví dụ: Nhập hàng từ nhà cung cấp Canon lô tháng 8..."
                  : type === "EXPORT"
                  ? "Ví dụ: Xuất hàng trưng bày, quà tặng..."
                  : "Ví dụ: Kiểm kê định kỳ phát hiện hỏng hóc/lệch sổ sách..."
              }
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              className={
                type === "IMPORT"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : type === "EXPORT"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : type === "IMPORT" ? (
                "Xác nhận nhập kho"
              ) : type === "EXPORT" ? (
                "Xác nhận xuất kho"
              ) : (
                "Lưu kiểm kê"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
