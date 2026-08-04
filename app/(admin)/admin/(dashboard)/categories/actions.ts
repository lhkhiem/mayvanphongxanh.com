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
  order: number
  isActive: boolean
  isFeatured: boolean
  _count: { products: number }
  children: CategoryWithChildren[]
}

/** Lấy toàn bộ danh mục, trả về flat list kèm phân loại số lượng products */
export async function getCategories() {
  try {
    const [categories, activeGroup, inactiveGroup, trashGroup] = await Promise.all([
      prisma.category.findMany({
        orderBy: [{ parentId: 'asc' }, { order: 'asc' }, { id: 'asc' }],
      }),
      prisma.product.groupBy({
        by: ['categoryId'],
        where: { isActive: true, deletedAt: null },
        _count: { id: true },
      }),
      prisma.product.groupBy({
        by: ['categoryId'],
        where: { isActive: false, deletedAt: null },
        _count: { id: true },
      }),
      prisma.product.groupBy({
        by: ['categoryId'],
        where: { deletedAt: { not: null } },
        _count: { id: true },
      }),
    ])

    const activeMap = new Map(activeGroup.map((g) => [g.categoryId, g._count.id]))
    const inactiveMap = new Map(inactiveGroup.map((g) => [g.categoryId, g._count.id]))
    const trashMap = new Map(trashGroup.map((g) => [g.categoryId, g._count.id]))

    const data = categories.map((cat) => {
      const activeProducts = activeMap.get(cat.id) || 0
      const inactiveProducts = inactiveMap.get(cat.id) || 0
      const trashProducts = trashMap.get(cat.id) || 0
      return {
        ...cat,
        _count: {
          products: activeProducts,
          activeProducts,
          inactiveProducts,
          trashProducts,
        },
      }
    })

    return { data }
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
  order?: number
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
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  metaImage?: string
}

export async function createCategory(data: CategoryFormData) {
  try {
    // If order is not explicitly provided, calculate max order + 1 among siblings
    let newOrder = data.order ?? 0
    if (data.order === undefined) {
      const maxOrderCat = await prisma.category.findFirst({
        where: { parentId: data.parentId || null },
        orderBy: { order: 'desc' },
        select: { order: true }
      })
      newOrder = (maxOrderCat?.order ?? -1) + 1
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        parentId: data.parentId || null,
        icon: data.icon || null,
        color: data.color || null,
        order: newOrder,
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
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        metaKeywords: data.metaKeywords || null,
        metaImage: data.metaImage || null,
      },
    })
    revalidatePath("/admin/categories")
    revalidatePath("/")
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
        order: data.order ?? 0,
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
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        metaKeywords: data.metaKeywords || null,
        metaImage: data.metaImage || null,
      },
    })
    revalidatePath("/admin/categories")
    revalidatePath("/")
    return { success: true, data: category }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { error: "Slug đã tồn tại. Vui lòng chọn slug khác." }
    }
    console.error("updateCategory error:", error)
    return { error: "Lỗi hệ thống. Không thể cập nhật danh mục." }
  }
}

export async function updateCategoryOrders(items: { id: number; order: number }[]) {
  try {
    const transactions = items.map((item) =>
      prisma.category.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
    await prisma.$transaction(transactions)
    revalidatePath("/admin/categories")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("updateCategoryOrders error:", error)
    return { error: "Không thể cập nhật thứ tự danh mục." }
  }
}

export async function toggleCategoryActive(id: number, current: boolean) {
  try {
    const category = await prisma.category.update({
      where: { id },
      data: { isActive: !current },
    })
    revalidatePath("/admin/categories")
    revalidatePath("/")
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
    // Check for products (distinguishing active vs trash products)
    const [activeCount, deletedCount] = await Promise.all([
      prisma.product.count({ where: { categoryId: id, deletedAt: null } }),
      prisma.product.count({ where: { categoryId: id, deletedAt: { not: null } } }),
    ])

    if (activeCount > 0 && deletedCount > 0) {
      return {
        error: `Danh mục này đang chứa ${activeCount} sản phẩm và ${deletedCount} sản phẩm trong Thùng rác. Vui lòng chuyển hoặc xóa vĩnh viễn các sản phẩm này trước khi xóa danh mục.`
      }
    }
    if (activeCount > 0) {
      return {
        error: `Danh mục này đang chứa ${activeCount} sản phẩm. Vui lòng chuyển sản phẩm sang danh mục khác hoặc xóa sản phẩm trước khi xóa danh mục.`
      }
    }
    if (deletedCount > 0) {
      return {
        error: `Danh mục này đang có ${deletedCount} sản phẩm nằm trong Thùng rác. Vui lòng vào Thùng rác xóa vĩnh viễn hoặc chuyển sản phẩm trước khi xóa danh mục.`
      }
    }

    await prisma.category.delete({ where: { id } })
    revalidatePath("/admin/categories")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("deleteCategory error:", error)
    return { error: "Lỗi hệ thống. Không thể xóa danh mục." }
  }
}
