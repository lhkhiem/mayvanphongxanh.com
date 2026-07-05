import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'

type OrderRequestItem = {
  id?: number
  variantId?: string
  quantity?: number
  customOptions?: unknown
}

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
    const customerPhone = cleanText(body.customerPhone, 32)
    const customerEmail = cleanText(body.customerEmail, 160) || null
    const shippingAddress = cleanText(body.shippingAddress, 500)
    const notes = cleanText(body.notes, 1000) || null
    const rawItems = Array.isArray(body.items) ? body.items as OrderRequestItem[] : []

    if (!customerName || !customerPhone || !shippingAddress || rawItems.length === 0) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin bắt buộc.' }, { status: 400 })
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

      return tx.order.create({
        data: {
          customerName,
          customerPhone,
          customerEmail,
          shippingAddress,
          notes,
          subTotal,
          shippingFee,
          discount,
          totalAmount,
          paymentMethod: 'COD',
          paymentStatus: 'UNPAID',
          items: { create: orderItems },
        },
        include: { items: true },
      })
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
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
