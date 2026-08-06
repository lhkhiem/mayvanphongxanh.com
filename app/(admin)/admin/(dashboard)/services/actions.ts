"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { logAuditAction } from "@/lib/audit-logger"

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

export async function normalizeServicesOrders() {
  try {
    const services = await prisma.service.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, order: true },
    })

    const updates = []
    for (let i = 0; i < services.length; i++) {
      if (services[i].order !== i) {
        updates.push(
          prisma.service.update({
            where: { id: services[i].id },
            data: { order: i },
          })
        )
      }
    }
    if (updates.length > 0) {
      await prisma.$transaction(updates)
    }
  } catch (err) {
    console.error("normalizeServicesOrders error:", err)
  }
}

export async function createService(data: any) {
  try {
    const targetOrder = data.order !== undefined && data.order !== '' ? parseInt(data.order) : 0

    await prisma.service.updateMany({
      where: {
        order: { gte: targetOrder },
      },
      data: {
        order: { increment: 1 },
      },
    })

    const service = await prisma.service.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        image: data.image,
        icon: data.icon,
        price: data.price ? parseFloat(data.price) : null,
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
        isContactPrice: data.isContactPrice ?? true,
        order: targetOrder,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        metaKeywords: data.metaKeywords || null,
        isSeoCustom: data.isSeoCustom ?? false,
        isActive: data.isActive,
      }
    })

    await normalizeServicesOrders()

    await logAuditAction({
      action: "CREATE",
      entity: "SERVICE",
      entityId: service.id,
      details: `Tạo dịch vụ mới: ${data.title}`,
      metadata: { title: data.title, slug: data.slug }
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
    const currentService = await prisma.service.findUnique({ where: { id }, select: { order: true } })
    const targetOrder = data.order !== undefined && data.order !== '' ? parseInt(data.order) : 0

    if (currentService && currentService.order !== targetOrder) {
      await prisma.service.updateMany({
        where: {
          id: { not: id },
          order: { gte: targetOrder },
        },
        data: {
          order: { increment: 1 },
        },
      })
    }

    const updateData: any = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      image: data.image,
      icon: data.icon,
      price: data.price !== undefined && data.price !== '' && data.price !== null ? parseFloat(data.price) : null,
      originalPrice: data.originalPrice !== undefined && data.originalPrice !== '' && data.originalPrice !== null ? parseFloat(data.originalPrice) : null,
      isContactPrice: data.isContactPrice ?? true,
      order: targetOrder,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      metaKeywords: data.metaKeywords || null,
      isSeoCustom: data.isSeoCustom ?? false,
      isActive: data.isActive,
    }

    const service = await prisma.service.update({
      where: { id },
      data: updateData
    })

    await normalizeServicesOrders()

    await logAuditAction({
      action: "UPDATE",
      entity: "SERVICE",
      entityId: id,
      details: `Cập nhật dịch vụ: ${data.title}`,
      metadata: { title: data.title, slug: data.slug }
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

    await logAuditAction({
      action: "STATUS_CHANGE",
      entity: "SERVICE",
      entityId: id,
      details: `Thay đổi trạng thái dịch vụ ID #${id} thành ${!currentActiveStatus ? 'Hoạt động' : 'Ẩn'}`
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
    await normalizeServicesOrders()

    await logAuditAction({
      action: "DELETE",
      entity: "SERVICE",
      entityId: id,
      details: `Xóa dịch vụ ID #${id}`
    })

    revalidatePath("/admin/services")
    return { success: true }
  } catch (error) {
    console.error("Error deleting service:", error)
    return { error: "Lỗi hệ thống. Không thể xóa dịch vụ." }
  }
}

export async function duplicateService(id: number) {
  try {
    const source = await prisma.service.findUnique({
      where: { id },
    })
    if (!source) return { error: "Dịch vụ gốc không tồn tại." }

    const targetOrder = source.order + 1

    await prisma.service.updateMany({
      where: {
        order: { gte: targetOrder },
      },
      data: {
        order: { increment: 1 },
      },
    })

    const timestamp = Date.now().toString().slice(-4)
    const newTitle = `${source.title} (Bản sao)`
    const newSlug = `${source.slug}-copy-${timestamp}`

    const newService = await prisma.service.create({
      data: {
        title: newTitle,
        slug: newSlug,
        excerpt: source.excerpt,
        content: source.content,
        image: source.image,
        icon: source.icon,
        price: source.price,
        originalPrice: source.originalPrice,
        isContactPrice: source.isContactPrice,
        order: targetOrder,
        metaTitle: source.metaTitle ? `${source.metaTitle} (Bản sao)` : null,
        metaDescription: source.metaDescription,
        isActive: source.isActive,
      },
    })

    await normalizeServicesOrders()

    await logAuditAction({
      action: "CREATE",
      entity: "SERVICE",
      entityId: newService.id,
      details: `Nhân bản dịch vụ: ${newTitle}`
    })

    revalidatePath("/admin/services")
    return { success: true, data: newService }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { error: "Slug dịch vụ đã tồn tại. Không thể tạo bản sao." }
    }
    console.error("Error duplicating service:", error)
    return { error: "Lỗi hệ thống. Không thể sao chép dịch vụ." }
  }
}
