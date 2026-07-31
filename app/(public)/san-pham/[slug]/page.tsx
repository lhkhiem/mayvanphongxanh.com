import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { idFromSlug, cleanUrl } from '@/lib/utils';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = idFromSlug(slug);
  let dbProduct = null;
  
  if (!isNaN(id)) {
    dbProduct = await prisma.product.findFirst({ where: { id, deletedAt: null, isActive: true }, include: { variants: true } });
  }
  
  if (!dbProduct) {
    dbProduct = await prisma.product.findFirst({ where: { slug, deletedAt: null, isActive: true }, include: { variants: true } });
  }

  if (!dbProduct) {
    return {
      title: 'Không tìm thấy sản phẩm',
    };
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mayvanphongxanh.com';
  const title = `${dbProduct.name} | Máy Văn Phòng Xanh`;
  const rawDesc = dbProduct.description ? dbProduct.description.replace(/<[^>]+>/g, '').trim() : '';
  const description = rawDesc.slice(0, 160) || `Mua ${dbProduct.name} chính hãng giá tốt nhất tại Máy Văn Phòng Xanh.`;
  
  const rawImages = (dbProduct.images as string[] || []).map(cleanUrl).filter(Boolean);
  const variantImgs = (dbProduct.variants || []).flatMap(v => (v.images as string[] || []).map(cleanUrl).filter(Boolean));
  let imageRel = rawImages[0] || variantImgs[0] || '/placeholder.jpg';
  
  const absoluteImageUrl = imageRel.startsWith('http://') || imageRel.startsWith('https://')
    ? imageRel
    : `${baseUrl}${imageRel.startsWith('/') ? '' : '/'}${imageRel}`;

  const pageUrl = `${baseUrl}/san-pham/${dbProduct.slug || slug}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Máy Văn Phòng Xanh',
      type: 'website',
      images: [
        {
          url: absoluteImageUrl,
          width: 800,
          height: 600,
          alt: dbProduct.name,
        },
      ],
      locale: 'vi_VN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteImageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = idFromSlug(slug);
  let dbProduct = null;

  const productInclude = {
    category: true,
    brandRef: true,
    variants: true,
    policies: true,
    consumables: {
      where: { isActive: true, deletedAt: null },
      include: {
        category: true,
        brandRef: true,
        variants: true
      }
    }
  };

  if (!isNaN(id)) {
    dbProduct = await prisma.product.findFirst({
      where: { id, deletedAt: null, isActive: true },
      include: productInclude
    });
  }
  
  if (!dbProduct) {
    dbProduct = await prisma.product.findFirst({
      where: { slug, deletedAt: null, isActive: true },
      include: productInclude
    });
  }

  if (!dbProduct) {
    notFound();
  }

  const defaultVariant = dbProduct.variants[0];
  const brandName = dbProduct.brand || dbProduct.brandRef?.name || '';

  // Extract and clean images from product & variants
  const rawProductImages = (dbProduct.images as string[] || []).map(cleanUrl).filter(Boolean);
  const rawVariantImages = (dbProduct.variants || []).flatMap(v => 
    (v.images as string[] || []).map(cleanUrl).filter(Boolean)
  );

  // Main image priority: first product image -> first variant image -> placeholder
  const mainImage = rawProductImages[0] || rawVariantImages[0] || '/placeholder.jpg';
  
  // All combined deduplicated images
  const allImages = Array.from(new Set([...rawProductImages, ...rawVariantImages, mainImage].filter(Boolean)));

  const product = {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    sku: defaultVariant?.sku || '',
    category: dbProduct.category?.name || 'Chưa phân loại',
    categorySlug: dbProduct.category?.slug || '',
    brand: brandName,
    price: defaultVariant?.price || 0,
    originalPrice: defaultVariant?.originalPrice,
    rating: 5,
    reviews: 120,
    image: mainImage,
    images: allImages,
    stock: defaultVariant?.stockQuantity || 0,
    description: dbProduct.description,
    productType: dbProduct.productType,
    isContactPrice: dbProduct.isContactPrice,
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

  // Build brand query condition
  const brandWhere = dbProduct.brandId 
    ? { OR: [{ brandId: dbProduct.brandId }, ...(dbProduct.brand ? [{ brand: dbProduct.brand }] : [])] }
    : (dbProduct.brand ? { brand: dbProduct.brand } : null);

  // Fetch related products, global policies, and settings
  const categoryId = dbProduct.categoryId;
  
  const [similarDb, sameBrandDb, relatedDb, globalPoliciesDb, settingsData] = await Promise.all([
    // Similar products (same category)
    prisma.product.findMany({
      where: { categoryId: categoryId, id: { not: dbProduct.id }, isActive: true, deletedAt: null },
      include: { category: true, brandRef: true, variants: true },
      take: 4
    }),
    // Same brand
    brandWhere ? prisma.product.findMany({
      where: { ...brandWhere, id: { not: dbProduct.id }, isActive: true, deletedAt: null },
      include: { category: true, brandRef: true, variants: true },
      take: 4,
      orderBy: { id: 'desc' }
    }) : Promise.resolve([]),
    // Related products (latest active products)
    prisma.product.findMany({
      where: { id: { not: dbProduct.id }, isActive: true, deletedAt: null },
      include: { category: true, brandRef: true, variants: true },
      take: 4,
      orderBy: { createdAt: 'desc' }
    }),
    // Global Policies
    prisma.productPolicy.findMany(),
    // Settings
    prisma.setting.findMany()
  ]);

  const settingsMap: Record<string, string> = {};
  settingsData.forEach(s => {
    settingsMap[s.key] = s.value;
  });

  const mapProducts = (list: any[]) => list.map(p => {
    const v = p.variants?.[0];
    const rawImgs = (p.images as string[] || []).map(cleanUrl).filter(Boolean);
    const rawVarImgs = (v?.images as string[] || []).map(cleanUrl).filter(Boolean);
    const mainImg = rawImgs[0] || rawVarImgs[0] || '/placeholder.jpg';
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category?.name || 'Khác',
      brand: p.brand || p.brandRef?.name || '',
      price: v?.price || 0,
      originalPrice: v?.originalPrice,
      rating: 5,
      reviews: 12,
      image: mainImg,
      stock: v?.stockQuantity || 0,
      isContactPrice: p.isContactPrice,
      productType: p.productType,
    };
  });

  return (
    <ProductDetailClient 
      product={product} 
      settings={settingsMap}
      globalPolicies={globalPoliciesDb}
      similarProducts={mapProducts(similarDb)} 
      sameBrandProducts={mapProducts(sameBrandDb)} 
      relatedProducts={mapProducts(relatedDb)} 
      consumables={mapProducts(dbProduct.consumables || [])} 
    />
  );
}

