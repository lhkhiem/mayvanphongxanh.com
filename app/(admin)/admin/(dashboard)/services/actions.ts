"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

export async function getServices(filter?: 'all' | 'published' | 'drafts') {
  try {
    let whereClause = {}
    if (filter === 'published') {
      whereClause = { isActive: true }
    } else if (filter === 'drafts') {
      whereClause = { isActive: false }
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      orderBy: { order: 'asc' },
    })
    return { data: services }
  } catch (error) {
    console.error("Error fetching services:", error)
    return { error: "Không thể tải danh sách dịch vụ." }
  }
}

export async function getService(id: number) {
  try {
    const service = await prisma.service.findUnique({
      where: { id },
    })
    return { data: service }
  } catch (error) {
    console.error("Error fetching service:", error)
    return { error: "Không thể tải dịch vụ." }
  }
}

export async function createService(data: any) {
  try {
    const service = await prisma.service.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        image: data.image,
        icon: data.icon,
        order: data.order ? parseInt(data.order) : 0,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        isActive: data.isActive,
      }
    })
    revalidatePath("/admin/services")
    return { success: true, data: service }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { error: "Slug đã tồn tại. Vui lòng chọn slug khác." }
      }
    }
    console.error("Error creating service:", error)
    return { error: "Lỗi hệ thống. Không thể tạo dịch vụ." }
  }
}

export async function updateService(id: number, data: any) {
  try {
    const updateData: any = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      image: data.image,
      icon: data.icon,
      order: data.order ? parseInt(data.order) : 0,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      isActive: data.isActive,
    }

    const service = await prisma.service.update({
      where: { id },
      data: updateData
    })
    revalidatePath("/admin/services")
    return { success: true, data: service }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { error: "Slug đã tồn tại. Vui lòng chọn slug khác." }
      }
    }
    console.error("Error updating service:", error)
    return { error: "Lỗi hệ thống. Không thể cập nhật dịch vụ." }
  }
}

export async function toggleServiceActive(id: number, currentActiveStatus: boolean) {
  try {
    const service = await prisma.service.update({
      where: { id },
      data: {
        isActive: !currentActiveStatus
      }
    })
    revalidatePath("/admin/services")
    return { success: true, data: service }
  } catch (error) {
    console.error("Error toggling service status:", error)
    return { error: "Lỗi hệ thống. Không thể thay đổi trạng thái." }
  }
}

export async function deleteService(id: number) {
  try {
    await prisma.service.delete({
      where: { id }
    })
    revalidatePath("/admin/services")
    return { success: true }
  } catch (error) {
    console.error("Error deleting service:", error)
    return { error: "Lỗi hệ thống. Không thể xóa dịch vụ." }
  }
}
