import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('category')
  const limit = searchParams.get('limit')
  const search = searchParams.get('search')
  const ids = searchParams.get('ids')

  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoryId ? { categoryId: parseInt(categoryId) } : {}),
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
        ...(ids ? { id: { in: ids.split(',').map(id => parseInt(id)) } } : {})
      },
      include: {
        category: true,
        variants: true, // Lấy luôn variant để có giá và hình ảnh
      },
      take: limit ? parseInt(limit) : undefined,
      orderBy: { id: 'desc' }
    })

    // Map lại data cho giống với UI hiện tại đang dùng (Product interface)
    const formattedProducts = products.map(p => {
      const defaultVariant = p.variants[0]
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category.name,
        brand: p.brand,
        price: defaultVariant?.price || 0,
        originalPrice: defaultVariant?.originalPrice,
        rating: 5, // Mock data
        reviews: 120, // Mock data
        image: (defaultVariant?.images as string[])?.[0] || '',
        stock: defaultVariant?.stockQuantity || 0,
        description: p.description,
        productType: p.productType,
        attributes: defaultVariant?.attributes,
        variants: p.variants,
        customOptions: p.customOptions
      }
    })

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error('Lỗi khi fetch products:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
