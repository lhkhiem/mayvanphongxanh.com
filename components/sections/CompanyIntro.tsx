'use client';

import Link from 'next/link';
import { CheckCircle2, Award, MapPin, Clock } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

const DEFAULT_FEATURES = [
  'Thiết bị cấp doanh nghiệp, chính hãng 100%',
  'Hỗ trợ kỹ thuật tận nơi trong vòng 2 giờ',
  'Vật tư có chứng nhận, bảo hành chính thức',
  'Giá sỉ cạnh tranh, chiết khấu đại lý hấp dẫn',
  'Hợp đồng bảo trì định kỳ toàn diện',
];

export function CompanyIntro() {
  const { getSetting } = useSettings();
  const companyName = getSetting('company_name', 'CÔNG TY TNHH MÁY VĂN PHÒNG XANH');
  const companyTagline = getSetting('company_tagline', 'Thiết bị Văn phòng & Dịch vụ Kỹ thuật Chuyên nghiệp');
  const companyMission = getSetting(
    'company_mission',
    getSetting('company_description', 'Trao quyền cho doanh nghiệp bằng các giải pháp thiết bị văn phòng chất lượng, dịch vụ tận tâm và giá cả cạnh tranh.')
  );
  
  const address = getSetting('contact_address', '123 Đường Chính, Quận 1, TP. Hồ Chí Minh');
  const workTime = getSetting('work_time', getSetting('work_hours', 'Thứ 2 – Thứ 7: 08:00 – 17:30'));

  const rawFeatures = getSetting('company_features');
  let features = DEFAULT_FEATURES;
  if (rawFeatures && rawFeatures.trim()) {
    features = rawFeatures.split('\n').map((s) => s.trim()).filter(Boolean);
  }

  // Stats: support stat1_val..stat4_val or fallback JSON company_stats or DEFAULT_STATS
  let stats = [
    { value: getSetting('stat1_val', ''), label: getSetting('stat1_label', '') },
    { value: getSetting('stat2_val', ''), label: getSetting('stat2_label', '') },
    { value: getSetting('stat3_val', ''), label: getSetting('stat3_label', '') },
    { value: getSetting('stat4_val', ''), label: getSetting('stat4_label', '') },
  ].filter(s => s.value && s.label);

  if (stats.length === 0) {
    const statsString = getSetting('company_stats');
    if (statsString) {
      try {
        const parsed = JSON.parse(statsString);
        if (Array.isArray(parsed) && parsed.length > 0) {
          stats = parsed;
        }
      } catch(e){}
    }
  }

  if (stats.length === 0) {
    stats = [
      { value: '8.000+', label: 'Máy in đã lắp đặt' },
      { value: '2.500+', label: 'Khách hàng Doanh nghiệp' },
      { value: '15+', label: 'Tỉnh thành phục vụ' },
      { value: '14', label: 'Năm kinh nghiệm' },
    ];
  }

  return (
    <section className="py-10 bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1 h-6 rounded-full bg-primary inline-block" />
              <Award className="w-5 h-5 text-primary" />
              <span className="text-sm font-bold text-primary uppercase tracking-wide">Về chúng tôi</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-snug">
              {companyName}
            </h2>
            <p className="text-gray-500 text-sm mb-1">{companyTagline}</p>
            <p className="text-gray-600 mb-6 leading-relaxed whitespace-pre-line">{companyMission}</p>

            <div className="space-y-2.5 mb-6">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700">{f}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Link
                href="/gioi-thieu"
                className="px-6 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Tìm hiểu thêm
              </Link>
              <Link
                href="/lien-he"
                className="px-6 py-2.5 border border-primary text-primary rounded-lg font-semibold text-sm hover:bg-primary/5 transition-colors"
              >
                Liên hệ ngay
              </Link>
            </div>
          </div>

          {/* Right: Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat: any, i: number) => (
              <div
                key={i}
                className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-5 text-center hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <p className="text-3xl md:text-4xl font-extrabold text-primary mb-1">{stat.value}</p>
                <p className="text-sm font-semibold text-gray-700">{stat.label}</p>
              </div>
            ))}

            {/* Extra info card */}
            <div className="col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-0.5">Văn phòng giao dịch</p>
                <p className="text-xs text-gray-500">{address}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Clock className="w-3 h-3 text-primary" />
                  <span className="text-xs text-gray-500">{workTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

