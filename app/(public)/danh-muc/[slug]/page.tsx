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
      parent: true,
      children: {
        where: { isActive: true },
        select: { id: true, name: true, slug: true }
      },
      products: {
        where: { isActive: true, deletedAt: null },
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
        take: 1,
        select: { images: true }
      }
    }
  });

  if (!category) {
    return { title: 'Không tìm thấy danh mục | Máy Văn Phòng Xanh' };
  }

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://mayvanphongxanh.com').replace(/\/$/, '');
  
  // Option 1 Default SEO generation rules
  const defaultTitle = `${category.name} | Máy Văn Phòng Xanh`;
  const defaultDesc = category.promoDescription?.trim() || 
    `Danh mục ${category.name} tại Máy Văn Phòng Xanh. Cung cấp thiết bị văn phòng, máy in, máy photocopy, vật tư linh kiện chính hãng chất lượng cao, bảo hành uy tín và giá tốt nhất.`;
  
  const childNames = category.children?.map(c => c.name).join(', ');
  const defaultKeywords = `${category.name}, mua ${category.name}, ${category.name} chính hãng, máy văn phòng xanh${childNames ? `, ${childNames}` : ''}`;

  // Option 1 Image Selection Strategy:
  // 1. First product's primary image in this category
  // 2. If parent category has no products: find first child category with products and take its 1st product image
  // 3. Category Promo Image (promoImageUrl)
  // 4. Default fallback placeholder image
  let defaultImageRel: string | null = null;
  
  if (category.products?.[0]?.images) {
    const prodImgs = (category.products[0].images as string[] || []).map(cleanUrl).filter(Boolean);
    if (prodImgs.length > 0) {
      defaultImageRel = prodImgs[0];
    }
  }

  if (!defaultImageRel) {
    const childWithProd = await prisma.category.findFirst({
      where: {
        parentId: category.id,
        isActive: true,
        products: {
          some: { isActive: true, deletedAt: null }
        }
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      include: {
        products: {
          where: { isActive: true, deletedAt: null },
          orderBy: [{ order: 'asc' }, { id: 'asc' }],
          take: 1,
          select: { images: true }
        }
      }
    });

    if (childWithProd?.products?.[0]?.images) {
      const childImgs = (childWithProd.products[0].images as string[] || []).map(cleanUrl).filter(Boolean);
      if (childImgs.length > 0) {
        defaultImageRel = childImgs[0];
      }
    }
  }

  if (!defaultImageRel && category.promoImageUrl) {
    defaultImageRel = category.promoImageUrl;
  }

  // Determine final metadata values based on isSeoCustom switch (Option 2 vs Option 1)
  const isCustom = category.isSeoCustom;

  const title = (isCustom && category.metaTitle?.trim())
    ? category.metaTitle.trim()
    : defaultTitle;

  const description = (isCustom && category.metaDescription?.trim())
    ? category.metaDescription.trim()
    : defaultDesc;

  const keywords = (isCustom && category.metaKeywords?.trim())
    ? category.metaKeywords.trim()
    : defaultKeywords;

  let imageRel = (isCustom && category.metaImage?.trim())
    ? category.metaImage.trim()
    : defaultImageRel;

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

  // Render the same generic products view but pre-filter by the current category
  return <ProductsClient products={products} categories={dbCategories} initialCategory={category.name} />;
}
