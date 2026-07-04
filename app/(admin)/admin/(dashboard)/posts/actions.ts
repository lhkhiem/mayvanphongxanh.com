"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

export async function getPosts(filter?: 'all' | 'published' | 'drafts') {
  try {
    let whereClause = {}
    if (filter === 'published') {
      whereClause = { isActive: true }
    } else if (filter === 'drafts') {
      whereClause = { isActive: false }
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true
      }
    })
    return { data: posts }
  } catch (error) {
    console.error("Error fetching posts:", error)
    return { error: "Không thể tải danh sách bài viết." }
  }
}

export async function getPost(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
    })
    return { data: post }
  } catch (error) {
    console.error("Error fetching post:", error)
    return { error: "Không thể tải bài viết." }
  }
}

export async function createPost(data: any) {
  try {
    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        image: data.image,
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        isActive: data.isActive,
        publishedAt: data.isActive ? new Date() : null,
      }
    })
    revalidatePath("/admin/posts")
    return { success: true, data: post }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { error: "Slug đã tồn tại. Vui lòng chọn slug khác." }
      }
    }
    console.error("Error creating post:", error)
    return { error: "Lỗi hệ thống. Không thể tạo bài viết." }
  }
}

export async function updatePost(id: string, data: any) {
  try {
    const updateData: any = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      image: data.image,
      categoryId: data.categoryId ? parseInt(data.categoryId) : null,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      isActive: data.isActive,
    }

    // Only update publishedAt if it's changing from draft to published
    if (data.isActive && !data.wasActive) {
      updateData.publishedAt = new Date()
    }

    const post = await prisma.post.update({
      where: { id },
      data: updateData
    })
    revalidatePath("/admin/posts")
    return { success: true, data: post }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { error: "Slug đã tồn tại. Vui lòng chọn slug khác." }
      }
    }
    console.error("Error updating post:", error)
    return { error: "Lỗi hệ thống. Không thể cập nhật bài viết." }
  }
}

export async function togglePostActive(id: string, currentActiveStatus: boolean) {
  try {
    const post = await prisma.post.update({
      where: { id },
      data: {
        isActive: !currentActiveStatus,
        publishedAt: !currentActiveStatus ? new Date() : null
      }
    })
    revalidatePath("/admin/posts")
    return { success: true, data: post }
  } catch (error) {
    console.error("Error toggling post status:", error)
    return { error: "Lỗi hệ thống. Không thể thay đổi trạng thái." }
  }
}

export async function deletePost(id: string) {
  try {
    await prisma.post.delete({
      where: { id }
    })
    revalidatePath("/admin/posts")
    return { success: true }
  } catch (error) {
    console.error("Error deleting post:", error)
    return { error: "Lỗi hệ thống. Không thể xóa bài viết." }
  }
}
