import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProductsClient from '@/app/(public)/san-pham/ProductsClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  
  if (!category) {
    return { title: 'Không tìm thấy danh mục' };
  }
  
  return {
    title: `${category.name} | Máy Văn Phòng Xanh`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const category = await prisma.category.findUnique({ where: { slug } });
  
  if (!category) {
    notFound();
  }

  // Fetch all active products so the user can still use the category filter sidebar to switch
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true, deletedAt: null },
    include: { category: true, variants: true }
  });

  const products = dbProducts.map(p => {
    const defaultVariant = p.variants[0];
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category?.name || 'Chưa phân loại',
      brand: p.brand || 'HP',
      price: defaultVariant?.price || 0,
      originalPrice: defaultVariant?.originalPrice,
      rating: 5,
      reviews: 120,
      image: (p.images as string[])?.[0] || (defaultVariant?.images as string[])?.[0] || '/placeholder.jpg',
      stock: defaultVariant?.stockQuantity || 0,
      description: p.description,
      productType: p.productType,
      attributes: defaultVariant?.attributes,
      variants: p.variants,
      customOptions: p.customOptions
    };
  });

  // Render the same generic products view but pre-filter by the current category
  return <ProductsClient products={products} initialCategory={category.name} />;
}
