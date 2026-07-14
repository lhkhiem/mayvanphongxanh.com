import { prisma } from "@/lib/db";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, ShieldCheck, Users, MapPin, Zap, ArrowRight, Phone } from "lucide-react";
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { CertificateImageZoom, CertificateAction } from "./CertificateViewer";

export const metadata: Metadata = {
  title: "Đối tác chiến lược - Máy Văn Phòng Xanh",
  description: "Máy Văn Phòng Xanh tự hào là đối tác chiến lược và nhà phân phối ủy quyền của các thương hiệu thiết bị văn phòng hàng đầu.",
};

const getIcon = (name: string) => {
  switch (name) {
    case 'CheckCircle': return <CheckCircle className="w-5 h-5" />;
    case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
    case 'Users': return <Users className="w-5 h-5" />;
    case 'MapPin': return <MapPin className="w-5 h-5" />;
    case 'Zap': return <Zap className="w-5 h-5" />;
    default: return <CheckCircle className="w-5 h-5" />;
  }
};

const getBadgeStyle = (badge: string) => {
  if (badge.includes('Vàng') || badge.includes('Gold')) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  if (badge.includes('Bạc') || badge.includes('Silver')) return 'bg-slate-50 text-slate-600 border-slate-200';
  if (badge.includes('Chiến lược') || badge.includes('Strategic')) return 'bg-blue-50 text-blue-700 border-blue-200';
  return 'bg-green-50 text-green-700 border-green-200';
};

export default async function PartnerPage() {
  const settingsData = await prisma.setting.findMany({
    where: {
      key: {
        in: [
          'partner_hero_title',
          'partner_hero_subtitle',
          'partner_hero_btn1_text',
          'partner_hero_btn1_url',
          'partner_hero_btn2_text',
          'partner_hero_btn2_url',
          'partner_cta_title',
          'partner_cta_subtitle',
          'partner_stats'
        ]
      }
    }
  });

  const settings: Record<string, string> = {};
  settingsData.forEach(s => {
    settings[s.key] = s.value;
  });

  const stats = settings['partner_stats'] ? JSON.parse(settings['partner_stats']) : [
    { title: "20+", subtitle: "Thương hiệu", desc: "Hợp tác chiến lược" },
    { title: "100%", subtitle: "Chính hãng", desc: "Đầy đủ CO/CQ" },
    { title: "VAT", subtitle: "Hóa đơn", desc: "Hỗ trợ doanh nghiệp" },
    { title: "63", subtitle: "Tỉnh thành", desc: "Giao hàng toàn quốc" },
  ];

  const certificates = await prisma.partnerCertificate.findMany({
    where: { isActive: true },
    include: { brand: true },
    orderBy: { order: 'asc' }
  });

  const benefits = await prisma.partnerBenefit.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });

  const partnerBrands = await prisma.brand.findMany({
    where: { isPartner: true, isActive: true },
    orderBy: { name: 'asc' }
  });

  const dbCategories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    include: { children: true }
  });

  return (
    <main className="min-h-screen bg-background">
      <Header categories={dbCategories} />

      {/* ============ HERO SECTION ============ */}
      {/* Dark navy background, left-aligned content */}
      <section className="relative bg-slate-900 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&q=80"
            alt="background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/85 to-slate-900/60" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-40">

          {/* Badge */}
          <div className="inline-flex items-center mb-6 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5">
            <span className="text-xs font-bold tracking-widest uppercase text-green-400">
              Đối tác ủy quyền chính hãng
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            <span className="text-white">Hệ sinh thái thương hiệu</span>
            <br />
            <span className="text-green-500">đẳng cấp quốc tế</span>
          </h1>

          {/* Description */}
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mb-10">
            {settings['partner_hero_subtitle'] || 'Máy Văn Phòng Xanh tự hào là đối tác chiến lược và nhà phân phối ủy quyền của các thương hiệu thiết bị văn phòng hàng đầu thế giới.'}
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link
              href={settings['partner_hero_btn1_url'] || '#contact'}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-bold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
            >
              {settings['partner_hero_btn1_text'] || 'Trở thành đối tác'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={settings['partner_hero_btn2_url'] || 'tel:19001234'}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-slate-600 bg-slate-800/50 px-8 text-sm font-bold text-white hover:bg-slate-700 transition-colors"
            >
              <Phone className="w-4 h-4" />
              {settings['partner_hero_btn2_text'] || 'Liên hệ tư vấn'}
            </Link>
          </div>
        </div>
      </section>

      {/* ============ STATS SECTION ============ */}
      {/* White card overlapping hero bottom and light section top */}
      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 mb-0">
        <div className="grid grid-cols-2 md:grid-cols-4 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {stats.map((stat: any, idx: number) => (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center py-8 px-4 text-center ${idx < stats.length - 1 ? 'border-r border-slate-100' : ''}`}
            >
              <span className="text-3xl md:text-4xl font-extrabold text-green-600 mb-2">{stat.title}</span>
              <span className="text-sm font-bold text-slate-800">{stat.subtitle}</span>
              <span className="text-xs text-slate-500 mt-1">{stat.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ============ MAIN CONTENT — Light gray background ============ */}
      <div className="bg-slate-50">

        {/* ============ CERTIFICATES SECTION ============ */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest uppercase text-primary mb-3 block">
              Hồ sơ năng lực
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Giấy chứng nhận ủy quyền</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-sm leading-relaxed">
              Các chứng nhận do chính hãng cấp trực tiếp cho Máy Văn Phòng Xanh, minh chứng cho năng lực và uy tín trong lĩnh vực phân phối thiết bị.
            </p>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map(cert => (
              <div key={cert.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
                {/* Top row: logo + badge */}
                <div className="flex justify-between items-start mb-5">
                  <div className="h-10 w-28 relative">
                    {cert.brand?.logo ? (
                      <Image src={cert.brand.logo} alt={cert.brand.name} fill className="object-contain object-left" />
                    ) : (
                      <span className="text-base font-bold text-slate-700">{cert.brand?.name}</span>
                    )}
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getBadgeStyle(cert.badge)}`}>
                    <ShieldCheck className="h-3 w-3" />
                    {cert.badge}
                  </span>
                </div>

                {/* Brand name */}
                <h3 className="text-lg font-bold text-slate-900 mb-4">{cert.brand?.name}</h3>

                {/* Details */}
                <div className="space-y-2.5 mb-6">
                  <div className="flex text-sm">
                    <span className="w-20 text-slate-500 shrink-0">Phạm vi:</span>
                    <span className="font-semibold text-slate-800">{cert.scope}</span>
                  </div>
                  <div className="flex text-sm">
                    <span className="w-20 text-slate-500 shrink-0">Khu vực:</span>
                    <span className="font-semibold text-slate-800">{cert.region}</span>
                  </div>
                  <div className="flex text-sm">
                    <span className="w-20 text-slate-500 shrink-0">Hiệu lực:</span>
                    <span className="font-semibold text-slate-800">{cert.validDate}</span>
                  </div>
                </div>

                {/* Image Thumbnail with Zoom */}
                {cert.image && <CertificateImageZoom image={cert.image} />}

                {/* Action Link / Zoom Button */}
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <CertificateAction link={cert.link} image={cert.image} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ BRANDS SECTION ============ */}
        <section className="border-t border-slate-200 bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-base font-bold text-slate-800 mb-8">Thương hiệu phân phối</h3>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
              {partnerBrands.map(brand => (
                <div
                  key={brand.id}
                  className="text-xl md:text-2xl font-black tracking-tighter text-slate-300 hover:text-slate-600 transition-colors duration-300 cursor-default uppercase"
                >
                  {brand.name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ BENEFITS SECTION ============ */}
        <section className="border-t border-slate-200 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Quyền lợi mua hàng chính hãng</h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-sm">
                Cam kết mang lại giá trị thực và sự an tâm tuyệt đối cho khách hàng doanh nghiệp và cá nhân.
              </p>
            </div>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {benefits.map(benefit => (
                <div key={benefit.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    {getIcon(benefit.icon)}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA SECTION ============ */}
        <section className="pb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="bg-primary rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
              <div className="text-center md:text-left text-primary-foreground max-w-xl">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  {settings['partner_cta_title'] || 'Bạn cần tư vấn thiết bị cho dự án?'}
                </h2>
                <p className="text-primary-foreground/80 text-sm md:text-base">
                  {settings['partner_cta_subtitle'] || 'Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ chọn cấu hình và báo giá dự án nhanh chóng.'}
                </p>
              </div>
              <div className="flex gap-4 shrink-0 flex-wrap justify-center">
                <Link
                  href="/lien-he"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 font-bold text-primary shadow hover:bg-gray-100 transition-colors"
                >
                  Nhận báo giá
                </Link>
                <Link
                  href="tel:19001234"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-8 font-bold text-white hover:bg-white/20 transition-colors"
                >
                  <Phone className="w-4 h-4" /> 1900 1234
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  );
}
