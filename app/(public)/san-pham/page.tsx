import { prisma } from '@/lib/db';
import ProductsClient from './ProductsClient';

export const metadata = {
  title: 'Sản phẩm | Máy Văn Phòng Xanh',
  description: 'Danh sách các sản phẩm và giải pháp công nghệ tại Máy Văn Phòng Xanh.',
};

export default async function ProductsPage() {
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true, productType: { not: 'rental' }, deletedAt: null },
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
      reviews: 120, // Mock reviews since we don't have review model yet
      image: (p.images as string[])?.[0] || (defaultVariant?.images as string[])?.[0] || '/placeholder.jpg',
      stock: defaultVariant?.stockQuantity || 0,
      description: p.description,
      productType: p.productType,
      attributes: defaultVariant?.attributes,
      variants: p.variants,
      customOptions: p.customOptions
    };
  });

  return <ProductsClient products={products} />;
}
