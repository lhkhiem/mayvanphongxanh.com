import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cleanUrl } from '@/lib/utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: true,
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 })
    }

    const defaultVariant = product.variants[0]
    const rawImgs = (product.images as string[] || []).map(cleanUrl).filter(Boolean);
    const rawVarImgs = (defaultVariant?.images as string[] || []).map(cleanUrl).filter(Boolean);
    const mainImg = rawImgs[0] || rawVarImgs[0] || '';

    // Map data
    const formattedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category.name,
      brand: product.brand,
      price: defaultVariant?.price || 0,
      originalPrice: defaultVariant?.originalPrice,
      rating: 5,
      reviews: 120,
      image: mainImg,
      stock: defaultVariant?.stockQuantity || 0,
      description: product.description,
      productType: product.productType,
      attributes: defaultVariant?.attributes,
      variants: product.variants,
      customOptions: product.customOptions
    }

    return NextResponse.json(formattedProduct)
  } catch (error) {
    console.error('Lỗi khi fetch chi tiết product:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
