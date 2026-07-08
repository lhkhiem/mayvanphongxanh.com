"use server"

import { RentalStatus, Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"

const RENTAL_PAGE_SIZE_MAX = 100

export type RentalListParams = {
  search?: string
  status?: RentalStatus | "all"
  page?: number
  pageSize?: number
}

export async function getRentals(params?: RentalListParams) {
  try {
    const page = Math.max(1, params?.page || 1)
    const pageSize = Math.min(RENTAL_PAGE_SIZE_MAX, Math.max(1, params?.pageSize || 20))
    const skip = (page - 1) * pageSize
    const search = params?.search?.trim()

    const where: Prisma.RentalMachineWhereInput = {
      ...(params?.status && params.status !== "all" ? { status: params.status } : {}),
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
        { serialNumber: { contains: search, mode: "insensitive" } },
        { productName: { contains: search, mode: "insensitive" } },
      ]
    }

    const [total, rentals] = await Promise.all([
      prisma.rentalMachine.count({ where }),
      prisma.rentalMachine.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
    ])

    return {
      data: rentals,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      page,
      pageSize,
    }
  } catch (error) {
    console.error("getRentals error:", error)
    return { error: "Không thể tải danh sách máy thuê." }
  }
}

export async function updateRentalInfo(id: string, data: { serialNumber?: string, endDate?: Date | null, notes?: string, status?: RentalStatus }) {
  try {
    await prisma.rentalMachine.update({
      where: { id },
      data,
    })
    revalidatePath("/admin/rentals")
    return { success: true }
  } catch (error) {
    console.error("updateRentalInfo error:", error)
    return { error: "Không thể cập nhật thông tin máy thuê." }
  }
}

export async function deleteRental(id: string) {
  try {
    await prisma.rentalMachine.delete({
      where: { id }
    })
    revalidatePath("/admin/rentals")
    return { success: true }
  } catch(error) {
    console.error("deleteRental error:", error)
    return { error: "Không thể xóa máy thuê." }
  }
}
