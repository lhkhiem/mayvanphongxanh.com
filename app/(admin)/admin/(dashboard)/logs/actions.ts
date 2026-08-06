"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"
import { logAuditAction } from "@/lib/audit-logger"

const LOG_PAGE_SIZE_MAX = 100

export type AuditLogListParams = {
  search?: string
  action?: string | "all"
  entity?: string | "all"
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export async function getAuditLogs(params?: AuditLogListParams) {
  try {
    const page = Math.max(1, params?.page || 1)
    const pageSize = Math.min(LOG_PAGE_SIZE_MAX, Math.max(1, params?.pageSize || 20))
    const skip = (page - 1) * pageSize
    const search = params?.search?.trim()

    const where: Prisma.AuditLogWhereInput = {
      ...(params?.action && params.action !== "all" ? { action: params.action } : {}),
      ...(params?.entity && params.entity !== "all" ? { entity: params.entity } : {}),
    }

    if (params?.dateFrom || params?.dateTo) {
      where.createdAt = {}
      if (params.dateFrom) {
        where.createdAt.gte = new Date(params.dateFrom)
      }
      if (params.dateTo) {
        const toDate = new Date(params.dateTo)
        toDate.setHours(23, 59, 59, 999)
        where.createdAt.lte = toDate
      }
    }

    if (search) {
      where.OR = [
        { userName: { contains: search, mode: "insensitive" } },
        { userEmail: { contains: search, mode: "insensitive" } },
        { details: { contains: search, mode: "insensitive" } },
        { entityId: { contains: search, mode: "insensitive" } },
        { action: { contains: search, mode: "insensitive" } },
        { entity: { contains: search, mode: "insensitive" } },
      ]
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
    ])

    return {
      data: logs,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      page,
      pageSize,
    }
  } catch (error) {
    console.error("getAuditLogs error:", error)
    return { error: "Không thể tải danh sách nhật ký hoạt động." }
  }
}

export async function getAuditLogStats() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalLogs, todayLogs, todayLogins, todayModifications, todayFailures] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.auditLog.count({
        where: {
          createdAt: { gte: today },
          action: "LOGIN",
        },
      }),
      prisma.auditLog.count({
        where: {
          createdAt: { gte: today },
          action: { in: ["CREATE", "UPDATE", "DELETE", "STATUS_CHANGE"] },
        },
      }),
      prisma.auditLog.count({
        where: {
          createdAt: { gte: today },
          action: { contains: "FAILED" },
        },
      }),
    ])

    return {
      data: {
        totalLogs,
        todayLogs,
        todayLogins,
        todayModifications,
        todayFailures,
      },
    }
  } catch (error) {
    console.error("getAuditLogStats error:", error)
    return { error: "Không thể tải thống kê nhật ký." }
  }
}

export async function clearOldAuditLogs(days: number) {
  try {
    if (days < 7) {
      return { error: "Chỉ được phép xóa các bản ghi log cũ hơn ít nhất 7 ngày." }
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const deleted = await prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    })

    await logAuditAction({
      action: "DELETE",
      entity: "SETTING",
      details: `Đã dọn dẹp ${deleted.count} bản ghi nhật ký hoạt động cũ hơn ${days} ngày`,
      metadata: { deletedCount: deleted.count, daysCutoff: days }
    })

    revalidatePath("/admin/logs")
    return { success: true, count: deleted.count }
  } catch (error) {
    console.error("clearOldAuditLogs error:", error)
    return { error: "Lỗi hệ thống khi dọn dẹp nhật ký." }
  }
}
