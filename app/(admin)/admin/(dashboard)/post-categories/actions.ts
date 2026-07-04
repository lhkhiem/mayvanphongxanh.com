"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

export async function getPostCategories() {
  try {
    const categories = await prisma.postCategory.findMany({
      orderBy: { id: 'desc' }
    })
    return { data: categories }
  } catch (error) {
    console.error("Error fetching post categories:", error)
    return { error: "Không thể tải danh sách danh mục." }
  }
}

export async function createPostCategory(data: { name: string, slug: string }) {
  try {
    const category = await prisma.postCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
      }
    })
    revalidatePath("/admin/post-categories")
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

export async function updatePostCategory(id: number, data: { name: string, slug: string }) {
  try {
    const category = await prisma.postCategory.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
      }
    })
    revalidatePath("/admin/post-categories")
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

export async function deletePostCategory(id: number) {
  try {
    await prisma.postCategory.delete({
      where: { id }
    })
    revalidatePath("/admin/post-categories")
    return { success: true }
  } catch (error) {
    console.error("Error deleting post category:", error)
    return { error: "Lỗi hệ thống. Không thể xóa danh mục." }
  }
}
