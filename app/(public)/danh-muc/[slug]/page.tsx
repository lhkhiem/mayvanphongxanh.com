import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProductsClient from '@/app/(public)/san-pham/ProductsClient';
import { cleanUrl } from '@/lib/utils';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findFirst({ where: { slug, isActive: true } });
  
  if (!category) {
    return { title: 'Không tìm thấy danh mục' };
  }
  
  return {
    title: `${category.name} | Máy Văn Phòng Xanh`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const category = await prisma.category.findFirst({ where: { slug, isActive: true } });
  
  if (!category) {
    notFound();
  }

  // Fetch all active products so the user can still use the category filter sidebar to switch
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: { category: true, brandRef: true, variants: true }
  });

  const products = dbProducts.map(p => {
    const defaultVariant = p.variants[0];
    const rawImgs = (p.images as string[] || []).map(cleanUrl).filter(Boolean);
    const rawVarImgs = (defaultVariant?.images as string[] || []).map(cleanUrl).filter(Boolean);
    const mainImg = rawImgs[0] || rawVarImgs[0] || '/placeholder.jpg';
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category?.name || 'Chưa phân loại',
      brand: p.brand || p.brandRef?.name || '',
      price: defaultVariant?.price || 0,
      originalPrice: defaultVariant?.originalPrice,
      rating: 0,
      reviews: 0,
      image: mainImg,
      stock: defaultVariant?.stockQuantity || 0,
      description: p.description,
      productType: p.productType,
      isContactPrice: p.isContactPrice,
      vatStatus: p.vatStatus || 'INCLUDED',
      attributes: defaultVariant?.attributes,
      variants: p.variants,
      customOptions: p.customOptions
    };
  });

  // Render the same generic products view but pre-filter by the current category
  return <ProductsClient products={products} initialCategory={category.name} />;
}
