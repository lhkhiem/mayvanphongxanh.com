import { NextRequest, NextResponse } from 'next/server'
import { OrderStatus, PaymentStatus } from '@prisma/client'
import { prisma } from '@/lib/db'

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Chờ xử lý',
  PROCESSING: 'Đang xử lý',
  SHIPPED: 'Đang giao hàng',
  DELIVERED: 'Giao hàng thành công',
  CANCELLED: 'Đã hủy',
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: 'Chưa thanh toán',
  PAID: 'Đã thanh toán',
  REFUNDED: 'Đã hoàn tiền',
}

function maskPhone(phone: string) {
  if (phone.length <= 6) return phone
  return `${phone.slice(0, 4)}***${phone.slice(-3)}`
}

function maskEmail(email: string | null) {
  if (!email) return null
  const [name, domain] = email.split('@')
  if (!domain) return email
  return `${name.slice(0, 2)}***@${domain}`
}

function buildTimeline(status: OrderStatus, paymentStatus: PaymentStatus, createdAt: Date, updatedAt: Date) {
  const created = createdAt.toISOString()
  const updated = updatedAt.toISOString()
  const paid = paymentStatus === 'PAID'

  return [
    { status: 'Đã đặt hàng', time: created, completed: true },
    { status: paid ? 'Đã xác nhận thanh toán' : 'Chờ thanh toán/COD', time: paid ? updated : created, completed: paid || paymentStatus === 'UNPAID' },
    { status: 'Đang xử lý đơn', time: status === 'PROCESSING' || status === 'SHIPPED' || status === 'DELIVERED' ? updated : null, completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status) },
    { status: 'Đang giao hàng', time: status === 'SHIPPED' || status === 'DELIVERED' ? updated : null, completed: ['SHIPPED', 'DELIVERED'].includes(status) },
    { status: status === 'CANCELLED' ? 'Đơn hàng đã hủy' : 'Giao hàng thành công', time: status === 'DELIVERED' || status === 'CANCELLED' ? updated : null, completed: status === 'DELIVERED' || status === 'CANCELLED' },
  ]
}

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('query')?.trim()

    if (!query || query.length < 4) {
      return NextResponse.json({ error: 'Vui lòng nhập mã đơn hàng, số điện thoại hoặc email hợp lệ.' }, { status: 400 })
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: { equals: query, mode: 'insensitive' } },
          { customerPhone: query },
          { customerEmail: { equals: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        totalAmount: true,
        status: true,
        paymentStatus: true,
        paymentMethod: true,
        createdAt: true,
        updatedAt: true,
        items: {
          orderBy: { id: 'asc' },
          select: {
            id: true,
            productName: true,
            variantName: true,
            sku: true,
            price: true,
            quantity: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng phù hợp.' }, { status: 404 })
    }

    return NextResponse.json({
      data: {
        id: order.id,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        status: order.status,
        statusLabel: ORDER_STATUS_LABELS[order.status],
        paymentStatus: order.paymentStatus,
        paymentStatusLabel: PAYMENT_STATUS_LABELS[order.paymentStatus],
        paymentMethod: order.paymentMethod,
        customerInfo: `${order.customerName} - ${maskPhone(order.customerPhone)}${maskEmail(order.customerEmail) ? ` - ${maskEmail(order.customerEmail)}` : ''}`,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: order.totalAmount,
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          variantName: item.variantName,
          sku: item.sku,
          price: item.price,
          quantity: item.quantity,
        })),
        timeline: buildTimeline(order.status, order.paymentStatus, order.createdAt, order.updatedAt),
      },
    })
  } catch (error) {
    console.error('Order lookup error:', error)
    return NextResponse.json({ error: 'Không thể tra cứu đơn hàng.' }, { status: 500 })
  }
}