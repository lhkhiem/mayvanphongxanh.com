"use server"

import { Prisma, WarrantyEventType, WarrantyStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"

const PAGE_SIZE_MAX = 100

export type WarrantyInput = {
  serialNumber: string
  productName: string
  sku?: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  orderId?: string
  orderItemId?: number | null
  purchaseDate: string
  warrantyMonths: number
  status: WarrantyStatus
  notes?: string
}

export type WarrantyListParams = {
  search?: string
  status?: WarrantyStatus | "all"
  page?: number
  pageSize?: number
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : ""
}

function addMonths(date: Date, months: number) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

function normalizeWarrantyInput(input: WarrantyInput) {
  const serialNumber = cleanText(input.serialNumber, 120).toUpperCase()
  const productName = cleanText(input.productName, 220)
  const customerName = cleanText(input.customerName, 120)
  const customerPhone = cleanText(input.customerPhone, 32)
  const purchaseDate = new Date(input.purchaseDate)
  const warrantyMonths = Number(input.warrantyMonths)

  if (!serialNumber || !productName || !customerName || !customerPhone) {
    throw new Error("Vui lòng nhập đầy đủ thông tin bắt buộc.")
  }
  if (Number.isNaN(purchaseDate.getTime())) {
    throw new Error("Ngày mua hàng không hợp lệ.")
  }
  if (!Number.isInteger(warrantyMonths) || warrantyMonths < 1 || warrantyMonths > 120) {
    throw new Error("Thời hạn bảo hành phải từ 1 đến 120 tháng.")
  }

  return {
    serialNumber,
    productName,
    sku: cleanText(input.sku, 80) || null,
    customerName,
    customerPhone,
    customerEmail: cleanText(input.customerEmail, 160) || null,
    orderId: cleanText(input.orderId, 80) || null,
    orderItemId: input.orderItemId ? Number(input.orderItemId) : null,
    purchaseDate,
    warrantyMonths,
    expiresAt: addMonths(purchaseDate, warrantyMonths),
    status: input.status,
    notes: cleanText(input.notes, 2000) || null,
  }
}

export async function getWarrantyRecords(params?: WarrantyListParams) {
  try {
    const page = Math.max(1, params?.page || 1)
    const pageSize = Math.min(PAGE_SIZE_MAX, Math.max(1, params?.pageSize || 20))
    const skip = (page - 1) * pageSize
    const search = params?.search?.trim()

    const where: Prisma.WarrantyRecordWhereInput = {
      ...(params?.status && params.status !== "all" ? { status: params.status } : {}),
    }

    if (search) {
      where.OR = [
        { serialNumber: { contains: search, mode: "insensitive" } },
        { productName: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { orderId: { contains: search, mode: "insensitive" } },
      ]
    }

    const [total, records] = await Promise.all([
      prisma.warrantyRecord.count({ where }),
      prisma.warrantyRecord.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          events: {
            orderBy: { eventDate: "desc" },
            take: 5,
          },
        },
      }),
    ])

    return {
      data: records,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      page,
      pageSize,
    }
  } catch (error) {
    console.error("getWarrantyRecords error:", error)
    return { error: "Không thể tải danh sách bảo hành." }
  }
}

export async function getWarrantyStats() {
  try {
    const now = new Date()
    const [total, active, expired, voided, expiringSoon] = await Promise.all([
      prisma.warrantyRecord.count(),
      prisma.warrantyRecord.count({ where: { status: "ACTIVE", expiresAt: { gte: now } } }),
      prisma.warrantyRecord.count({ where: { OR: [{ status: "EXPIRED" }, { expiresAt: { lt: now } }] } }),
      prisma.warrantyRecord.count({ where: { status: "VOIDED" } }),
      prisma.warrantyRecord.count({
        where: {
          status: "ACTIVE",
          expiresAt: {
            gte: now,
            lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    return { data: { total, active, expired, voided, expiringSoon } }
  } catch (error) {
    console.error("getWarrantyStats error:", error)
    return { error: "Không thể tải thống kê bảo hành." }
  }
}

export async function createWarrantyRecord(input: WarrantyInput) {
  try {
    const data = normalizeWarrantyInput(input)
    const record = await prisma.warrantyRecord.create({
      data: {
        ...data,
        events: {
          create: {
            type: "ACTIVATED",
            title: "Kích hoạt bảo hành điện tử",
            note: data.notes || "Tạo phiếu bảo hành từ trang quản trị.",
            eventDate: data.purchaseDate,
          },
        },
      },
    })
    revalidatePath("/admin/maintenance")
    return { success: true, data: record }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Serial này đã tồn tại trong hệ thống." }
    }
    const message = error instanceof Error ? error.message : "Không thể tạo phiếu bảo hành."
    return { error: message }
  }
}

export async function updateWarrantyRecord(id: string, input: WarrantyInput) {
  try {
    const data = normalizeWarrantyInput(input)
    await prisma.warrantyRecord.update({
      where: { id },
      data,
    })
    revalidatePath("/admin/maintenance")
    return { success: true }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "Serial này đã tồn tại trong hệ thống." }
    }
    const message = error instanceof Error ? error.message : "Không thể cập nhật phiếu bảo hành."
    return { error: message }
  }
}

export async function deleteWarrantyRecord(id: string) {
  try {
    await prisma.warrantyRecord.delete({ where: { id } })
    revalidatePath("/admin/maintenance")
    return { success: true }
  } catch (error) {
    console.error("deleteWarrantyRecord error:", error)
    return { error: "Không thể xóa phiếu bảo hành." }
  }
}

export async function addWarrantyEvent(input: {
  warrantyId: string
  type: WarrantyEventType
  title: string
  note?: string
  eventDate?: string
}) {
  try {
    const title = cleanText(input.title, 180)
    if (!title) return { error: "Vui lòng nhập nội dung lịch sử." }

    const eventDate = input.eventDate ? new Date(input.eventDate) : new Date()
    if (Number.isNaN(eventDate.getTime())) return { error: "Ngày lịch sử không hợp lệ." }

    await prisma.warrantyEvent.create({
      data: {
        warrantyId: input.warrantyId,
        type: input.type,
        title,
        note: cleanText(input.note, 2000) || null,
        eventDate,
      },
    })
    revalidatePath("/admin/maintenance")
    return { success: true }
  } catch (error) {
    console.error("addWarrantyEvent error:", error)
    return { error: "Không thể thêm lịch sử bảo hành." }
  }
}