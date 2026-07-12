import { prisma } from '@/lib/db';
import ProductsClient from '../san-pham/ProductsClient';

export const metadata = {
  title: 'Cho thuê máy | Máy Văn Phòng Xanh',
  description: 'Dịch vụ cho thuê máy văn phòng, máy in, máy photocopy trọn gói với giá tốt nhất.',
};

export default async function RentalPage() {
  const dbProducts = await prisma.product.findMany({
    where: { 
      isActive: true,
      deletedAt: null,
      productType: 'rental'
    },
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

  return (
    <ProductsClient products={products} />
  );
}
