import { prisma } from '@/lib/db';
import ProductsClient from './ProductsClient';
import { cleanUrl } from '@/lib/utils';

export const metadata = {
  title: 'Sản phẩm | Máy Văn Phòng Xanh',
  description: 'Danh sách các sản phẩm và giải pháp công nghệ tại Máy Văn Phòng Xanh.',
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  let categoryFilter = params.category;

  if (categoryFilter) {
    const matchedCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: categoryFilter },
          { name: categoryFilter }
        ]
      }
    });
    if (matchedCategory) {
      categoryFilter = matchedCategory.name;
    }
  }

  const [dbProducts, dbCategories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, productType: { not: 'rental' }, deletedAt: null },
      orderBy: [{ category: { order: 'asc' } }, { order: 'asc' }, { createdAt: 'desc' }],
      include: { category: { include: { parent: true } }, brandRef: true, variants: true }
    }),
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      include: {
        children: {
          where: { isActive: true },
          orderBy: [{ order: 'asc' }, { id: 'asc' }]
        }
      }
    })
  ]);

  const products = dbProducts.map(p => {
    const defaultVariant = p.variants[0];
    const rawImgs = (p.images as string[] || []).map(cleanUrl).filter(Boolean);
    const rawVarImgs = (defaultVariant?.images as string[] || []).map(cleanUrl).filter(Boolean);
    const mainImg = rawImgs[0] || rawVarImgs[0] || '/placeholder.jpg';
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      categoryId: p.categoryId,
      category: p.category?.name || 'Chưa phân loại',
      categorySlug: p.category?.slug,
      categoryParentId: p.category?.parentId,
      categoryParentName: p.category?.parent?.name,
      categoryOrder: p.category?.order ?? 0,
      order: p.order ?? 0,
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

  return <ProductsClient products={products} categories={dbCategories} initialCategory={categoryFilter} />;
}
