"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

export type CategoryWithChildren = {
  id: number
  name: string
  slug: string
  parentId: number | null
  icon: string | null
  color: string | null
  isActive: boolean
  isFeatured: boolean
  _count: { products: number }
  children: CategoryWithChildren[]
}

/** Lấy toàn bộ danh mục, trả về flat list kèm _count products */
export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { products: true } },
      },
    })
    return { data: categories }
  } catch (error) {
    console.error("getCategories error:", error)
    return { error: "Không thể tải danh sách danh mục." }
  }
}

export type CategoryFormData = {
  name: string
  slug: string
  parentId: number | null
  icon: string
  color: string
  isActive: boolean
  isFeatured?: boolean
  hasPromo?: boolean
  promoTitle?: string
  promoDescription?: string
  promoBadgeText?: string
  promoBadgeColor?: string
  promoTargetUrl?: string
  promoImageUrl?: string
  showInFooter?: boolean
}

export async function createCategory(data: CategoryFormData) {
  try {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        parentId: data.parentId || null,
        icon: data.icon || null,
        color: data.color || null,
        isActive: data.isActive,
        isFeatured: data.isFeatured || false,
        hasPromo: data.hasPromo || false,
        promoTitle: data.promoTitle || null,
        promoDescription: data.promoDescription || null,
        promoBadgeText: data.promoBadgeText || null,
        promoBadgeColor: data.promoBadgeColor || null,
        promoTargetUrl: data.promoTargetUrl || null,
        promoImageUrl: data.promoImageUrl || null,
        showInFooter: data.showInFooter || false,
      },
    })
    revalidatePath("/admin/categories")
    return { success: true, data: category }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { error: "Slug đã tồn tại. Vui lòng chọn slug khác." }
    }
    console.error("createCategory error:", error)
    return { error: "Lỗi hệ thống. Không thể tạo danh mục." }
  }
}

export async function updateCategory(id: number, data: CategoryFormData) {
  // Ngăn chặn việc đặt chính danh mục này làm cha của nó
  if (data.parentId === id) {
    return { error: "Danh mục không thể là danh mục cha của chính nó." }
  }
  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        parentId: data.parentId || null,
        icon: data.icon || null,
        color: data.color || null,
        isActive: data.isActive,
        isFeatured: data.isFeatured ?? false,
        hasPromo: data.hasPromo ?? false,
        promoTitle: data.promoTitle || null,
        promoDescription: data.promoDescription || null,
        promoBadgeText: data.promoBadgeText || null,
        promoBadgeColor: data.promoBadgeColor || null,
        promoTargetUrl: data.promoTargetUrl || null,
        promoImageUrl: data.promoImageUrl || null,
        showInFooter: data.showInFooter ?? false,
      },
    })
    revalidatePath("/admin/categories")
    return { success: true, data: category }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { error: "Slug đã tồn tại. Vui lòng chọn slug khác." }
    }
    console.error("updateCategory error:", error)
    return { error: "Lỗi hệ thống. Không thể cập nhật danh mục." }
  }
}

export async function toggleCategoryActive(id: number, current: boolean) {
  try {
    const category = await prisma.category.update({
      where: { id },
      data: { isActive: !current },
    })
    revalidatePath("/admin/categories")
    return { success: true, data: category }
  } catch (error) {
    console.error("toggleCategoryActive error:", error)
    return { error: "Lỗi hệ thống." }
  }
}

export async function deleteCategory(id: number) {
  try {
    // Check for children
    const childCount = await prisma.category.count({ where: { parentId: id } })
    if (childCount > 0) {
      return { error: `Danh mục này có ${childCount} danh mục con. Vui lòng xóa hoặc chuyển danh mục con trước.` }
    }
    // Check for products
    const productCount = await prisma.product.count({ where: { categoryId: id } })
    if (productCount > 0) {
      return { error: `Danh mục này đang chứa ${productCount} sản phẩm. Vui lòng chuyển sản phẩm sang danh mục khác trước.` }
    }

    await prisma.category.delete({ where: { id } })
    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error) {
    console.error("deleteCategory error:", error)
    return { error: "Lỗi hệ thống. Không thể xóa danh mục." }
  }
}
