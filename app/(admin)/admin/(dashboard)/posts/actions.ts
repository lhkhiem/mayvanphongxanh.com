"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { logAuditAction } from "@/lib/audit-logger"

export async function getPosts(filter?: 'all' | 'published' | 'drafts', categoryId?: string | number) {
  try {
    const whereClause: any = {}
    if (filter === 'published') {
      whereClause.isActive = true
    } else if (filter === 'drafts') {
      whereClause.isActive = false
    }

    if (categoryId && categoryId !== 'all') {
      whereClause.categoryId = parseInt(String(categoryId))
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
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        isTrending: data.isTrending ?? false,
        publishedAt: data.isActive ? new Date() : null,
      }
    })

    await logAuditAction({
      action: "CREATE",
      entity: "POST",
      entityId: post.id,
      details: `Tạo bài viết mới: ${data.title}`,
      metadata: { title: data.title, slug: data.slug }
    })

    revalidatePath("/admin/posts")
    revalidatePath("/tin-tuc")
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
      isFeatured: data.isFeatured,
      isTrending: data.isTrending,
    }

    if (data.isActive && !data.wasActive) {
      updateData.publishedAt = new Date()
    }

    const post = await prisma.post.update({
      where: { id },
      data: updateData
    })

    await logAuditAction({
      action: "UPDATE",
      entity: "POST",
      entityId: id,
      details: `Cập nhật bài viết: ${data.title}`,
      metadata: { title: data.title, slug: data.slug }
    })

    revalidatePath("/admin/posts")
    revalidatePath("/tin-tuc")
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

    await logAuditAction({
      action: "STATUS_CHANGE",
      entity: "POST",
      entityId: id,
      details: `Thay đổi trạng thái bài viết ID #${id} thành ${!currentActiveStatus ? 'Xuất bản' : 'Nháp'}`
    })

    revalidatePath("/admin/posts")
    revalidatePath("/tin-tuc")
    return { success: true, data: post }
  } catch (error) {
    console.error("Error toggling post status:", error)
    return { error: "Lỗi hệ thống. Không thể thay đổi trạng thái." }
  }
}

export async function togglePostFeatured(id: string, currentFeaturedStatus: boolean) {
  try {
    const post = await prisma.post.update({
      where: { id },
      data: {
        isFeatured: !currentFeaturedStatus,
      }
    })
    revalidatePath("/admin/posts")
    revalidatePath("/tin-tuc")
    return { success: true, data: post }
  } catch (error) {
    console.error("Error toggling post featured status:", error)
    return { error: "Lỗi hệ thống. Không thể thay đổi trạng thái Nổi bật." }
  }
}

export async function togglePostTrending(id: string, currentTrendingStatus: boolean) {
  try {
    const post = await prisma.post.update({
      where: { id },
      data: {
        isTrending: !currentTrendingStatus,
      }
    })
    revalidatePath("/admin/posts")
    revalidatePath("/tin-tuc")
    return { success: true, data: post }
  } catch (error) {
    console.error("Error toggling post trending status:", error)
    return { error: "Lỗi hệ thống. Không thể thay đổi trạng thái Xu hướng." }
  }
}

export async function deletePost(id: string) {
  try {
    await prisma.post.delete({
      where: { id }
    })

    await logAuditAction({
      action: "DELETE",
      entity: "POST",
      entityId: id,
      details: `Xóa bài viết ID #${id}`
    })

    revalidatePath("/admin/posts")
    return { success: true }
  } catch (error) {
    console.error("Error deleting post:", error)
    return { error: "Lỗi hệ thống. Không thể xóa bài viết." }
  }
}
