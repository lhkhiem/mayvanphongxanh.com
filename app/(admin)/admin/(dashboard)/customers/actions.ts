"use server"

import { prisma } from "@/lib/db"

export async function getCustomers({
  search,
  page = 1,
  pageSize = 20,
}: {
  search?: string
  page?: number
  pageSize?: number
}) {
  try {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [total, data] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: {
            select: { orders: true, warranties: true },
          },
        },
      }),
    ])

    return {
      data,
      total,
      totalPages: Math.ceil(total / pageSize),
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khách hàng:", error)
    return { error: "Không thể lấy danh sách khách hàng." }
  }
}
