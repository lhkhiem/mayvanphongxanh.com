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
  images: string[]
  description: string
  productType: string
  isActive: boolean
  isFeatured?: boolean
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
  status?: 'all' | 'active' | 'inactive'
  page?: number
  pageSize?: number
}) {
  try {
    const page = Math.max(1, params?.page || 1)
    const pageSize = Math.min(100, Math.max(1, params?.pageSize || 20))
    const skip = (page - 1) * pageSize

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    }

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { brand: { contains: params.search, mode: 'insensitive' } },
        { variants: { some: { sku: { contains: params.search, mode: 'insensitive' } } } },
      ]
    }

    if (params?.categoryId) {
      where.categoryId = params.categoryId
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          category: { select: { id: true, name: true, color: true } },
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

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createProduct(input: ProductInput) {
  try {
    const product = await prisma.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        category: { connect: { id: input.categoryId } },
        brandRef: input.brandId ? { connect: { id: input.brandId } } : undefined,
        brand: input.brand || null,
        images: input.images.length > 0 ? input.images : Prisma.JsonNull,
        description: input.description || null,
        productType: input.productType || 'standard',
        isActive: input.isActive,
        isFeatured: input.isFeatured || false,
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
    revalidatePath("/admin/products")
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
          images: input.images.length > 0 ? input.images : Prisma.JsonNull,
          description: input.description || null,
          productType: input.productType || 'standard',
          isActive: input.isActive,
          isFeatured: input.isFeatured ?? false,
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

    revalidatePath("/admin/products")
    revalidatePath(`/admin/products/${id}`)
    return { success: true }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { error: "Slug hoặc SKU đã tồn tại. Vui lòng kiểm tra lại." }
    }
    console.error("updateProduct error:", error)
    return { error: "Lỗi hệ thống. Không thể cập nhật sản phẩm." }
  }
}

export async function toggleProductActive(id: number, current: boolean) {
  try {
    await prisma.product.update({ where: { id }, data: { isActive: !current } })
    revalidatePath("/admin/products")
    return { success: true }
  } catch (error) {
    console.error("toggleProductActive error:", error)
    return { error: "Lỗi hệ thống." }
  }
}

export async function deleteProduct(id: number) {
  try {
    // Soft delete
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    revalidatePath("/admin/products")
    return { success: true }
  } catch (error) {
    console.error("deleteProduct error:", error)
    return { error: "Lỗi hệ thống. Không thể xóa sản phẩm." }
  }
}
