'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Clock, Send, ArrowRight, Shield, Truck, Award, Loader2 } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const quickLinks = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Sản phẩm', href: '/san-pham' },
  { label: 'Giải pháp', href: '/lien-he' },
  { label: 'Dự án tiêu biểu', href: '/du-an' },
  { label: 'Tin tức', href: '/tin-tuc' },
  { label: 'Về chúng tôi', href: '/gioi-thieu' },
];

const supportLinks = [
  { label: 'Liên hệ hỗ trợ', href: '/lien-he' },
  { label: 'Tra cứu đơn hàng', href: '/tra-cuu-don-hang' },
  { label: 'Tra cứu bảo hành', href: '/tra-cuu-bao-hanh' },
  { label: 'Câu hỏi thường gặp', href: '/hoi-dap' },
  { label: 'Trung tâm trợ giúp', href: '/ho-tro' },
  { label: 'Chính sách bảo hành', href: '/chinh-sach-bao-mat' }, // assuming we don't have a separate policy page yet
  { label: 'So sánh sản phẩm', href: '/so-sanh' },
];



export function Footer() {
  const { getSetting } = useSettings();
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{label: string, href: string}[]>([
    { label: 'Máy in các loại', href: '/danh-muc/may-in' },
    { label: 'Vật tư & Mực in', href: '/danh-muc/vat-tu' },
    { label: 'Hệ thống POS', href: '/danh-muc/he-thong-pos' },
    { label: 'Thiết bị mạng', href: '/danh-muc/mang-vien-thong' },
    { label: 'Thiết bị văn phòng', href: '/danh-muc/thiet-bi' },
    { label: 'Gói dịch vụ', href: '/danh-muc/goi-dich-vu' },
  ]);

  useEffect(() => {
    fetch('/api/categories/footer')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data.map(c => ({ label: c.name, href: `/danh-muc/${c.slug}` })));
        }
      })
      .catch(err => console.error('Lỗi fetch danh mục footer:', err));
  }, []);

  const handleSubscribe = async () => {
    if (!subscriberEmail || !subscriberEmail.includes('@')) {
      toast.error('Vui lòng nhập email hợp lệ!');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscriberEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Đăng ký nhận tin thành công!');
        setSubscriberEmail('');
      } else {
        toast.error(data.error || 'Đã có lỗi xảy ra.');
      }
    } catch (error) {
      toast.error('Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  const companyName = getSetting('company_name', 'Công ty TNHH Máy Văn Phòng Xanh');
  const companyDescription = getSetting('company_description', 'Đối tác tin cậy cung cấp thiết bị văn phòng, máy in, giải pháp CNTT...');
  const address = getSetting('contact_address', '123 Đường Văn Phòng, Quận ABC, TP.HCM');
  const phone = getSetting('contact_phone', '0987.654.321');
  const email = getSetting('contact_email', 'support@mayvanphongxanh.com');
  const workTime = getSetting('work_time', 'Thứ 2 – Thứ 7 | 08:00 – 17:30');
  const technicalPhone = getSetting('technical_phone', '1900 1234');
  const siteLogo = getSetting('site_logo', '/logo.png');

  const fbLink = getSetting('social_facebook', '');
  const youtubeLink = getSetting('social_youtube', '');
  
  const zaloRaw = getSetting('contact_zalo', '');
  const zaloLink = zaloRaw ? (zaloRaw.startsWith('http') ? zaloRaw : `https://zalo.me/${zaloRaw.replace(/[\.\s]/g, '')}`) : '#';

  const finalFbLink = fbLink ? (fbLink.startsWith('http') ? fbLink : `https://facebook.com/${fbLink}`) : '#';
  const finalYoutubeLink = youtubeLink ? (youtubeLink.startsWith('http') ? youtubeLink : `https://youtube.com/${youtubeLink}`) : '#';

  return (
    <footer className="bg-[#1a2e1c] text-gray-300">
      {/* Top promo bar */}
      <div className="bg-primary/20 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Shield, label: 'Sản phẩm chính hãng', sub: 'Cam kết 100% hàng thật' },
              { icon: Truck, label: 'Giao hàng toàn quốc', sub: 'Nhanh chóng, đúng hẹn' },
              { icon: Award, label: 'Bảo hành chính thức', sub: 'Hỗ trợ kỹ thuật 24/7' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Company Info */}
          <div className="lg:col-span-1">
            <div className="relative w-40 h-[45px] mb-4 overflow-hidden mix-blend-screen">
              <Image src={siteLogo} alt={companyName} fill className="object-contain object-left invert grayscale brightness-200" />
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">{companyDescription}</p>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                <span className="text-gray-400">{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-green-400 shrink-0" />
                <a href={`tel:${phone.replace(/[\.\s]/g, '')}`} className="text-gray-400 hover:text-white transition-colors">{phone}</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-green-400 shrink-0" />
                <a href={`mailto:${email}`} className="text-gray-400 hover:text-white transition-colors">
                  {email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-green-400 shrink-0" />
                <span className="text-gray-400">{workTime}</span>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex gap-2.5 mt-5">
              {[
                { icon: FacebookIcon, href: finalFbLink, label: 'Facebook', color: 'hover:bg-blue-600 hover:border-blue-600' },
                { icon: YoutubeIcon, href: finalYoutubeLink, label: 'Youtube', color: 'hover:bg-red-600 hover:border-red-600' },
                { icon: Send, href: zaloLink, label: 'Zalo', color: 'hover:bg-blue-500 hover:border-blue-500' },
              ].map(({ icon: Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all ${color}`}
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Danh mục */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-primary rounded-full" />
              Danh mục sản phẩm
            </h4>
            <ul className="space-y-2">
              {categories.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3 text-primary/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Quick links + Support */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-primary rounded-full" />
              Liên kết nhanh
            </h4>
            <ul className="space-y-2 mb-5">
              {quickLinks.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 group">
                    <ArrowRight className="w-3 h-3 text-primary/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-primary rounded-full" />
              Hỗ trợ khách hàng
            </h4>
            <ul className="space-y-2">
              {supportLinks.slice(0, 4).map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 group">
                    <ArrowRight className="w-3 h-3 text-primary/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-primary rounded-full" />
              Đăng ký nhận tin
            </h4>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Nhận ngay thông tin khuyến mãi, sản phẩm mới và kiến thức văn phòng hữu ích.
            </p>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                value={subscriberEmail}
                onChange={(e) => setSubscriberEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                className="w-full px-3 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-primary/60 transition-colors"
              />
              <button 
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
              </button>
            </div>

            {/* Hotline card */}
            <div className="mt-5 bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Hỗ trợ kỹ thuật</p>
              <a href={`tel:${technicalPhone.replace(/[\.\s]/g, '')}`} className="text-lg font-bold text-green-400 hover:text-green-300 transition-colors block">
                {technicalPhone}
              </a>
              <p className="text-[10px] text-gray-500 mt-0.5">{workTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-500">
            © 2024 {companyName}. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link href="/chinh-sach-bao-mat" className="hover:text-gray-300 transition-colors">Chính sách bảo mật</Link>
            <Link href="/dieu-khoan-su-dung" className="hover:text-gray-300 transition-colors">Điều khoản sử dụng</Link>
            <Link href="/chinh-sach-cookie" className="hover:text-gray-300 transition-colors">Cookie</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
