'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { categories } from '@/lib/mockData';
import { slugify } from '@/lib/utils';

// ─────────────────────────────────────────────────
// Slides
// ─────────────────────────────────────────────────
const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=1200&h=500&fit=crop',
    badge: '⭐ Giải pháp #1 doanh nghiệp',
    title: 'Giải pháp Văn phòng\nChuyên nghiệp & Toàn diện',
    desc: 'Đối tác tin cậy của hàng nghìn doanh nghiệp — máy in, thiết bị văn phòng, vật tư chính hãng và hỗ trợ kỹ thuật chuyên gia.',
    btnPrimary: { label: 'Xem Sản phẩm', href: '/products' },
    btnSecondary: { label: 'Nhận Tư vấn', href: '/contact' },
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3af4abd8?w=1200&h=500&fit=crop',
    badge: '🔥 Khuyến mãi tháng 7',
    title: 'Máy In Đa Chức Năng\nGiảm Đến 30%',
    desc: 'Nâng cấp hiệu suất văn phòng với dòng máy in laser tốc độ cao. Tặng 1 năm bảo trì miễn phí và bộ mực in chính hãng.',
    btnPrimary: { label: 'Mua Ngay', href: '/products' },
    btnSecondary: { label: 'Tìm hiểu thêm', href: '/contact' },
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&h=500&fit=crop',
    badge: '💡 Giải pháp số hóa',
    title: 'Hệ thống POS &\nMạng Doanh Nghiệp',
    desc: 'Chuyển đổi số toàn diện cho doanh nghiệp bán lẻ và văn phòng. Wifi Mesh không điểm mù & máy POS cấu hình cao.',
    btnPrimary: { label: 'Khám phá Dịch vụ', href: '/contact' },
    btnSecondary: { label: 'Xem thiết bị', href: '/products' },
  },
];

// ─────────────────────────────────────────────────
// Promo tiles (bên phải carousel)
// ─────────────────────────────────────────────────
const promoTiles = [
  {
    bg: 'from-blue-600 to-blue-800',
    label: '🖨️ Dịch vụ Máy In',
    sub: 'Bảo trì – Sửa chữa – Nạp mực',
    badge: 'Tặng 30%',
    href: '/danh-muc/dich-vu',
  },
  {
    bg: 'from-orange-500 to-red-600',
    label: '🎁 Gói Khai Trương',
    sub: 'Cafe / Nhà hàng / Cửa hàng',
    badge: 'Hot deal',
    href: '/danh-muc/goi-dich-vu',
  },
];

// ─────────────────────────────────────────────────
// Bottom promo strip
// ─────────────────────────────────────────────────
const bottomTiles = [
  {
    bg: 'from-indigo-600 to-purple-700',
    icon: '💻',
    title: 'Laptop Doanh Nghiệp',
    sub: 'Gaming – Đồ họa – Văn phòng',
    href: '/san-pham',
  },
  {
    bg: 'from-teal-600 to-cyan-700',
    icon: '🖥️',
    title: 'PC Văn Phòng & Server',
    sub: 'Gaming – Workstation – Server',
    href: '/san-pham',
  },
  {
    bg: 'from-green-600 to-emerald-700',
    icon: '🔧',
    title: 'Sửa Chữa – Vệ Sinh',
    sub: 'Máy in – Scan – Photocopy',
    href: '/danh-muc/dich-vu',
  },
];

// ─────────────────────────────────────────────────
// Trust bar items
// ─────────────────────────────────────────────────
const trustItems = [
  { icon: '✅', label: 'Chính hãng 100%' },
  { icon: '💰', label: 'Giá tốt doanh nghiệp' },
  { icon: '🚚', label: 'Giao hàng toàn quốc' },
  { icon: '🛠️', label: 'Hỗ trợ kỹ thuật' },
  { icon: '🧾', label: 'Xuất VAT đầy đủ' },
];

// ─────────────────────────────────────────────────
// Sidebar Category Item
// ─────────────────────────────────────────────────
const sidebarCategories = [
  { icon: '💻', name: 'Laptop doanh nghiệp', slug: 'laptop', subs: ['Dell Latitude', 'HP ProBook', 'Lenovo ThinkPad', 'MacBook'] },
  { icon: '🖥️', name: 'Máy tính để bàn', slug: 'pc', subs: ['PC Văn phòng', 'PC Đồ họa', 'Máy trạm Workstation', 'All-in-One'] },
  { icon: '🗄️', name: 'Máy chủ & Storage', slug: 'server', subs: ['Server Rack', 'Server Tower', 'NAS Storage', 'SAN Storage'] },
  { icon: '🌐', name: 'Thiết bị mạng', slug: 'mang-vien-thong', subs: ['Router WiFi', 'Switch PoE', 'Wifi Mesh', 'Firewall bảo mật'] },
  { icon: '🖨️', name: 'Máy in & Scan', slug: 'may-in', subs: ['Máy in Laser', 'Máy in InkJet', 'Máy scan chuyên dụng', 'Máy in Mã vạch'] },
  { icon: '📹', name: 'Camera & An ninh', slug: 'camera', subs: ['Camera IP', 'Camera Analog', 'Đầu ghi hình', 'Báo động thông minh'] },
  { icon: '🎙️', name: 'Thiết bị hội nghị', slug: 'hoi-nghi', subs: ['Camera hội nghị', 'Loa mic đa hướng', 'Màn hình tương tác'] },
  { icon: '⚙️', name: 'Thiết bị văn phòng', slug: 'thiet-bi', subs: ['Máy hủy tài liệu', 'Máy chấm công', 'Máy chiếu', 'Thiết bị họp'] },
  { icon: '💳', name: 'Hệ thống POS', slug: 'he-thong-pos', subs: ['Máy POS cảm ứng', 'Ngăn kéo tiền', 'Máy quét mã vạch', 'Máy in hóa đơn'] },
  { icon: '📦', name: 'Mực in & Vật tư', slug: 'vat-tu', subs: ['Mực in chính hãng', 'Mực in tương thích', 'Giấy in A4', 'Linh kiện thay thế'] },
  { icon: '🔧', name: 'Dịch vụ kỹ thuật', slug: 'dich-vu', subs: ['Bảo trì máy in', 'Sửa chữa tận nơi', 'Nạp mực in', 'Thiết kế thi công mạng'] },
  { icon: '🎁', name: 'Giải pháp trọn gói', slug: 'goi-dich-vu', subs: ['Gói Nhà phố', 'Gói Văn phòng', 'Gói Khai trương', 'Cho thuê thiết bị'] },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [activeSide, setActiveSide] = useState<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-[#F4F7F6]">
      {/* ── Main hero grid ── */}
      <div className="mx-auto max-w-7xl px-4 pt-3 pb-2">
        <div className="flex gap-2.5">

          {/* ── Left sidebar: Categories ── */}
          <div className="hidden lg:block w-[220px] shrink-0 bg-white rounded-lg border border-gray-200 overflow-visible self-start">
            {sidebarCategories.map((cat, idx) => (
              <div
                key={cat.slug}
                className="relative group/cat"
                onMouseEnter={() => setActiveSide(idx)}
                onMouseLeave={() => setActiveSide(null)}
              >
                <Link
                  href={`/danh-muc/${cat.slug}`}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors border-l-[3px] ${
                    activeSide === idx
                      ? 'bg-primary/5 border-primary text-primary font-semibold'
                      : 'border-transparent text-gray-700 hover:bg-gray-50 hover:text-primary'
                  } ${idx !== sidebarCategories.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <span className="text-lg w-6 text-center">{cat.icon}</span>
                  <span className="flex-1 truncate">{cat.name}</span>
                  <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${activeSide === idx ? 'translate-x-0.5' : ''}`} />
                </Link>

                {/* Sub-categories flyout */}
                {activeSide === idx && (
                  <div className="absolute top-0 left-full ml-0.5 w-52 bg-white border border-gray-200 shadow-2xl rounded-lg z-[60] py-2 pointer-events-auto">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                      {cat.name}
                    </div>
                    {cat.subs.map(sub => (
                      <Link
                        key={sub}
                        href={`/danh-muc/${cat.slug}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                        {sub}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100 mt-1 pt-1 px-3 pb-1">
                      <Link href={`/category/${cat.slug}`} className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                        Xem tất cả <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Center: Carousel ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {/* Carousel */}
            <div className="relative shrink-0 rounded-lg overflow-hidden h-[320px] lg:h-[380px] bg-gray-900 group">
              {slides.map((slide, i) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${slide.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

                  <div className="relative h-full flex flex-col justify-center px-4 sm:px-8 max-w-[90%] md:max-w-[65%]">
                    <span className="inline-block text-xs font-semibold text-yellow-300 bg-yellow-300/20 border border-yellow-300/30 rounded-full px-3 py-1 mb-3 w-fit backdrop-blur-sm">
                      {slide.badge}
                    </span>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight mb-3 drop-shadow">
                      {slide.title.split('\n').map((line, j) => (
                        <span key={j}>{line}{j === 0 && <br />}</span>
                      ))}
                    </h1>
                    <p className="text-white/85 text-xs sm:text-sm mb-5 line-clamp-2">{slide.desc}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Link
                        href={slide.btnPrimary.href}
                        className="px-4 py-2 sm:px-5 sm:py-2 bg-primary text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-colors shadow"
                      >
                        {slide.btnPrimary.label}
                      </Link>
                      <Link
                        href={slide.btnSecondary.href}
                        className="px-4 py-2 sm:px-5 sm:py-2 border border-white/70 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-white hover:text-primary transition-colors backdrop-blur-sm"
                      >
                        {slide.btnSecondary.label}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {/* Arrows */}
              <button
                onClick={() => setCurrent(p => (p - 1 + slides.length) % slides.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 text-white hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrent(p => (p + 1) % slides.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 text-white hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
                  />
                ))}
              </div>
            </div>

            {/* Bottom 3 tiles */}
            <div className="flex overflow-x-auto sm:grid sm:grid-cols-3 gap-2 flex-1 pb-1 sm:pb-0 scrollbar-hide snap-x">
              {bottomTiles.map(tile => (
                <Link
                  key={tile.title}
                  href={tile.href}
                  className={`relative shrink-0 w-[150px] sm:w-auto rounded-lg overflow-hidden bg-gradient-to-br ${tile.bg} p-3 flex flex-col justify-between hover:opacity-90 hover:scale-[1.02] transition-all duration-200 group snap-start`}
                >
                  <div>
                    <div className="text-xl mb-0.5">{tile.icon}</div>
                    <p className="text-white font-bold text-xs leading-tight">{tile.title}</p>
                    <p className="text-white/70 text-[10px] mt-0.5 line-clamp-1">{tile.sub}</p>
                  </div>
                  <div className="flex items-center gap-1 text-white/80 text-[10px] font-medium mt-2">
                    <span>Xem ngay</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Right: 2 promo tiles ── */}
          <div className="hidden xl:flex w-[200px] shrink-0 flex-col gap-2">
            {promoTiles.map(tile => (
              <Link
                key={tile.label}
                href={tile.href}
                className={`relative flex-1 rounded-lg overflow-hidden bg-gradient-to-br ${tile.bg} p-4 flex flex-col justify-between hover:opacity-90 hover:scale-[1.02] transition-all duration-200 group min-h-[165px]`}
              >
                <div>
                  <span className="inline-block text-xs font-bold bg-yellow-400 text-gray-900 rounded px-2 py-0.5 mb-2">
                    {tile.badge}
                  </span>
                  <p className="text-white font-bold text-sm leading-snug">{tile.label}</p>
                  <p className="text-white/70 text-xs mt-1">{tile.sub}</p>
                </div>
                <div className="flex items-center gap-1 text-white/80 text-xs font-medium mt-2">
                  <span>Xem ngay</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
                {/* Decorative circle */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Trust bar ── */}
      <div className="bg-white border-t border-b border-gray-200 mt-2">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-around py-2.5">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-semibold text-gray-700 px-2">
                <span className="text-base">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
