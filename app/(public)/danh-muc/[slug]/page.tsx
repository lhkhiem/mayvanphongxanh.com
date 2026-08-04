import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProductsClient from '@/app/(public)/san-pham/ProductsClient';
import { cleanUrl } from '@/lib/utils';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.replace(/\.html$/, '');
  
  const category = await prisma.category.findFirst({
    where: { slug, isActive: true },
    include: {
      products: {
        where: { isActive: true, deletedAt: null },
        take: 1,
        select: { images: true }
      }
    }
  });

  if (!category) {
    return { title: 'Không tìm thấy danh mục | Máy Văn Phòng Xanh' };
  }

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://mayvanphongxanh.com').replace(/\/$/, '');
  
  const title = category.metaTitle?.trim() || `${category.name} | Máy Văn Phòng Xanh`;
  const rawDesc = category.metaDescription?.trim() || category.promoDescription?.trim();
  const description = rawDesc || `Danh mục ${category.name} tại Máy Văn Phòng Xanh. Cung cấp thiết bị văn phòng, máy in, máy photocopy, vật tư linh kiện chất lượng, dịch vụ tận tâm và giá trị vượt trội.`;
  const keywords = category.metaKeywords?.trim() || `${category.name}, máy văn phòng xanh, mua ${category.name}`;

  // Image Fallback Strategy:
  // 1. Custom Category SEO Image (metaImage)
  // 2. Category Promo Image (promoImageUrl)
  // 3. First product's primary image in this category
  // 4. Default fallback placeholder image
  let imageRel = category.metaImage || category.promoImageUrl;
  if (!imageRel && category.products?.[0]?.images) {
    const prodImgs = (category.products[0].images as string[] || []).map(cleanUrl).filter(Boolean);
    if (prodImgs.length > 0) {
      imageRel = prodImgs[0];
    }
  }
  if (!imageRel) {
    imageRel = '/placeholder.jpg';
  }

  const absoluteImageUrl = imageRel.startsWith('http://') || imageRel.startsWith('https://')
    ? imageRel
    : `${baseUrl}${imageRel.startsWith('/') ? '' : '/'}${imageRel}`;

  const pageUrl = `${baseUrl}/danh-muc/${category.slug}`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Máy Văn Phòng Xanh',
      type: 'website',
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: category.name,
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

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.replace(/\.html$/, '');
  
  const category = await prisma.category.findFirst({ where: { slug, isActive: true } });
  
  if (!category) {
    notFound();
  }

  const [dbProducts, dbCategories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: { category: true, brandRef: true, variants: true }
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
  return <ProductsClient products={products} categories={dbCategories} initialCategory={category.name} />;
}
