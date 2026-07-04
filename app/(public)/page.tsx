import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturedProducts } from '@/components/sections/FeaturedProducts';
import { ServicePackagesSection } from '@/components/sections/ServicePackagesSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { CompanyIntro } from '@/components/sections/CompanyIntro';
import { CustomerReviews } from '@/components/sections/CustomerReviews';
import { BlogSection } from '@/components/sections/BlogSection';
import { prisma } from '@/lib/db';

export default async function Home() {
  // Fetch data directly from Server
  const [dbCategories, dbProducts, dbTestimonials, dbPosts, dbProjects, dbSettings] = await Promise.all([
    prisma.category.findMany({ 
      where: { isActive: true, parentId: null },
      include: { children: true }
    }),
    prisma.product.findMany({
      where: { isActive: true },
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
    prisma.setting.findMany()
  ]);

  // Format Products for UI
  const products = dbProducts.map(p => {
    const defaultVariant = p.variants[0];
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
      image: (p.images as string[])?.[0] || (defaultVariant?.images as string[])?.[0] || '',
      stock: defaultVariant?.stockQuantity || 0,
      description: p.description,
      productType: p.productType,
      attributes: defaultVariant?.attributes,
      variants: p.variants,
      customOptions: p.customOptions
    };
  });

  return (
    <main className="min-h-screen bg-background">
      <Header categories={dbCategories} />
      <HeroSection categories={dbCategories} />
      <FeaturedProducts products={products} categories={dbCategories} />
      <ServicePackagesSection products={products.filter(p => p.category === 'Gói dịch vụ')} />
      <ProjectsSection projects={dbProjects} />
      <CompanyIntro />
      <CustomerReviews testimonials={dbTestimonials} />
      <BlogSection posts={dbPosts} />

      <Footer />
    </main>
  );
}
