import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturedProducts } from '@/components/sections/FeaturedProducts';
import { ServicePackagesSection } from '@/components/sections/ServicePackagesSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { CompanyIntro } from '@/components/sections/CompanyIntro';
import { CustomerReviews } from '@/components/sections/CustomerReviews';
import { BlogSection } from '@/components/sections/BlogSection';


export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturedProducts />
      <ServicePackagesSection />
      <ProjectsSection />
      <CompanyIntro />
      <CustomerReviews />
      <BlogSection />

      <Footer />
    </main>
  );
}
