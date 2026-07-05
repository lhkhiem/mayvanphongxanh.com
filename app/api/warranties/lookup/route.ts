import { NextRequest, NextResponse } from 'next/server'
import { WarrantyStatus } from '@prisma/client'
import { prisma } from '@/lib/db'

const STATUS_LABELS: Record<WarrantyStatus, string> = {
  ACTIVE: 'Còn bảo hành',
  EXPIRED: 'Hết hạn bảo hành',
  VOIDED: 'Phiếu bảo hành đã hủy',
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  ACTIVATED: 'Kích hoạt bảo hành',
  REPAIR_RECEIVED: 'Tiếp nhận bảo hành/sửa chữa',
  REPAIRING: 'Đang xử lý',
  REPAIRED: 'Đã xử lý xong',
  RETURNED: 'Đã trả máy',
  NOTE: 'Ghi chú',
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

function getEffectiveStatus(status: WarrantyStatus, expiresAt: Date) {
  if (status === 'ACTIVE' && expiresAt.getTime() < Date.now()) return 'EXPIRED' as WarrantyStatus
  return status
}

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('query')?.trim()

    if (!query || query.length < 4) {
      return NextResponse.json({ error: 'Vui lòng nhập serial, số điện thoại hoặc email hợp lệ.' }, { status: 400 })
    }

    const normalizedSerial = query.toUpperCase()
    const record = await prisma.warrantyRecord.findFirst({
      where: {
        OR: [
          { serialNumber: { equals: normalizedSerial, mode: 'insensitive' } },
          { customerPhone: query },
          { customerEmail: { equals: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        events: { orderBy: { eventDate: 'desc' } },
      },
    })

    if (!record) {
      return NextResponse.json({ error: 'Không tìm thấy thông tin bảo hành phù hợp.' }, { status: 404 })
    }

    const effectiveStatus = getEffectiveStatus(record.status, record.expiresAt)
    const maskedEmail = maskEmail(record.customerEmail)

    return NextResponse.json({
      data: {
        id: record.id,
        serialNumber: record.serialNumber,
        productName: record.productName,
        sku: record.sku,
        purchaseDate: record.purchaseDate.toISOString(),
        expiresAt: record.expiresAt.toISOString(),
        warrantyMonths: record.warrantyMonths,
        status: effectiveStatus,
        statusLabel: STATUS_LABELS[effectiveStatus],
        customerInfo: `${record.customerName} - ${maskPhone(record.customerPhone)}${maskedEmail ? ` - ${maskedEmail}` : ''}`,
        history: record.events.map((event) => ({
          id: event.id,
          type: event.type,
          typeLabel: EVENT_TYPE_LABELS[event.type] || 'Cập nhật',
          title: event.title,
          note: event.note,
          eventDate: event.eventDate.toISOString(),
        })),
      },
    })
  } catch (error) {
    console.error('Warranty lookup error:', error)
    return NextResponse.json({ error: 'Không thể tra cứu bảo hành.' }, { status: 500 })
  }
}