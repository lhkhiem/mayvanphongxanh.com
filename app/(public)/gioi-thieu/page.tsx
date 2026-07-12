import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { prisma } from '@/lib/db';
import { Footer } from '@/components/common/Footer';
import { 
  CheckCircle2, 
  ArrowRight, 
  CalendarDays, 
  Users, 
  Award, 
  MapPin,
  Search,
  MessageSquareText,
  FileCheck2,
  Wrench,
  GraduationCap,
  HeadphonesIcon,
  ShieldCheck,
  Zap,
  Globe2,
  Star,
  Briefcase,
} from 'lucide-react';
import { getAboutSettings } from '@/app/(admin)/admin/(dashboard)/about/actions';

export const metadata = {
  title: 'Giới thiệu | Máy Văn Phòng Xanh',
  description: 'Đối tác công nghệ cung cấp thiết bị văn phòng, dịch vụ kỹ thuật và giải pháp hạ tầng CNTT toàn diện cho doanh nghiệp hiện đại.',
};

// Icon map for dynamic rendering
const ICON_MAP: Record<string, React.ElementType> = {
  CalendarDays,
  Users,
  Award,
  MapPin,
  Search,
  MessageSquareText,
  FileCheck2,
  Wrench,
  GraduationCap,
  HeadphonesIcon,
  ShieldCheck,
  Zap,
  Globe2,
  Star,
  Briefcase,
};

export default async function AboutPage() {
  const [dbServices, settings] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    }),
    getAboutSettings(),
  ]);

  const { hero, stats, process: processSteps, brands, values, cta } = settings;

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 pb-16">
        {/* 1. Hero Section */}
        <section className="relative overflow-hidden bg-slate-900 text-white pb-32 pt-16 lg:pt-24">
          <div className="absolute inset-0">
            <img 
              src={hero.bgImage} 
              alt="Văn phòng hiện đại" 
              className="object-cover w-full h-full opacity-30 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
          </div>
          
          <div className="relative mx-auto max-w-7xl px-4 z-10">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-bold uppercase tracking-widest text-primary-foreground bg-primary/20 inline-block px-3 py-1 rounded-full border border-primary/30">
                {hero.badge}
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white mb-6">
                {hero.title} <br />
                <span className="text-primary">{hero.titleHighlight}</span>
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-slate-300">
                {hero.description}
              </p>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href={hero.btn1Url} className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                  {hero.btn1Label} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href={hero.btn2Url} className="inline-flex h-12 items-center justify-center rounded-md border border-slate-600 bg-slate-800/50 backdrop-blur-sm px-8 text-sm font-bold text-white hover:bg-slate-700 transition-colors">
                  {hero.btn2Label}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats overlapping Hero */}
        <div className="relative z-20 mx-auto max-w-7xl px-4 -mt-16 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-card rounded-xl p-6 shadow-xl border border-border">
            {stats.map((stat, idx) => {
              const Icon = ICON_MAP[stat.icon] ?? CalendarDays;
              return (
                <div key={idx} className={`flex items-center gap-4 ${idx < stats.length - 1 ? 'border-r border-border pr-4' : ''} ${idx >= 2 ? 'hidden md:flex' : ''}`}>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <strong className="block text-2xl font-black text-primary">{stat.value}</strong>
                    <span className="block text-sm font-bold text-foreground">{stat.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Dịch vụ chủ lực (3 Columns) */}
        <section className="mx-auto max-w-7xl px-4 py-8 mb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {dbServices.map((srv, index) => {
              // Phân tích content HTML list thành mảng các items để giữ nguyên UI cũ
              let items: string[] = [];
              if (srv.content) {
                const matches = srv.content.match(/<li>(.*?)<\/li>/g);
                if (matches) {
                  items = matches.map(m => m.replace(/<\/?li>/g, ''));
                }
              }

              const formattedId = `0${index + 1}`.slice(-2);

              return (
              <div key={srv.id} className="bg-card rounded-xl shadow-md border border-border p-8 flex flex-col hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4 mb-6">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-white font-black text-lg ${srv.icon || 'bg-primary'}`}>
                    {formattedId}
                  </span>
                  <h2 className="text-xl font-bold leading-tight text-foreground pt-1">{srv.title}</h2>
                </div>
                
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {srv.excerpt}
                </p>
                
                <ul className="space-y-3 mb-8 flex-1">
                  {items.map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-sm font-semibold text-foreground items-start">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${srv.icon === 'bg-primary' ? 'text-primary' : srv.icon === 'bg-teal-600' ? 'text-teal-600' : srv.icon === 'bg-orange-600' ? 'text-orange-600' : 'text-primary'}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="relative h-40 w-full rounded-lg overflow-hidden mt-auto">
                  <img src={srv.image || ''} alt={srv.title} className="object-cover w-full h-full hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
              );
            })}
          </div>
        </section>

        {/* 3. Quy trình triển khai */}
        <section className="mx-auto max-w-7xl px-4 py-8 mb-12">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Quy trình triển khai</h2>
          
          <div className="bg-card rounded-xl shadow-md border border-border p-6 overflow-x-auto">
            <ol className="flex items-start min-w-[800px] justify-between">
              {processSteps.map((step, idx) => {
                const Icon = ICON_MAP[step.icon] ?? Wrench;
                return (
                  <li key={idx} className="flex items-center flex-1 relative group">
                    <div className="flex flex-col items-center text-center px-4 w-full relative z-10">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shadow-sm border border-primary/20">
                        <Icon className="w-6 h-6" />
                      </span>
                      <h3 className="text-sm font-bold text-foreground mb-1">{step.title}</h3>
                      <p className="text-xs text-muted-foreground leading-tight">{step.desc}</p>
                    </div>
                    {/* Arrow connector */}
                    {idx < processSteps.length - 1 && (
                      <div className="hidden sm:block absolute top-7 left-[60%] w-[80%] h-[2px] bg-border -z-0">
                        <div className="absolute right-0 -top-1.5 text-border">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* 4. Đối tác & Thương hiệu */}
        <section className="mx-auto max-w-7xl px-4 py-8 mb-12">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Đối tác & Thương hiệu</h2>
          
          <div className="bg-card rounded-xl shadow-sm border border-border p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 items-center justify-items-center opacity-70">
              {brands.map((brand, idx) => (
                <div key={idx} className="font-black text-2xl text-muted-foreground uppercase hover:text-primary transition-colors cursor-pointer text-center">
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Năng lực cạnh tranh */}
        <section className="mx-auto max-w-7xl px-4 py-8 mb-12">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Năng lực cạnh tranh</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, idx) => {
              const Icon = ICON_MAP[val.icon] ?? ShieldCheck;
              return (
                <div key={idx} className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-base font-bold text-foreground mb-3">{val.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{val.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. CTA */}
        <section className="mx-auto max-w-7xl px-4 mb-8">
          <div className="bg-primary rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-cover bg-center" style={{ backgroundImage: `url('${cta.bgImage}')` }}></div>
             
             <div className="relative z-10 text-center md:text-left text-primary-foreground max-w-2xl">
               <h2 className="text-2xl md:text-3xl font-bold mb-3">{cta.title}</h2>
               <p className="text-primary-foreground/90 text-sm md:text-base">{cta.description}</p>
             </div>
             
             <div className="relative z-10 shrink-0">
               <Link href={cta.btnUrl} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-8 font-bold text-primary shadow hover:bg-gray-100 transition-colors">
                 {cta.btnLabel}
               </Link>
             </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
