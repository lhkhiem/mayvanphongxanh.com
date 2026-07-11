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
  Globe2
} from 'lucide-react';

export const metadata = {
  title: 'Giới thiệu | Máy Văn Phòng Xanh',
  description: 'Đối tác công nghệ cung cấp thiết bị văn phòng, dịch vụ kỹ thuật và giải pháp hạ tầng CNTT toàn diện cho doanh nghiệp hiện đại.',
};

// import { prisma } from '@/lib/db'; (We will import it at the top)

const PROCESS_STEPS = [
  { icon: Search, title: 'Khảo sát', desc: 'Ghi nhận hiện trạng & nhu cầu' },
  { icon: MessageSquareText, title: 'Tư vấn', desc: 'Đề xuất phương án tối ưu' },
  { icon: FileCheck2, title: 'Thiết kế', desc: 'Lên cấu hình & bản vẽ' },
  { icon: Wrench, title: 'Triển khai', desc: 'Thi công & cấu hình' },
  { icon: GraduationCap, title: 'Bàn giao', desc: 'Đào tạo & nghiệm thu' },
  { icon: HeadphonesIcon, title: 'Bảo trì', desc: 'Hỗ trợ kỹ thuật 24/7' }
];

const CORE_VALUES = [
  { icon: ShieldCheck, title: 'Nguồn hàng chính hãng', desc: '100% sản phẩm có đầy đủ CO/CQ, hóa đơn VAT, truy xuất nguồn gốc rõ ràng.' },
  { icon: Users, title: 'Đội ngũ chuyên nghiệp', desc: 'Kỹ thuật viên giàu kinh nghiệm, được đào tạo bài bản và chứng nhận từ hãng.' },
  { icon: Globe2, title: 'Triển khai toàn quốc', desc: 'Năng lực thi công và giao hàng rộng khắp 63 tỉnh thành trên cả nước.' },
  { icon: Zap, title: 'Hỗ trợ nhanh chóng', desc: 'Cam kết thời gian phản hồi SLA, xử lý sự cố kịp thời đảm bảo vận hành.' },
];

const BRANDS = [
  "HP", "Dell", "Lenovo", "Canon", "Epson", "Brother", "Ricoh", "TP-Link"
];

export default async function AboutPage() {
  const dbServices = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 pb-16">
        {/* 1. Hero Section */}
        <section className="relative overflow-hidden bg-slate-900 text-white pb-32 pt-16 lg:pt-24">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80" 
              alt="Văn phòng hiện đại" 
              className="object-cover w-full h-full opacity-30 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
          </div>
          
          <div className="relative mx-auto max-w-7xl px-4 z-10">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-bold uppercase tracking-widest text-primary-foreground bg-primary/20 inline-block px-3 py-1 rounded-full border border-primary/30">
                Về Máy Văn Phòng Xanh
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white mb-6">
                Đối tác công nghệ <br />
                <span className="text-primary">cho doanh nghiệp hiện đại</span>
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-slate-300">
                Chúng tôi cung cấp thiết bị công nghệ, dịch vụ kỹ thuật và giải pháp hạ tầng CNTT toàn diện, giúp doanh nghiệp tối ưu chi phí, vận hành hiệu quả và phát triển bền vững.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/lien-he" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                  Nhận tư vấn giải pháp <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/san-pham" className="inline-flex h-12 items-center justify-center rounded-md border border-slate-600 bg-slate-800/50 backdrop-blur-sm px-8 text-sm font-bold text-white hover:bg-slate-700 transition-colors">
                  Khám phá thiết bị
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats overlapping Hero */}
        <div className="relative z-20 mx-auto max-w-7xl px-4 -mt-16 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-card rounded-xl p-6 shadow-xl border border-border">
            <div className="flex items-center gap-4 border-r border-border pr-4 last:border-r-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <strong className="block text-2xl font-black text-primary">10+</strong>
                <span className="block text-sm font-bold text-foreground">Năm kinh nghiệm</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 border-r border-border pr-4 last:border-r-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <strong className="block text-2xl font-black text-primary">5000+</strong>
                <span className="block text-sm font-bold text-foreground">Khách hàng</span>
              </div>
            </div>

            <div className="flex items-center gap-4 border-r border-border pr-4 last:border-r-0 hidden md:flex">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <strong className="block text-2xl font-black text-primary">50+</strong>
                <span className="block text-sm font-bold text-foreground">Thương hiệu</span>
              </div>
            </div>

            <div className="flex items-center gap-4 hidden md:flex">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <strong className="block text-2xl font-black text-primary">63</strong>
                <span className="block text-sm font-bold text-foreground">Tỉnh thành</span>
              </div>
            </div>
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
              {PROCESS_STEPS.map((step, idx) => (
                <li key={idx} className="flex items-center flex-1 relative group">
                  <div className="flex flex-col items-center text-center px-4 w-full relative z-10">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shadow-sm border border-primary/20">
                      <step.icon className="w-6 h-6" />
                    </span>
                    <h3 className="text-sm font-bold text-foreground mb-1">{step.title}</h3>
                    <p className="text-xs text-muted-foreground leading-tight">{step.desc}</p>
                  </div>
                  {/* Arrow connector */}
                  {idx < PROCESS_STEPS.length - 1 && (
                    <div className="hidden sm:block absolute top-7 left-[60%] w-[80%] h-[2px] bg-border -z-0">
                      <div className="absolute right-0 -top-1.5 text-border">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 4. Đối tác & Thương hiệu */}
        <section className="mx-auto max-w-7xl px-4 py-8 mb-12">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Đối tác & Thương hiệu</h2>
          
          <div className="bg-card rounded-xl shadow-sm border border-border p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 items-center justify-items-center opacity-70">
              {BRANDS.map((brand, idx) => (
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
            {CORE_VALUES.map((val, idx) => (
              <div key={idx} className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
                <val.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-base font-bold text-foreground mb-3">{val.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. CTA */}
        <section className="mx-auto max-w-7xl px-4 mb-8">
          <div className="bg-primary rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')] bg-cover bg-center"></div>
             
             <div className="relative z-10 text-center md:text-left text-primary-foreground max-w-2xl">
               <h2 className="text-2xl md:text-3xl font-bold mb-3">Bạn đang tìm kiếm giải pháp công nghệ cho doanh nghiệp?</h2>
               <p className="text-primary-foreground/90 text-sm md:text-base">Máy Văn Phòng Xanh sẵn sàng lắng nghe nhu cầu và đề xuất phương án tối ưu, tiết kiệm chi phí nhất.</p>
             </div>
             
             <div className="relative z-10 shrink-0">
               <Link href="/lien-he" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-8 font-bold text-primary shadow hover:bg-gray-100 transition-colors">
                 Gọi ngay: 1900 1234
               </Link>
             </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
