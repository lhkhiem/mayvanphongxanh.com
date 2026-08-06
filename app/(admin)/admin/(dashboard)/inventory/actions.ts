"use server"

import { InventoryLogType, Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { logAuditAction } from "@/lib/audit-logger"

const PAGE_SIZE_DEFAULT = 20

export type InventoryListParams = {
  search?: string
  categoryId?: number | "all"
  stockStatus?: "all" | "in_stock" | "low_stock" | "out_of_stock"
  page?: number
  pageSize?: number
}

export type HierarchicalCategory = {
  id: number
  name: string
  parentId: number | null
  level: number
  displayName: string
}

export async function getInventoryProducts(params?: InventoryListParams) {
  try {
    const page = Math.max(1, params?.page || 1)
    const pageSize = Math.min(100, Math.max(1, params?.pageSize || PAGE_SIZE_DEFAULT))
    const skip = (page - 1) * pageSize
    const search = params?.search?.trim()

    let categoryCondition: Prisma.IntFilter | number | undefined = undefined
    if (params?.categoryId && params.categoryId !== "all") {
      const selectedCatId = Number(params.categoryId)
      const allCategories = await prisma.category.findMany({
        select: { id: true, parentId: true },
      })

      const targetCategoryIds = new Set<number>([selectedCatId])
      const addChildren = (parentId: number) => {
        const children = allCategories.filter((c) => c.parentId === parentId)
        for (const child of children) {
          targetCategoryIds.add(child.id)
          addChildren(child.id)
        }
      }
      addChildren(selectedCatId)

      categoryCondition = { in: Array.from(targetCategoryIds) }
    }

    const where: Prisma.ProductVariantWhereInput = {
      product: {
        deletedAt: null,
        ...(categoryCondition ? { categoryId: categoryCondition } : {}),
      },
    }

    if (search) {
      where.OR = [
        { sku: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { product: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    if (params?.stockStatus === "out_of_stock") {
      where.stockQuantity = 0
    }

    const [total, variants] = await Promise.all([
      prisma.productVariant.count({ where }),
      prisma.productVariant.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ stockQuantity: "asc" }, { id: "asc" }],
        select: {
          id: true,
          sku: true,
          name: true,
          price: true,
          stockQuantity: true,
          lowStockThreshold: true,
          images: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
              brandRef: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          inventoryLogs: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: {
              type: true,
              quantity: true,
              createdAt: true,
              reason: true,
            },
          },
        },
      }),
    ])

    let filteredVariants = variants
    if (params?.stockStatus === "low_stock") {
      filteredVariants = variants.filter(
        (v) => v.stockQuantity > 0 && v.stockQuantity <= v.lowStockThreshold
      )
    } else if (params?.stockStatus === "in_stock") {
      filteredVariants = variants.filter((v) => v.stockQuantity > v.lowStockThreshold)
    }

    return {
      data: filteredVariants,
      total: params?.stockStatus && params.stockStatus !== "all" && params.stockStatus !== "out_of_stock" 
        ? filteredVariants.length 
        : total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      page,
      pageSize,
    }
  } catch (error) {
    console.error("getInventoryProducts error:", error)
    return { error: "Không thể tải danh sách kho hàng." }
  }
}

export async function getInventoryStats() {
  try {
    const allVariants = await prisma.productVariant.findMany({
      where: {
        product: { deletedAt: null },
      },
      select: {
        stockQuantity: true,
        lowStockThreshold: true,
      },
    })

    const totalVariants = allVariants.length
    let outOfStock = 0
    let lowStock = 0
    let inStock = 0
    let totalStockUnits = 0

    allVariants.forEach((v) => {
      totalStockUnits += v.stockQuantity
      if (v.stockQuantity === 0) {
        outOfStock++
      } else if (v.stockQuantity <= v.lowStockThreshold) {
        lowStock++
      } else {
        inStock++
      }
    })

    return {
      data: {
        totalVariants,
        outOfStock,
        lowStock,
        inStock,
        totalStockUnits,
      },
    }
  } catch (error) {
    console.error("getInventoryStats error:", error)
    return { error: "Không thể tải thống kê kho hàng." }
  }
}

export type AdjustStockInput = {
  variantId: string
  type: "IMPORT" | "EXPORT" | "ADJUSTMENT"
  changeQuantity: number
  reason?: string
  referenceId?: string
}

export async function adjustStock(input: AdjustStockInput) {
  try {
    const { variantId, type, changeQuantity, reason, referenceId } = input

    if (!variantId || changeQuantity === 0) {
      return { error: "Dữ liệu nhập/xuất kho không hợp lệ." }
    }

    const result = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: variantId },
        select: { id: true, stockQuantity: true, name: true, sku: true, product: { select: { name: true } } },
      })

      if (!variant) {
        throw new Error("Không tìm thấy biến thể sản phẩm.")
      }

      const previousStock = variant.stockQuantity
      const newStock = Math.max(0, previousStock + changeQuantity)

      const updatedVariant = await tx.productVariant.update({
        where: { id: variantId },
        data: { stockQuantity: newStock },
      })

      const log = await tx.inventoryLog.create({
        data: {
          variantId,
          type,
          quantity: changeQuantity,
          previousStock,
          newStock,
          reason: reason || (type === "IMPORT" ? "Nhập kho thủ công" : type === "EXPORT" ? "Xuất kho thủ công" : "Điều chỉnh kiểm kê"),
          referenceId: referenceId || null,
        },
      })

      return { updatedVariant, log, variantName: variant.product?.name || variant.sku }
    })

    await logAuditAction({
      action: "INVENTORY",
      entity: "INVENTORY",
      entityId: variantId,
      details: `${type === 'IMPORT' ? 'Nhập kho' : type === 'EXPORT' ? 'Xuất kho' : 'Điều chỉnh'} kho hàng (${changeQuantity > 0 ? '+' : ''}${changeQuantity}) cho ${result.variantName}`,
      metadata: { type, changeQuantity, reason, referenceId }
    })

    revalidatePath("/admin/inventory")
    revalidatePath("/admin/products")
    return { success: true, data: result }
  } catch (error: any) {
    console.error("adjustStock error:", error)
    return { error: error.message || "Không thể thực hiện điều chỉnh kho." }
  }
}

export async function updateVariantThreshold(variantId: string, lowStockThreshold: number) {
  try {
    if (lowStockThreshold < 0) {
      return { error: "Ngưỡng cảnh báo không thể âm." }
    }

    await prisma.productVariant.update({
      where: { id: variantId },
      data: { lowStockThreshold },
    })

    await logAuditAction({
      action: "UPDATE",
      entity: "INVENTORY",
      entityId: variantId,
      details: `Cập nhật ngưỡng cảnh báo kho cho biến thể ID #${variantId} thành ${lowStockThreshold}`
    })

    revalidatePath("/admin/inventory")
    return { success: true }
  } catch (error) {
    console.error("updateVariantThreshold error:", error)
    return { error: "Không thể cập nhật ngưỡng cảnh báo." }
  }
}

export type InventoryLogListParams = {
  search?: string
  type?: InventoryLogType | "all"
  page?: number
  pageSize?: number
}

export async function getInventoryLogs(params?: InventoryLogListParams) {
  try {
    const page = Math.max(1, params?.page || 1)
    const pageSize = Math.min(100, Math.max(1, params?.pageSize || PAGE_SIZE_DEFAULT))
    const skip = (page - 1) * pageSize
    const search = params?.search?.trim()

    const where: Prisma.InventoryLogWhereInput = {
      ...(params?.type && params.type !== "all" ? { type: params.type } : {}),
    }

    if (search) {
      where.OR = [
        { reason: { contains: search, mode: "insensitive" } },
        { referenceId: { contains: search, mode: "insensitive" } },
        { variant: { sku: { contains: search, mode: "insensitive" } } },
        { variant: { name: { contains: search, mode: "insensitive" } } },
        { variant: { product: { name: { contains: search, mode: "insensitive" } } } },
      ]
    }

    const [total, logs] = await Promise.all([
      prisma.inventoryLog.count({ where }),
      prisma.inventoryLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          quantity: true,
          previousStock: true,
          newStock: true,
          reason: true,
          referenceId: true,
          createdAt: true,
          variant: {
            select: {
              sku: true,
              name: true,
              product: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
    ])

    return {
      data: logs,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      page,
      pageSize,
    }
  } catch (error) {
    console.error("getInventoryLogs error:", error)
    return { error: "Không thể tải nhật ký xuất nhập kho." }
  }
}

export async function getInventoryCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, parentId: true, color: true, icon: true, order: true },
      orderBy: [{ parentId: "asc" }, { order: "asc" }, { name: "asc" }],
    })
    return { data: categories }
  } catch (error) {
    console.error("getInventoryCategories error:", error)
    return { error: "Không thể tải danh mục." }
  }
}
