"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

// ── Types ─────────────────────────────────────────────────────────────────────

export type ProductVariantInput = {
  id?: string          // existing variant id (for update)
  sku: string
  name: string
  price: number
  originalPrice: number | null
  stockQuantity: number
  images: string[]
  attributes: { key: string, value: string }[]
}

const processAttributes = (attrs?: { key: string, value: string }[]) => {
  if (!attrs || attrs.length === 0) return Prisma.JsonNull;
  const obj: Record<string, string> = {};
  for (const a of attrs) {
    if (a.key.trim() && a.value.trim()) {
      obj[a.key.trim()] = a.value.trim();
    }
  }
  return Object.keys(obj).length > 0 ? obj : Prisma.JsonNull;
}

export type ProductInput = {
  name: string
  slug: string
  categoryId: number
  brandId?: number | null
  brand: string
  order?: number
  images: string[]
  description: string
  productType: string
  isActive: boolean
  isFeatured?: boolean
  isContactPrice?: boolean
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  quickSpecs?: string[] // Added for Quick Specs
  specifications?: { label: string, value: string }[] // Added for technical specifications
  manuals?: { content: string, files: string[] }
  drivers?: { content: string, files: string[] }
  rentalTerms?: {
    deposit?: number
    minMonths?: number
    freeBw?: number
    freeColor?: number
    overageBw?: number
    overageColor?: number
  }
  customOptions?: any // Added for custom-build addons
  variants: ProductVariantInput[]
  policyIds?: number[] // Added for Product Policies
  consumableIds?: number[] // Added for Consumables
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getProducts(params?: {
  search?: string
  categoryId?: number
  productType?: string
  status?: 'all' | 'active' | 'inactive' | 'deleted'
  page?: number
  pageSize?: number
}) {
  try {
    const page = Math.max(1, params?.page || 1)
    const pageSize = Math.min(100, Math.max(1, params?.pageSize || 20))
    const skip = (page - 1) * pageSize

    const where: Prisma.ProductWhereInput = {}

    if (params?.status === 'deleted') {
      where.deletedAt = { not: null }
    } else {
      where.deletedAt = null
      if (params?.status === 'active') {
        where.isActive = true
      } else if (params?.status === 'inactive') {
        where.isActive = false
      }
    }

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { brand: { contains: params.search, mode: 'insensitive' } },
        { variants: { some: { sku: { contains: params.search, mode: 'insensitive' } } } },
      ]
    }

    if (params?.categoryId) {
      const childCategories = await prisma.category.findMany({
        where: { parentId: params.categoryId },
        select: { id: true },
      })
      if (childCategories.length > 0) {
        where.categoryId = { in: [params.categoryId, ...childCategories.map((c) => c.id)] }
      } else {
        where.categoryId = params.categoryId
      }
    }

    if (params?.productType && params.productType !== 'all') {
      where.productType = params.productType
    }

    if (params?.status === 'active') {
      where.isActive = true
    } else if (params?.status === 'inactive') {
      where.isActive = false
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: [{ category: { order: 'asc' } }, { order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize,
        include: {
          category: { select: { id: true, name: true, color: true, order: true } },
          _count: { select: { variants: true } },
          variants: {
            select: { price: true, originalPrice: true, stockQuantity: true },
            orderBy: { price: 'asc' },
          },
        },
      }),
    ])

    const totalPages = Math.ceil(total / pageSize)

    return { data: products, total, totalPages, page, pageSize }
  } catch (error) {
    console.error("getProducts error:", error)
    return { error: "Không thể tải danh sách sản phẩm." }
  }
}

export async function getProduct(id: number) {
  try {
    const product = await prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: {
        category: true,
        policies: true,
        consumables: true,
        variants: {
          orderBy: { price: 'asc' },
        },
      },
    })
    if (!product) return { error: "Sản phẩm không tồn tại." }
    return { data: product }
  } catch (error) {
    console.error("getProduct error:", error)
    return { error: "Không thể tải sản phẩm." }
  }
}

export async function normalizeCategoryOrders(categoryId: number) {
  try {
    const prods = await prisma.product.findMany({
      where: { categoryId, deletedAt: null },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, order: true },
    })

    const updates = []
    for (let i = 0; i < prods.length; i++) {
      if (prods[i].order !== i) {
        updates.push(
          prisma.product.update({
            where: { id: prods[i].id },
            data: { order: i },
          })
        )
      }
    }
    if (updates.length > 0) {
      await prisma.$transaction(updates)
    }
  } catch (err) {
    console.error("normalizeCategoryOrders error:", err)
  }
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createProduct(input: ProductInput) {
  try {
    let targetOrder = input.order ?? 0
    if (input.order === undefined) {
      const maxOrderProd = await prisma.product.findFirst({
        where: { categoryId: input.categoryId, deletedAt: null },
        orderBy: { order: 'desc' },
        select: { order: true }
      })
      targetOrder = (maxOrderProd?.order ?? -1) + 1
    } else {
      await prisma.product.updateMany({
        where: {
          categoryId: input.categoryId,
          deletedAt: null,
          order: { gte: targetOrder },
        },
        data: {
          order: { increment: 1 },
        },
      })
    }

    const product = await prisma.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        category: { connect: { id: input.categoryId } },
        brandRef: input.brandId ? { connect: { id: input.brandId } } : undefined,
        brand: input.brand || null,
        order: targetOrder,
        images: input.images.length > 0 ? input.images : Prisma.JsonNull,
        description: input.description || null,
        productType: input.productType || 'standard',
        isActive: input.isActive,
        isFeatured: input.isFeatured || false,
        isContactPrice: input.isContactPrice || false,
        metaTitle: input.metaTitle || null,
        metaDescription: input.metaDescription || null,
        metaKeywords: input.metaKeywords || null,
        quickSpecs: input.quickSpecs && input.quickSpecs.length > 0 ? input.quickSpecs : Prisma.JsonNull,
        specifications: input.specifications && input.specifications.length > 0 ? input.specifications : Prisma.JsonNull,
        manuals: input.manuals ? input.manuals as any : Prisma.JsonNull,
        drivers: input.drivers ? input.drivers as any : Prisma.JsonNull,
        rentalTerms: input.rentalTerms ? input.rentalTerms as any : Prisma.JsonNull,
        customOptions: input.customOptions ? input.customOptions : Prisma.JsonNull,
        policies: {
          connect: input.policyIds?.map(id => ({ id })) || []
        },
        consumables: {
          connect: input.consumableIds?.map(id => ({ id })) || []
        },
        variants: {
          create: input.variants.map((v) => ({
            sku: v.sku,
            name: v.name || null,
            price: v.price,
            originalPrice: v.originalPrice || null,
            stockQuantity: v.stockQuantity,
            images: Array.isArray(v.images) && v.images.length > 0 ? v.images : Prisma.JsonNull,
            attributes: processAttributes(v.attributes),
          })),
        },
      },
    })

    await normalizeCategoryOrders(input.categoryId)

    revalidatePath("/admin/products")
    revalidatePath("/")
    revalidatePath("/san-pham")
    return { success: true, data: product }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { error: "Slug hoặc SKU đã tồn tại. Vui lòng kiểm tra lại." }
    }
    console.error("createProduct error:", error)
    return { error: "Lỗi hệ thống. Không thể tạo sản phẩm." }
  }
}

export async function updateProduct(id: number, input: ProductInput) {
  try {
    // Lấy danh sách variant IDs hiện tại
    const existingVariants = await prisma.productVariant.findMany({
      where: { productId: id },
      select: { id: true },
    })
    const existingIds = new Set(existingVariants.map((v) => v.id))

    // Tách variants: update / create
    const toUpdate = input.variants.filter((v) => v.id && existingIds.has(v.id))
    const toCreate = input.variants.filter((v) => !v.id)
    const toKeepIds = new Set(toUpdate.map((v) => v.id!))
    const toDeleteIds = [...existingIds].filter((id) => !toKeepIds.has(id))

    const existingProd = await prisma.product.findUnique({
      where: { id },
      select: { order: true, categoryId: true },
    })

    if (existingProd && (input.order !== existingProd.order || input.categoryId !== existingProd.categoryId)) {
      await prisma.product.updateMany({
        where: {
          categoryId: input.categoryId,
          deletedAt: null,
          id: { not: id },
          order: { gte: input.order },
        },
        data: {
          order: { increment: 1 },
        },
      })
    }

    // Transaction để đảm bảo tính toàn vẹn
    await prisma.$transaction(async (tx) => {
      // Update product info
      await tx.product.update({
        where: { id },
        data: {
          name: input.name,
          slug: input.slug,
          category: { connect: { id: input.categoryId } },
          brandRef: input.brandId ? { connect: { id: input.brandId } } : { disconnect: true },
          brand: input.brand || null,
          ...(input.order !== undefined ? { order: input.order } : {}),
          images: input.images.length > 0 ? input.images : Prisma.JsonNull,
          description: input.description || null,
          productType: input.productType || 'standard',
          isActive: input.isActive,
          isFeatured: input.isFeatured ?? false,
          isContactPrice: input.isContactPrice ?? false,
          metaTitle: input.metaTitle || null,
          metaDescription: input.metaDescription || null,
          metaKeywords: input.metaKeywords || null,
          quickSpecs: input.quickSpecs && input.quickSpecs.length > 0 ? input.quickSpecs : Prisma.JsonNull,
          specifications: input.specifications && input.specifications.length > 0 ? input.specifications : Prisma.JsonNull,
          manuals: input.manuals ? input.manuals as any : Prisma.JsonNull,
          drivers: input.drivers ? input.drivers as any : Prisma.JsonNull,
          rentalTerms: input.rentalTerms ? input.rentalTerms as any : Prisma.JsonNull,
          customOptions: input.customOptions ? input.customOptions : Prisma.JsonNull,
          policies: {
            set: input.policyIds?.map(id => ({ id })) || []
          },
          consumables: {
            set: input.consumableIds?.map(id => ({ id })) || []
          }
        },
      })

      // Delete removed variants
      if (toDeleteIds.length > 0) {
        await tx.productVariant.deleteMany({ where: { id: { in: toDeleteIds } } })
      }

      // Update existing variants
      for (const v of toUpdate) {
        await tx.productVariant.update({
          where: { id: v.id! },
          data: {
            sku: v.sku,
            name: v.name || null,
            price: v.price,
            originalPrice: v.originalPrice || null,
            stockQuantity: v.stockQuantity,
            images: Array.isArray(v.images) && v.images.length > 0 ? v.images : Prisma.JsonNull,
            attributes: processAttributes(v.attributes),
          },
        })
      }

      // Create new variants
      if (toCreate.length > 0) {
        await tx.productVariant.createMany({
          data: toCreate.map((v) => ({
            productId: id,
            sku: v.sku,
            name: v.name || null,
            price: v.price,
            originalPrice: v.originalPrice || null,
            stockQuantity: v.stockQuantity,
            images: Array.isArray(v.images) && v.images.length > 0 ? v.images : Prisma.JsonNull,
            attributes: processAttributes(v.attributes),
          })),
        })
      }
    })

    await normalizeCategoryOrders(input.categoryId)
    if (existingProd && existingProd.categoryId !== input.categoryId) {
      await normalizeCategoryOrders(existingProd.categoryId)
    }

    revalidatePath("/admin/products")
    revalidatePath(`/admin/products/${id}`)
    revalidatePath("/")
    revalidatePath("/san-pham")
    if (input.slug) {
      revalidatePath(`/san-pham/${input.slug}`)
    }
    return { success: true }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { error: "Slug hoặc SKU đã tồn tại. Vui lòng kiểm tra lại." }
    }
    console.error("updateProduct error:", error)
    return { error: "Lỗi hệ thống. Không thể cập nhật sản phẩm." }
  }
}

export async function updateProductOrders(items: { id: number; order: number }[]) {
  try {
    const transactions = items.map((item) =>
      prisma.product.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
    await prisma.$transaction(transactions)
    revalidatePath("/admin/products")
    revalidatePath("/")
    revalidatePath("/san-pham")
    return { success: true }
  } catch (error) {
    console.error("updateProductOrders error:", error)
    return { error: "Không thể cập nhật thứ tự sản phẩm." }
  }
}

export async function toggleProductActive(id: number, current: boolean) {
  try {
    await prisma.product.update({ where: { id }, data: { isActive: !current } })
    revalidatePath("/admin/products")
    revalidatePath("/")
    revalidatePath("/san-pham")
    return { success: true }
  } catch (error) {
    console.error("toggleProductActive error:", error)
    return { error: "Lỗi hệ thống." }
  }
}

export async function deleteProduct(id: number) {
  try {
    const prod = await prisma.product.findUnique({ where: { id }, select: { categoryId: true } })
    // Soft delete
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    if (prod) await normalizeCategoryOrders(prod.categoryId)

    revalidatePath("/admin/products")
    revalidatePath("/admin/categories")
    revalidatePath("/")
    revalidatePath("/san-pham")
    return { success: true }
  } catch (error) {
    console.error("deleteProduct error:", error)
    return { error: "Lỗi hệ thống. Không thể xóa sản phẩm." }
  }
}

export async function restoreProduct(id: number) {
  try {
    const prod = await prisma.product.findUnique({ where: { id }, select: { categoryId: true } })
    await prisma.product.update({
      where: { id },
      data: { deletedAt: null },
    })
    if (prod) await normalizeCategoryOrders(prod.categoryId)

    revalidatePath("/admin/products")
    revalidatePath("/admin/categories")
    revalidatePath("/")
    revalidatePath("/san-pham")
    return { success: true }
  } catch (error) {
    console.error("restoreProduct error:", error)
    return { error: "Lỗi hệ thống. Không thể khôi phục sản phẩm." }
  }
}

export async function hardDeleteProduct(id: number) {
  try {
    const prod = await prisma.product.findUnique({ where: { id }, select: { categoryId: true } })
    await prisma.product.delete({
      where: { id },
    })
    if (prod) await normalizeCategoryOrders(prod.categoryId)

    revalidatePath("/admin/products")
    revalidatePath("/admin/categories")
    revalidatePath("/")
    revalidatePath("/san-pham")
    return { success: true }
  } catch (error) {
    console.error("hardDeleteProduct error:", error)
    return { error: "Không thể xóa vĩnh viễn sản phẩm do đang có dữ liệu liên quan." }
  }
}

export async function bulkDeleteProducts(ids: number[]) {
  try {
    if (ids.length === 0) return { success: true }
    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() },
    })

    revalidatePath("/admin/products")
    revalidatePath("/admin/categories")
    revalidatePath("/")
    revalidatePath("/san-pham")
    return { success: true }
  } catch (error) {
    console.error("bulkDeleteProducts error:", error)
    return { error: "Lỗi hệ thống. Không thể chuyển các sản phẩm vào thùng rác." }
  }
}

export async function bulkRestoreProducts(ids: number[]) {
  try {
    if (ids.length === 0) return { success: true }
    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: null },
    })

    revalidatePath("/admin/products")
    revalidatePath("/admin/categories")
    revalidatePath("/")
    revalidatePath("/san-pham")
    return { success: true }
  } catch (error) {
    console.error("bulkRestoreProducts error:", error)
    return { error: "Lỗi hệ thống. Không thể khôi phục các sản phẩm." }
  }
}

export async function bulkHardDeleteProducts(ids: number[]) {
  try {
    if (ids.length === 0) return { success: true }
    await prisma.product.deleteMany({
      where: { id: { in: ids } },
    })

    revalidatePath("/admin/products")
    revalidatePath("/admin/categories")
    revalidatePath("/")
    revalidatePath("/san-pham")
    return { success: true }
  } catch (error) {
    console.error("bulkHardDeleteProducts error:", error)
    return { error: "Không thể xóa vĩnh viễn một số sản phẩm do đang có dữ liệu liên quan." }
  }
}


export async function duplicateProduct(id: number) {
  try {
    const source = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        policies: true,
        consumables: true,
        variants: true,
      },
    })

    if (!source) return { error: "Sản phẩm gốc không tồn tại." }

    const targetOrder = source.order + 1

    await prisma.product.updateMany({
      where: {
        categoryId: source.categoryId,
        deletedAt: null,
        order: { gte: targetOrder },
      },
      data: {
        order: { increment: 1 },
      },
    })

    const timestamp = Date.now().toString().slice(-4)
    const newName = `${source.name} (Bản sao)`
    const newSlug = `${source.slug}-copy-${timestamp}`

    const newProduct = await prisma.product.create({
      data: {
        name: newName,
        slug: newSlug,
        categoryId: source.categoryId,
        brandId: source.brandId,
        brand: source.brand,
        order: targetOrder,
        images: source.images ?? Prisma.JsonNull,
        description: source.description,
        productType: source.productType,
        isActive: source.isActive,
        isFeatured: source.isFeatured,
        isContactPrice: source.isContactPrice,
        metaTitle: source.metaTitle ? `${source.metaTitle} (Bản sao)` : null,
        metaDescription: source.metaDescription,
        metaKeywords: source.metaKeywords,
        quickSpecs: source.quickSpecs ?? Prisma.JsonNull,
        specifications: source.specifications ?? Prisma.JsonNull,
        manuals: source.manuals ?? Prisma.JsonNull,
        drivers: source.drivers ?? Prisma.JsonNull,
        rentalTerms: source.rentalTerms ?? Prisma.JsonNull,
        customOptions: source.customOptions ?? Prisma.JsonNull,
        policies: {
          connect: source.policies.map((p) => ({ id: p.id })),
        },
        consumables: {
          connect: source.consumables.map((c) => ({ id: c.id })),
        },
        variants: {
          create: source.variants.map((v, index) => ({
            sku: `${v.sku}-COPY-${timestamp}${index > 0 ? `-${index}` : ''}`,
            name: v.name,
            price: v.price,
            originalPrice: v.originalPrice,
            stockQuantity: v.stockQuantity,
            images: v.images ?? Prisma.JsonNull,
            attributes: v.attributes ?? Prisma.JsonNull,
          })),
        },
      },
    })

    await normalizeCategoryOrders(source.categoryId)

    revalidatePath("/admin/products")
    revalidatePath("/")
    revalidatePath("/san-pham")
    return { success: true, data: newProduct }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { error: "Lỗi trùng lặp Slug hoặc SKU khi sao chép sản phẩm." }
    }
    console.error("duplicateProduct error:", error)
    return { error: "Lỗi hệ thống. Không thể sao chép sản phẩm." }
  }
}

