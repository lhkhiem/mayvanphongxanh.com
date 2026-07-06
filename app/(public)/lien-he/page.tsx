'use client';

import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  Building2, 
  Send,
  ExternalLink,
  ChevronRight,
  Clock,
  HeadphonesIcon,
  MessageCircle,
  Wrench,
  Loader2
} from 'lucide-react';
import { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { toast } from 'sonner';

export default function ContactPage() {
  const { getSetting } = useSettings();
  
  const workTime = getSetting('work_time', '08:00 - 17:30 (Thứ 2 - Thứ 7)');
  const hotline = getSetting('contact_phone', '0987.654.321');
  const cskh = getSetting('cskh_phone', '1900 1234 (Nhánh 1)');
  const techSupport = getSetting('technical_phone', '1900 1234 (Nhánh 2)');
  const bankAccount = getSetting('bank_account', '1023456789');
  const bankOwner = getSetting('bank_owner', 'CÔNG TY TNHH MÁY VĂN PHÒNG XANH');
  const bankName = getSetting('bank_name', 'Vietcombank – Chi nhánh Sở Giao Dịch');
  const taxCode = getSetting('tax_code', '0101234567');
  
  const rawMapUrl = getSetting('contact_maps_url', '');
  const defaultEmbed = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.096814183571!2d105.78003371540232!3d21.028811885998316!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab86cece9ac1%3A0xa9bc04e0460289f5!2zSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1689000000000!5m2!1svi!2s';
  
  let iframeSrc = defaultEmbed;
  let directionLink = 'https://www.google.com/maps';

  if (rawMapUrl) {
    if (rawMapUrl.includes('<iframe')) {
      // User pasted the whole iframe HTML, extract src
      const match = rawMapUrl.match(/src="([^"]+)"/);
      if (match) iframeSrc = match[1];
    } else if (rawMapUrl.includes('embed')) {
      // User pasted the embed URL
      iframeSrc = rawMapUrl;
    } else {
      // User pasted a standard map link, it cannot be embedded.
      // We keep the default embed map but update the direction link.
      directionLink = rawMapUrl;
    }
  }

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: 'Báo giá sản phẩm',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể!');
        setFormData({ name: '', phone: '', service: 'Báo giá sản phẩm', message: '' });
      } else {
        toast.error(data.error || 'Đã có lỗi xảy ra.');
      }
    } catch (error) {
      toast.error('Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 bg-slate-50/50 pb-20">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 max-w-7xl pt-6">
          <nav className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Trang chủ</Link>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className="text-foreground">Liên hệ</span>
          </nav>
        </div>

        {/* 1. Map Section */}
        <section className="container mx-auto px-4 max-w-7xl mt-6">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-primary">Bản đồ</p>
                <h2 className="mt-1 text-2xl font-bold text-foreground">Vị trí Máy Văn Phòng Xanh</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Tư vấn và triển khai công nghệ cho doanh nghiệp</p>
              </div>
              <a 
                href={directionLink} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 shadow-sm"
              >
                Chỉ đường <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            
            {/* Embedded Google Map */}
            <iframe 
              className="h-[300px] w-full border-0 sm:h-[400px] lg:h-[480px]" 
              src={iframeSrc} 
              title="Vị trí Máy Văn Phòng Xanh" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>

        {/* 2. Contact Form & Info Sidebar */}
        <section className="container mx-auto px-4 max-w-7xl mt-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Gửi yêu cầu tư vấn</h2>
              
              <div className="grid gap-5 sm:grid-cols-2 mb-5">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-foreground">Họ tên *</label>
                  <input 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-12 rounded-md border border-input px-4 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background" 
                    placeholder="Nhập họ tên" 
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-foreground">Số điện thoại *</label>
                  <input 
                    required 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="h-12 rounded-md border border-input px-4 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background" 
                    placeholder="0987..." 
                  />
                </div>
              </div>

              <div className="grid gap-2 mb-5">
                <label className="text-sm font-semibold text-foreground">Nhu cầu</label>
                <select 
                  value={formData.service}
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                  className="h-12 rounded-md border border-input px-4 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background"
                >
                  <option value="Báo giá sản phẩm">Báo giá sản phẩm</option>
                  <option value="Tư vấn giải pháp">Tư vấn giải pháp</option>
                  <option value="Hỗ trợ kỹ thuật">Hỗ trợ kỹ thuật</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div className="grid gap-2 mb-6">
                <label className="text-sm font-semibold text-foreground">Nội dung *</label>
                <textarea 
                  required 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="min-h-[140px] rounded-md border border-input p-4 font-normal outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background resize-y" 
                  placeholder="Mô tả sản phẩm, số lượng, khu vực triển khai..."
                ></textarea>
              </div>

              <button 
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-primary px-8 text-sm font-bold text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </form>

            {/* Sidebar */}
            <aside className="grid gap-4">
              {/* Quick Contacts */}
              <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="w-6 h-6" />
                </span>
                <div>
                  <h2 className="font-bold text-foreground">Thời gian làm việc</h2>
                  <p className="text-sm font-medium text-muted-foreground mt-0.5">{workTime}</p>
                </div>
              </div>

              <a href="tel:0987654321" className="block group">
                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <PhoneCall className="w-6 h-6" />
                  </span>
                  <div>
                    <h2 className="font-bold text-foreground">Hotline / Zalo</h2>
                    <p className="text-sm font-medium text-muted-foreground mt-0.5">{hotline}</p>
                  </div>
                </div>
              </a>

              <a href="tel:19001234" className="block group">
                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <HeadphonesIcon className="w-6 h-6" />
                  </span>
                  <div>
                    <h2 className="font-bold text-foreground">CSKH & Bảo hành</h2>
                    <p className="text-sm font-medium text-muted-foreground mt-0.5">{cskh}</p>
                  </div>
                </div>
              </a>

              <a href="tel:19001234" className="block group">
                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all group-hover:border-primary/40 group-hover:shadow-md">
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Wrench className="w-6 h-6" />
                  </span>
                  <div>
                    <h2 className="font-bold text-foreground">Hỗ trợ Kỹ thuật</h2>
                    <p className="text-sm font-medium text-muted-foreground mt-0.5">{techSupport}</p>
                  </div>
                </div>
              </a>

              {/* Bank Info */}
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-md mt-2">
                <div className="flex items-center gap-3 bg-gradient-to-r from-primary to-primary/80 px-6 py-4 text-primary-foreground">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white/20 ring-1 ring-white/30">
                    <Building2 className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold sm:text-lg">Thông tin thanh toán</h2>
                  </div>
                </div>
                
                <div className="p-6">
                  <dl className="space-y-4 text-sm text-foreground">
                    <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                      <dt className="inline font-semibold">Số tài khoản: </dt>
                      <dd className="inline text-xl font-extrabold tracking-wider text-primary ml-1">{bankAccount}</dd>
                    </div>
                    <div className="border-b border-border pb-3 flex flex-col gap-1">
                      <dt className="font-semibold text-muted-foreground">Chủ tài khoản: </dt>
                      <dd className="font-bold uppercase">{bankOwner}</dd>
                    </div>
                    <div className="border-b border-border pb-3 flex flex-col gap-1">
                      <dt className="font-semibold text-muted-foreground">Ngân hàng: </dt>
                      <dd className="font-bold">{bankName}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="font-semibold text-muted-foreground">Mã số thuế: </dt>
                      <dd className="font-bold">{taxCode}</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="flex items-center justify-center gap-6 border-t border-border bg-slate-50 px-6 py-4">
                  {/* Bank Logos Placeholders */}
                  <div className="h-8 flex items-center justify-center font-black text-slate-400 italic text-xl tracking-tighter">
                    Vietcombank
                  </div>
                  <div className="h-8 flex items-center justify-center font-black text-slate-400 italic text-xl tracking-widest">
                    NAPAS
                  </div>
                </div>
              </div>
            </aside>

          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
