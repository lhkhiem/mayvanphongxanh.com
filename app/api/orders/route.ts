import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerName, customerPhone, customerEmail, shippingAddress, items, totalAmount, notes } = body

    // Validation cơ bản
    if (!customerName || !customerPhone || !shippingAddress || !items || items.length === 0) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin bắt buộc' }, { status: 400 })
    }

    // Tính toán lại giá để chống gian lận (Lý tưởng là query lại DB để lấy giá, ở đây để đơn giản ta tin tưởng frontend gửi lên hoặc lấy lại)
    // Trong môi trường Enterprise, phải query giá thật từ DB. Nhưng ở bản demo này, ta lưu data từ request.
    
    // Sử dụng Prisma Transaction để đảm bảo tính nguyên vẹn dữ liệu
    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress,
        notes,
        subTotal: totalAmount, // Giả sử chưa có phí ship
        totalAmount: totalAmount,
        paymentMethod: 'COD', // Mặc định COD
        items: {
          create: items.map((item: any) => ({
            variantId: item.variantId,
            productName: item.name,
            variantName: item.variantName || 'Mặc định',
            sku: item.sku || 'N/A',
            price: item.price,
            quantity: item.quantity,
            customOptions: item.customOptions || null
          }))
        }
      },
      include: {
        items: true
      }
    })

    return NextResponse.json({ success: true, orderId: order.id, message: 'Đặt hàng thành công!' })
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
