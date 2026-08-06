import { NextResponse } from 'next/server'
import { Prisma, PaymentMethod } from '@prisma/client'
import { prisma } from '@/lib/db'
import { sendOrderNotification } from '@/lib/mailer'
import { logAuditAction } from '@/lib/audit-logger'

type OrderRequestItem = {
  id?: number
  variantId?: string
  quantity?: number
  customOptions?: unknown
}

const VN_PHONE_REGEX = /^(0[35789])\d{8}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function normalizeQuantity(value: unknown) {
  const quantity = Number(value)
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) return null
  return quantity
}

function stableJson(value: unknown) {
  if (!value || typeof value !== 'object') return ''
  return JSON.stringify(value, Object.keys(value as Record<string, unknown>).sort())
}

function resolveCustomOptions(customOptions: unknown, productCustomOptions: unknown) {
  if (!customOptions || typeof customOptions !== 'object') {
    return { extraAmount: 0, snapshot: Prisma.JsonNull }
  }

  const selected = customOptions as Record<string, unknown>
  const groups = Array.isArray(productCustomOptions) ? productCustomOptions as any[] : []
  const snapshot: Array<{ group: string; choiceId: string; choiceName: string; priceModifier: number }> = []
  let extraAmount = 0

  for (const [groupName, selectedChoiceId] of Object.entries(selected)) {
    const choiceId = String(selectedChoiceId)
    const group = groups.find((entry) => entry?.name === groupName)
    const choices = Array.isArray(group?.choices) ? group.choices : []
    const choice = choices.find((entry: any) => String(entry?.id) === choiceId)

    if (!choice) {
      throw new Error(`Tùy chọn không hợp lệ: ${groupName}`)
    }

    const priceModifier = Number(choice.priceModifier ?? choice.price ?? 0)
    if (!Number.isFinite(priceModifier) || priceModifier < 0) {
      throw new Error(`Giá tùy chọn không hợp lệ: ${groupName}`)
    }

    extraAmount += priceModifier
    snapshot.push({
      group: groupName,
      choiceId,
      choiceName: String(choice.name ?? choiceId),
      priceModifier,
    })
  }

  return {
    extraAmount,
    snapshot: snapshot.length > 0 ? snapshot : Prisma.JsonNull,
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const customerName = cleanText(body.customerName, 120)
    const rawPhone = cleanText(body.customerPhone, 32)
    const customerPhone = rawPhone.replace(/[\s\-\.]/g, '')
    const customerEmail = cleanText(body.customerEmail, 160) || null
    const shippingAddress = cleanText(body.shippingAddress, 500)
    const notes = cleanText(body.notes, 1000) || null
    const paymentMethod: PaymentMethod = body.payment === 'transfer' ? 'BANK_TRANSFER' : 'COD'
    const rawItems = Array.isArray(body.items) ? body.items as OrderRequestItem[] : []

    if (!customerName || !customerPhone || !shippingAddress || rawItems.length === 0) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin bắt buộc.' }, { status: 400 })
    }

    if (!VN_PHONE_REGEX.test(customerPhone)) {
      return NextResponse.json({
        error: 'Số điện thoại không hợp lệ. Số điện thoại phải gồm 10 chữ số tại Việt Nam (bắt đầu bằng 03, 05, 07, 08, 09).'
      }, { status: 400 })
    }

    if (customerEmail && !EMAIL_REGEX.test(customerEmail)) {
      return NextResponse.json({
        error: 'Email không đúng định dạng (ví dụ: example@gmail.com).'
      }, { status: 400 })
    }

    const normalizedItems = rawItems.map((item) => {
      const quantity = normalizeQuantity(item.quantity)
      if (!quantity) throw new Error('Số lượng sản phẩm không hợp lệ.')
      if (!item.variantId && !item.id) throw new Error('Sản phẩm trong giỏ hàng không hợp lệ.')

      return {
        productId: item.id ? Number(item.id) : undefined,
        variantId: item.variantId,
        quantity,
        customOptions: item.customOptions,
      }
    })

    const order = await prisma.$transaction(async (tx) => {
      const orderItems: Prisma.OrderItemCreateWithoutOrderInput[] = []
      const seen = new Set<string>()

      for (const item of normalizedItems) {
        const variant = item.variantId
          ? await tx.productVariant.findFirst({
              where: {
                id: item.variantId,
                product: { isActive: true, deletedAt: null },
              },
              include: { product: true },
            })
          : await tx.productVariant.findFirst({
              where: {
                productId: item.productId,
                product: { isActive: true, deletedAt: null },
              },
              include: { product: true },
              orderBy: { price: 'asc' },
            })

        if (!variant) {
          throw new Error('Sản phẩm không tồn tại hoặc đã ngừng bán.')
        }

        const uniqueKey = `${variant.id}:${stableJson(item.customOptions)}`
        if (seen.has(uniqueKey)) {
          throw new Error('Giỏ hàng có sản phẩm bị trùng. Vui lòng cập nhật lại giỏ hàng.')
        }
        seen.add(uniqueKey)

        const stockUpdate = await tx.productVariant.updateMany({
          where: {
            id: variant.id,
            stockQuantity: { gte: item.quantity },
          },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        })

        if (stockUpdate.count !== 1) {
          throw new Error(`Sản phẩm "${variant.product.name}" không đủ tồn kho.`)
        }

        const customOptionResult = resolveCustomOptions(item.customOptions, variant.product.customOptions)
        const unitPrice = variant.price + customOptionResult.extraAmount

        orderItems.push({
          variant: { connect: { id: variant.id } },
          productName: variant.product.name,
          variantName: variant.name || 'Mặc định',
          sku: variant.sku,
          price: unitPrice,
          quantity: item.quantity,
          customOptions: customOptionResult.snapshot,
        })
      }

      const subTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const shippingFee = 0
      const discount = 0
      const totalAmount = subTotal + shippingFee - discount

      // Deduplication: Tìm hoặc tạo Customer
      let customer = await tx.customer.findUnique({
        where: { phone: customerPhone },
      })

      if (!customer && customerEmail) {
        customer = await tx.customer.findUnique({
          where: { email: customerEmail },
        })
      }

      if (customer) {
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: {
            name: customerName,
            address: shippingAddress,
            ...(customerEmail && !customer.email ? { email: customerEmail } : {}),
          },
        })
      } else {
        customer = await tx.customer.create({
          data: {
            name: customerName,
            phone: customerPhone,
            email: customerEmail,
            address: shippingAddress,
          },
        })
      }

      return tx.order.create({
        data: {
          customerName,
          customerPhone,
          customerEmail,
          shippingAddress,
          customerId: customer.id,
          notes,
          subTotal,
          shippingFee,
          discount,
          totalAmount,
          paymentMethod,
          paymentStatus: 'UNPAID',
          items: { create: orderItems },
        },
        include: { items: true },
      })
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })

    await logAuditAction({
      action: "CREATE",
      entity: "ORDER",
      entityId: order.id,
      details: `Đặt đơn hàng mới #${order.id.slice(0, 8)} (${order.customerName} - ${order.customerPhone}) - Tổng: ${order.totalAmount.toLocaleString('vi-VN')}đ`,
      metadata: { orderId: order.id, totalAmount: order.totalAmount, customerPhone: order.customerPhone }
    })

    // Gửi email thông báo cho Khách hàng & Admin
    sendOrderNotification({
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      shippingAddress: order.shippingAddress,
      notes: order.notes,
      paymentMethod: order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng (COD)',
      totalAmount: order.totalAmount,
      subTotal: order.subTotal,
      items: order.items.map((i) => ({
        productName: i.productName,
        variantName: i.variantName,
        sku: i.sku,
        price: i.price,
        quantity: i.quantity,
        customOptions: i.customOptions,
      })),
      createdAt: order.createdAt,
    }).catch((err) => {
      console.error('Lỗi không gửi được mail thông báo đơn hàng:', err)
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      totalAmount: order.totalAmount,
      message: 'Đặt hàng thành công!',
    })
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error)
    const message = error instanceof Error ? error.message : 'Không thể tạo đơn hàng.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

