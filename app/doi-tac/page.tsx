import Link from 'next/link';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  MapPin, 
  PhoneCall, 
  ArrowRight,
  Zap,
  Users
} from 'lucide-react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

export const metadata = {
  title: 'Đối tác chiến lược & Chứng nhận ủy quyền | Máy Văn Phòng Xanh',
  description: 'Máy Văn Phòng Xanh là nhà phân phối và đối tác ủy quyền chính thức của nhiều thương hiệu thiết bị văn phòng, máy scan và giải pháp số hóa. Cam kết hàng chính hãng 100%, bảo hành chuẩn hãng.',
};

const CERTIFICATIONS = [
  {
    id: 'canon',
    brand: 'Canon',
    scope: 'Máy in, Máy scan & Giải pháp in ấn',
    region: 'Việt Nam',
    validity: '01/01/2026 - 31/12/2026',
    issuer: 'Canon Marketing Vietnam',
    tag: 'Đối tác Bạc',
    tagColor: 'bg-gray-100 text-gray-700 border-gray-200',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Canon_Camera_logo.svg/2560px-Canon_Camera_logo.svg.png'
  },
  {
    id: 'hp',
    brand: 'HP',
    scope: 'Máy in doanh nghiệp & PC',
    region: 'Việt Nam',
    validity: '15/06/2025 - 15/06/2026',
    issuer: 'HP Vietnam',
    tag: 'Đại lý Ủy quyền',
    tagColor: 'bg-primary/10 text-primary border-primary/20',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/2048px-HP_logo_2012.svg.png'
  },
  {
    id: 'epson',
    brand: 'Epson',
    scope: 'Máy in phun & Máy chiếu',
    region: 'Toàn quốc',
    validity: '01/04/2026 - 31/03/2027',
    issuer: 'Epson Vietnam',
    tag: 'Đối tác Vàng',
    tagColor: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Epson_logo.svg/2560px-Epson_logo.svg.png'
  },
  {
    id: 'brother',
    brand: 'Brother',
    scope: 'Máy in laser & Nhãn dán',
    region: 'Việt Nam',
    validity: '01/05/2025 - 01/05/2026',
    issuer: 'Brother International Vietnam',
    tag: 'Đối tác Chiến lược',
    tagColor: 'bg-blue-50 text-blue-600 border-blue-200',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Brother_logo.svg/2560px-Brother_logo.svg.png'
  }
];

const BRANDS = [
  "Canon", "HP", "Epson", "Brother", "FujiXerox", "Ricoh", 
  "Panasonic", "Logitech", "TP-Link", "D-Link", "Dell", "Lenovo"
];

const BENEFITS = [
  {
    title: 'Hàng chính hãng 100%',
    desc: 'Đầy đủ CO/CQ, nhập chính ngạch, truy xuất xuất xứ từ hãng.',
    icon: CheckCircle2,
  },
  {
    title: 'Bảo hành chuẩn hãng',
    desc: 'Bảo hành theo chính sách hãng, hỗ trợ đổi mới trong thời gian quy định.',
    icon: ShieldCheck,
  },
  {
    title: 'Hỗ trợ kỹ thuật 24/7',
    desc: 'Đội ngũ kỹ thuật viên giàu kinh nghiệm, hỗ trợ triển khai và bảo trì tận nơi.',
    icon: Users,
  },
  {
    title: 'Giá dự án cực tốt',
    desc: 'Chiết khấu cao cho doanh nghiệp, đầy đủ hóa đơn VAT hợp lệ.',
    icon: Zap,
  },
  {
    title: 'Phủ sóng toàn quốc',
    desc: 'Giao hàng và lắp đặt tận nơi trên khắp 63 tỉnh thành Việt Nam.',
    icon: MapPin,
  }
];

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 pb-20">
        {/* 1. Hero Section */}
        <section className="relative overflow-hidden bg-slate-900 text-white pb-32 pt-12 lg:pt-16">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80" 
              alt="Hợp tác chiến lược" 
              className="object-cover w-full h-full opacity-30 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
          </div>
          
          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-400">
              <Link href="/" className="transition hover:text-white">Trang chủ</Link>
              <span aria-hidden="true">/</span>
              <span className="text-slate-200">Đối tác & Thương hiệu</span>
            </nav>
            
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-bold uppercase tracking-widest text-primary-foreground bg-primary/20 inline-block px-3 py-1 rounded-full border border-primary/30">
                Đối tác ủy quyền chính hãng
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-white">
                Hệ sinh thái thương hiệu <br /> <span className="text-primary">đẳng cấp quốc tế</span>
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mb-8">
                Máy Văn Phòng Xanh tự hào là đối tác chiến lược và nhà phân phối ủy quyền của các thương hiệu thiết bị văn phòng hàng đầu thế giới.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/lien-he" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                  Trở thành đối tác <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="tel:19001234" className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-slate-600 bg-slate-800/50 backdrop-blur-sm px-8 text-sm font-bold text-white hover:bg-slate-700 transition-colors">
                  <PhoneCall className="w-4 h-4" /> Liên hệ tư vấn
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Stats - Overlapping the hero */}
        <div className="container mx-auto px-4 max-w-7xl relative -mt-12 z-20 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { number: '20+', text: 'Thương hiệu', sub: 'Hợp tác chiến lược' },
              { number: '100%', text: 'Chính hãng', sub: 'Đầy đủ CO/CQ' },
              { number: 'VAT', text: 'Hóa đơn', sub: 'Hỗ trợ doanh nghiệp' },
              { number: '63', text: 'Tỉnh thành', sub: 'Giao hàng toàn quốc' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-card border border-border p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                <span className="text-3xl md:text-4xl font-extrabold text-primary mb-1">{stat.number}</span>
                <strong className="text-sm md:text-base font-semibold text-foreground">{stat.text}</strong>
                <span className="text-xs text-muted-foreground mt-1">{stat.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Giấy chứng nhận ủy quyền (Modern Grid) */}
        <section className="container mx-auto px-4 max-w-7xl mb-16">
          <div className="text-center mb-10">
            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Hồ sơ năng lực</p>
            <h2 className="text-3xl font-extrabold text-foreground">Giấy chứng nhận ủy quyền</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">Các chứng nhận do chính hãng cấp trực tiếp cho Máy Văn Phòng Xanh, minh chứng cho năng lực và uy tín trong lĩnh vực phân phối thiết bị.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CERTIFICATIONS.map((cert) => (
              <div key={cert.id} className="group bg-card rounded-xl p-6 border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 relative flex flex-col">
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${cert.tagColor}`}>
                    <Award className="w-3 h-3 mr-1" /> {cert.tag}
                  </span>
                </div>
                
                <div className="h-16 flex items-center mb-6">
                  <img src={cert.logo} alt={cert.brand} className="max-h-10 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-80 group-hover:opacity-100" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-4">{cert.brand}</h3>
                
                <div className="space-y-2 mb-6 flex-grow text-sm">
                  <div className="grid grid-cols-[80px_1fr] gap-2">
                    <span className="text-muted-foreground font-medium">Phạm vi:</span>
                    <span className="text-foreground font-medium">{cert.scope}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-2">
                    <span className="text-muted-foreground font-medium">Khu vực:</span>
                    <span className="text-foreground">{cert.region}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-2">
                    <span className="text-muted-foreground font-medium">Hiệu lực:</span>
                    <span className="text-foreground font-semibold">{cert.validity}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border mt-auto">
                  <button className="text-sm font-semibold text-primary inline-flex items-center hover:underline">
                    Xem chi tiết <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Logo Wall (Hệ sinh thái thương hiệu) */}
        <section className="bg-white border-y border-border py-12 overflow-hidden mb-16">
          <div className="container mx-auto px-4 max-w-7xl text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Thương hiệu phân phối</h2>
          </div>
          
          {/* Simple Marquee effect implementation */}
          <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
            <ul className="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll">
               {BRANDS.map((brand, idx) => (
                  <li key={idx} className="text-2xl md:text-3xl font-black text-muted-foreground/30 hover:text-primary transition-colors duration-300 uppercase cursor-pointer">
                    {brand}
                  </li>
               ))}
               {/* Duplicate for infinite effect */}
               {BRANDS.map((brand, idx) => (
                  <li key={`dup-${idx}`} className="text-2xl md:text-3xl font-black text-muted-foreground/30 hover:text-primary transition-colors duration-300 uppercase cursor-pointer" aria-hidden="true">
                    {brand}
                  </li>
               ))}
            </ul>
          </div>
        </section>

        {/* 4. Quyền lợi khách hàng (Benefits) */}
        <section className="container mx-auto px-4 max-w-7xl mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-foreground">Quyền lợi mua hàng chính hãng</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">Cam kết mang lại giá trị thực và sự an tâm tuyệt đối cho khách hàng doanh nghiệp và cá nhân.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {BENEFITS.map((item, idx) => (
              <div key={idx} className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-colors duration-300">
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. CTA Section */}
        <section className="container mx-auto px-4 max-w-7xl">
          <div className="bg-primary rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            {/* Decorative background shape */}
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
            
            <div className="text-center md:text-left text-primary-foreground flex-1 relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Bạn cần tư vấn thiết bị cho dự án?</h2>
              <p className="text-primary-foreground/80 text-base">Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ chọn cấu hình và báo giá dự án nhanh chóng.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0 relative z-10">
              <Link href="/lien-he" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-6 font-semibold text-primary hover:bg-gray-100 transition-colors shadow">
                Nhận báo giá
              </Link>
              <a href="tel:19001234" className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/30 bg-transparent px-6 font-semibold text-white hover:bg-white/10 transition-colors">
                <PhoneCall className="w-4 h-4" /> 1900 1234
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 30s linear infinite;
        }
      `}} />
    </main>
  );
}
