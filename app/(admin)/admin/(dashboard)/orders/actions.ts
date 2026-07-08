"use server"

import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"

const ORDER_PAGE_SIZE_MAX = 100

export type OrderListParams = {
  search?: string
  status?: OrderStatus | "all"
  paymentStatus?: PaymentStatus | "all"
  page?: number
  pageSize?: number
}

export async function getOrders(params?: OrderListParams) {
  try {
    const page = Math.max(1, params?.page || 1)
    const pageSize = Math.min(ORDER_PAGE_SIZE_MAX, Math.max(1, params?.pageSize || 20))
    const skip = (page - 1) * pageSize
    const search = params?.search?.trim()

    const where: Prisma.OrderWhereInput = {
      ...(params?.status && params.status !== "all" ? { status: params.status } : {}),
      ...(params?.paymentStatus && params.paymentStatus !== "all" ? { paymentStatus: params.paymentStatus } : {}),
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
      ]
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          customerName: true,
          customerPhone: true,
          customerEmail: true,
          shippingAddress: true,
          subTotal: true,
          shippingFee: true,
          discount: true,
          totalAmount: true,
          status: true,
          paymentMethod: true,
          paymentStatus: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          items: {
            orderBy: { id: "asc" },
            select: {
              id: true,
              productName: true,
              variantName: true,
              sku: true,
              price: true,
              quantity: true,
              customOptions: true,
              variant: {
                select: {
                  product: {
                    select: {
                      productType: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ])

    return {
      data: orders,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      page,
      pageSize,
    }
  } catch (error) {
    console.error("getOrders error:", error)
    return { error: "Không thể tải danh sách đơn hàng." }
  }
}

export async function getOrderStats() {
  try {
    const [total, pending, processing, unpaid, paidRevenue] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "PROCESSING" } }),
      prisma.order.count({ where: { paymentStatus: "UNPAID" } }),
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { totalAmount: true },
      }),
    ])

    return {
      data: {
        total,
        pending,
        processing,
        unpaid,
        paidRevenue: paidRevenue._sum.totalAmount || 0,
      },
    }
  } catch (error) {
    console.error("getOrderStats error:", error)
    return { error: "Không thể tải thống kê đơn hàng." }
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true
              }
            }
          }
        }
      }
    })

    // Nếu đơn hàng chuyển sang trạng thái đã giao, kiểm tra và tạo record Máy Thuê
    if (status === "DELIVERED") {
      const rentalItems = updatedOrder.items.filter(
        (item) => item.variant?.product?.productType === "rental"
      )

      for (const item of rentalItems) {
        const existingRentalsCount = await prisma.rentalMachine.count({
          where: { orderItemId: item.id },
        })

        const quantityToCreate = item.quantity - existingRentalsCount

        if (quantityToCreate > 0) {
          const newRentals = Array.from({ length: quantityToCreate }).map(() => ({
            orderId: updatedOrder.id,
            orderItemId: item.id,
            productId: item.variant!.productId,
            productName: item.productName,
            sku: item.sku,
            customerName: updatedOrder.customerName,
            customerPhone: updatedOrder.customerPhone,
            customerEmail: updatedOrder.customerEmail,
            customerAddress: updatedOrder.shippingAddress,
            status: "ACTIVE" as const,
          }))

          await prisma.rentalMachine.createMany({
            data: newRentals,
          })
        }
      }
    }

    revalidatePath("/admin/orders")
    revalidatePath("/admin/rentals")
    return { success: true }
  } catch (error) {
    console.error("updateOrderStatus error:", error)
    return { error: "Không thể cập nhật trạng thái đơn hàng." }
  }
}

export async function updateOrderPaymentStatus(id: string, paymentStatus: PaymentStatus) {
  try {
    await prisma.order.update({
      where: { id },
      data: { paymentStatus },
    })
    revalidatePath("/admin/orders")
    return { success: true }
  } catch (error) {
    console.error("updateOrderPaymentStatus error:", error)
    return { error: "Không thể cập nhật trạng thái thanh toán." }
  }
}