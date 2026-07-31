import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cleanUrl } from '@/lib/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('category')
  const categoryName = searchParams.get('categoryName')
  const limit = searchParams.get('limit')
  const search = searchParams.get('search')
  const ids = searchParams.get('ids')

  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        ...(categoryId ? { categoryId: parseInt(categoryId) } : {}),
        ...(categoryName ? { category: { name: categoryName } } : {}),
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
            { brandRef: { name: { contains: search, mode: 'insensitive' } } },
            { variants: { some: { sku: { contains: search, mode: 'insensitive' } } } }
          ]
        } : {}),
        ...(ids ? { id: { in: ids.split(',').map(id => parseInt(id)).filter(n => !isNaN(n)) } } : {})
      },
      include: {
        category: true,
        brandRef: true,
        variants: true,
      },
      take: limit ? parseInt(limit) : undefined,
      orderBy: [{ category: { order: 'asc' } }, { order: 'asc' }, { id: 'desc' }]
    })

    // Map lại data cho giống với UI hiện tại đang dùng (Product interface)
    const formattedProducts = products.map(p => {
      const defaultVariant = p.variants[0]
      const rawImgs = (p.images as string[] || []).map(cleanUrl).filter(Boolean);
      const rawVarImgs = (defaultVariant?.images as string[] || []).map(cleanUrl).filter(Boolean);
      const mainImg = rawImgs[0] || rawVarImgs[0] || '/placeholder.jpg';

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category?.name || 'Khác',
        brand: p.brand || p.brandRef?.name || '',
        price: defaultVariant?.price || 0,
        originalPrice: defaultVariant?.originalPrice,
        rating: 0,
        reviews: 0,
        image: mainImg,
        images: rawImgs.length > 0 ? rawImgs : [mainImg],
        stock: defaultVariant?.stockQuantity || 0,
        sku: defaultVariant?.sku || '',
        description: p.description,
        productType: p.productType,
        isContactPrice: p.isContactPrice,
        vatStatus: p.vatStatus || 'INCLUDED',
        attributes: defaultVariant?.attributes,
        variants: p.variants,
        customOptions: p.customOptions,
        quickSpecs: p.quickSpecs,
        specifications: p.specifications,
        manuals: p.manuals,
        drivers: p.drivers,
        rentalTerms: p.rentalTerms
      }
    })

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error('Lỗi khi fetch products:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
