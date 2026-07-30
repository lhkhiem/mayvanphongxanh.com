import type { Metadata } from 'next';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturedProducts } from '@/components/sections/FeaturedProducts';
import { ServicePackagesSection } from '@/components/sections/ServicePackagesSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { CompanyIntro } from '@/components/sections/CompanyIntro';
import { CustomerReviews } from '@/components/sections/CustomerReviews';
import { BlogSection } from '@/components/sections/BlogSection';
import { FaqSection } from '@/components/sections/FaqSection';
import { prisma } from '@/lib/db';

import { cleanUrl } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  let dbSettings: any[] = [];
  try {
    dbSettings = await prisma.setting.findMany();
  } catch (err) {
    console.warn('Could not fetch dbSettings in page generateMetadata:', err);
  }
  const settingsMap = dbSettings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const defaultTitle = 'Máy Văn Phòng Xanh - Chuyên cung cấp máy in, mực in & Thiết bị văn phòng';
  const defaultDesc = 'Giải pháp thiết bị văn phòng chuyên nghiệp và dịch vụ kỹ thuật. Máy in tốc độ cao, mực in chính hãng, máy tính tiền POS, giải pháp mạng và hợp đồng bảo trì cho doanh nghiệp.';

  const title = settingsMap['seo_title']?.trim() || settingsMap['company_name']?.trim() || defaultTitle;
  const description = settingsMap['seo_description']?.trim() || settingsMap['company_description']?.trim() || defaultDesc;
  const ogImage = cleanUrl(settingsMap['seo_image'] || settingsMap['company_logo'] || settingsMap['site_logo']);

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
      type: 'website',
      locale: 'vi_VN',
      siteName: settingsMap['company_name'] || 'Máy Văn Phòng Xanh',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function Home() {
  // Fetch data directly from Server
  const [dbCategories, dbProducts, dbTestimonials, dbPosts, dbProjects, dbSettings, dbSliders, dbBanners, dbFaqs] = await Promise.all([
    prisma.category.findMany({ 
      where: { isActive: true, parentId: null },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      include: {
        children: {
          where: { isActive: true },
          orderBy: [{ order: 'asc' }, { id: 'asc' }]
        }
      }
    }),
    prisma.product.findMany({
      where: { isActive: true, deletedAt: null },
      include: { category: true, variants: true }
    }),
    prisma.testimonial.findMany({ where: { isActive: true } }),
    prisma.post.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 6
    }),
    prisma.project.findMany({ where: { isActive: true } }),
    prisma.setting.findMany(),
    prisma.slider.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    prisma.banner.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    prisma.faq.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } })
  ]);

  // Clean slider & banner URLs
  const sliders = dbSliders.map(s => ({ ...s, image: cleanUrl(s.image) }));
  const banners = dbBanners.map(b => ({ ...b, image: cleanUrl(b.image) }));

  // Format Products for UI
  const products = dbProducts.map(p => {
    const defaultVariant = p.variants[0];
    const rawImage = (p.images as string[])?.[0] || (defaultVariant?.images as string[])?.[0] || '';
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category.name,
      brand: p.brand,
      price: defaultVariant?.price || 0,
      originalPrice: defaultVariant?.originalPrice,
      rating: 5,
      reviews: 120,
      image: cleanUrl(rawImage),
      stock: defaultVariant?.stockQuantity || 0,
      description: p.description,
      productType: p.productType,
      isFeatured: p.isFeatured,
      isContactPrice: p.isContactPrice,
      attributes: defaultVariant?.attributes,
      variants: p.variants,
      customOptions: p.customOptions
    };
  });

  // Filter featured categories and products
  const featuredCategories = dbCategories.filter(c => c.isFeatured);
  const featuredProducts = products.filter(p => p.isFeatured);

  return (
    <main className="min-h-screen bg-background">
      <Header categories={dbCategories} />
      <HeroSection categories={dbCategories} sliders={sliders} banners={banners} />
      <FeaturedProducts products={featuredProducts} categories={featuredCategories} />
      <ServicePackagesSection products={products.filter(p => p.category === 'Gói dịch vụ')} />
      <ProjectsSection projects={dbProjects} />
      <CompanyIntro />
      <CustomerReviews testimonials={dbTestimonials} />
      <FaqSection faqs={dbFaqs} />
      <BlogSection posts={dbPosts} />

      <Footer />
    </main>
  );
}
