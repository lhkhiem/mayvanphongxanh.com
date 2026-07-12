import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { idFromSlug } from '@/lib/utils';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = idFromSlug(slug);
  let dbProduct = null;
  
  if (!isNaN(id)) {
    dbProduct = await prisma.product.findFirst({ where: { id, deletedAt: null } });
  }
  
  if (!dbProduct) {
    dbProduct = await prisma.product.findFirst({ where: { slug, deletedAt: null } });
  }

  if (!dbProduct) {
    return {
      title: 'Không tìm thấy sản phẩm',
    };
  }
  
  return {
    title: `${dbProduct.name} | Máy Văn Phòng Xanh`,
    description: dbProduct.description,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = idFromSlug(slug);
  let dbProduct = null;

  if (!isNaN(id)) {
    dbProduct = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { category: true, variants: true, policies: true, consumables: { include: { category: true, variants: true } } }
    });
  }
  
  if (!dbProduct) {
    dbProduct = await prisma.product.findFirst({
      where: { slug, deletedAt: null },
      include: { category: true, variants: true, policies: true, consumables: { include: { category: true, variants: true } } }
    });
  }

  if (!dbProduct) {
    notFound();
  }

  const defaultVariant = dbProduct.variants[0];
  const product = {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    sku: dbProduct.sku,
    category: dbProduct.category?.name || 'Chưa phân loại',
    brand: dbProduct.brand || 'HP',
    price: defaultVariant?.price || 0,
    originalPrice: defaultVariant?.originalPrice,
    rating: 5,
    reviews: 120,
    image: (dbProduct.images as string[])?.[0] || (defaultVariant?.images as string[])?.[0] || '/placeholder.jpg',
    images: dbProduct.images as string[] || [],
    stock: defaultVariant?.stockQuantity || 0,
    description: dbProduct.description,
    productType: dbProduct.productType,
    attributes: defaultVariant?.attributes,
    variants: dbProduct.variants,
    customOptions: dbProduct.customOptions,
    quickSpecs: dbProduct.quickSpecs,
    specifications: dbProduct.specifications,
    manuals: dbProduct.manuals,
    drivers: dbProduct.drivers,
    policies: dbProduct.policies,
    rentalTerms: dbProduct.rentalTerms,
  };

  // Fetch related products
  const categoryId = dbProduct.categoryId;
  
  const [similarDb, sameBrandDb, relatedDb, consumablesDb] = await Promise.all([
    // Similar products (same category)
    prisma.product.findMany({
      where: { categoryId: categoryId, id: { not: dbProduct.id }, isActive: true, deletedAt: null },
      include: { category: true, variants: true },
      take: 4
    }),
    // Same brand
    prisma.product.findMany({
      where: { brand: dbProduct.brand, id: { not: dbProduct.id }, isActive: true, deletedAt: null },
      include: { category: true, variants: true },
      take: 4,
      orderBy: { id: 'desc' }
    }),
    // Related products (random or just some latest)
    prisma.product.findMany({
      where: { id: { not: dbProduct.id }, isActive: true, deletedAt: null },
      include: { category: true, variants: true },
      take: 4,
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const mapProducts = (list: any[]) => list.map(p => {
    const v = p.variants[0];
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category?.name || 'Khác',
      brand: p.brand,
      price: v?.price || 0,
      originalPrice: v?.originalPrice,
      rating: 5,
      reviews: 12,
      image: (v?.images as string[])?.[0] || '/placeholder.jpg',
      stock: v?.stockQuantity || 0,
    }
  });

  return (
    <ProductDetailClient 
      product={product} 
      similarProducts={mapProducts(similarDb)} 
      sameBrandProducts={mapProducts(sameBrandDb)} 
      relatedProducts={mapProducts(relatedDb)} 
      consumables={mapProducts(dbProduct.consumables || [])} 
    />
  );
}
