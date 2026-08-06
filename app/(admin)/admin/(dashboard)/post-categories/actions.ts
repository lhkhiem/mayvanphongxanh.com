"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { logAuditAction } from "@/lib/audit-logger"

export async function getPostCategories() {
  try {
    const categories = await prisma.postCategory.findMany({
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      include: {
        _count: {
          select: { posts: true }
        }
      }
    })
    return { data: categories }
  } catch (error) {
    console.error("Error fetching post categories:", error)
    return { error: "Không thể tải danh sách danh mục." }
  }
}

export async function createPostCategory(data: { name: string, slug: string, order?: number }) {
  try {
    let newOrder = data.order ?? 0
    if (data.order === undefined) {
      const maxOrderCat = await prisma.postCategory.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true }
      })
      newOrder = (maxOrderCat?.order ?? -1) + 1
    }

    const category = await prisma.postCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        order: newOrder,
      }
    })

    await logAuditAction({
      action: "CREATE",
      entity: "POST_CATEGORY",
      entityId: category.id,
      details: `Tạo danh mục bài viết mới: ${data.name}`,
      metadata: { name: data.name, slug: data.slug }
    })

    revalidatePath("/admin/post-categories")
    revalidatePath("/tin-tuc")
    return { success: true, data: category }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { error: "Slug đã tồn tại. Vui lòng chọn slug khác." }
      }
    }
    console.error("Error creating post category:", error)
    return { error: "Lỗi hệ thống. Không thể tạo danh mục." }
  }
}

export async function updatePostCategory(id: number, data: { name: string, slug: string, order?: number }) {
  try {
    const category = await prisma.postCategory.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        ...(data.order !== undefined ? { order: data.order } : {}),
      }
    })

    await logAuditAction({
      action: "UPDATE",
      entity: "POST_CATEGORY",
      entityId: id,
      details: `Cập nhật danh mục bài viết: ${data.name}`,
      metadata: { name: data.name, slug: data.slug }
    })

    revalidatePath("/admin/post-categories")
    revalidatePath("/tin-tuc")
    return { success: true, data: category }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { error: "Slug đã tồn tại. Vui lòng chọn slug khác." }
      }
    }
    console.error("Error updating post category:", error)
    return { error: "Lỗi hệ thống. Không thể cập nhật danh mục." }
  }
}

export async function updatePostCategoryOrders(items: { id: number; order: number }[]) {
  try {
    await prisma.$transaction(
      items.map((item) =>
        prisma.postCategory.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    )
    revalidatePath("/admin/post-categories")
    revalidatePath("/tin-tuc")
    return { success: true }
  } catch (error) {
    console.error("Error updating post category orders:", error)
    return { error: "Lỗi hệ thống. Không thể cập nhật thứ tự." }
  }
}

export async function updatePostCategoryOrder(id: number, newOrder: number) {
  try {
    const category = await prisma.postCategory.update({
      where: { id },
      data: { order: newOrder }
    })
    revalidatePath("/admin/post-categories")
    revalidatePath("/tin-tuc")
    return { success: true, data: category }
  } catch (error) {
    console.error("Error updating post category order:", error)
    return { error: "Lỗi hệ thống. Không thể thay đổi thứ tự." }
  }
}

export async function deletePostCategory(id: number) {
  try {
    await prisma.postCategory.delete({
      where: { id }
    })

    await logAuditAction({
      action: "DELETE",
      entity: "POST_CATEGORY",
      entityId: id,
      details: `Xóa danh mục bài viết ID #${id}`
    })

    revalidatePath("/admin/post-categories")
    revalidatePath("/tin-tuc")
    return { success: true }
  } catch (error) {
    console.error("Error deleting post category:", error)
    return { error: "Lỗi hệ thống. Không thể xóa danh mục." }
  }
}
