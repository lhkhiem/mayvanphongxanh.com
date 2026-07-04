'use client';

import React from 'react';
import { Clock, Phone, Headphones, Wrench, Building2 } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export function SupportSidebar() {
  const { getSetting } = useSettings();

  const workTime = getSetting('work_time', '08:00 - 17:30 (Thứ 2 - Thứ 7)');
  const hotline = getSetting('contact_phone', '0987.654.321');
  const cskh = getSetting('cskh_phone', '1900 1234 (Nhánh 1)');
  const techSupport = getSetting('technical_phone', '1900 1234 (Nhánh 2)');
  const bankAccount = getSetting('bank_account', '1023456789');
  const bankOwner = getSetting('bank_owner', 'CÔNG TY TNHH MÁY VĂN PHÒNG XANH');
  const bankName = getSetting('bank_name', 'Vietcombank – Chi nhánh Sở Giao Dịch');
  const taxCode = getSetting('tax_code', '0101234567');

  return (
    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-3">
      {/* Box 1: Thời gian làm việc */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-start gap-3 shadow-sm hover:border-primary/30 transition-colors">
        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm mb-0.5">Thời gian làm việc</h4>
          <p className="text-xs text-gray-500">{workTime}</p>
        </div>
      </div>

      {/* Box 2: Hotline */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-start gap-3 shadow-sm hover:border-primary/30 transition-colors">
        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
          <Phone className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm mb-0.5">Hotline / Zalo</h4>
          <p className="text-xs text-gray-500">{hotline}</p>
        </div>
      </div>

      {/* Box 3: CSKH */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-start gap-3 shadow-sm hover:border-primary/30 transition-colors">
        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
          <Headphones className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm mb-0.5">CSKH & Bảo hành</h4>
          <p className="text-xs text-gray-500">{cskh}</p>
        </div>
      </div>

      {/* Box 4: Kỹ thuật */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-start gap-3 shadow-sm hover:border-primary/30 transition-colors">
        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
          <Wrench className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm mb-0.5">Hỗ trợ Kỹ thuật</h4>
          <p className="text-xs text-gray-500">{techSupport}</p>
        </div>
      </div>

      {/* Box 5: Thông tin thanh toán */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-1">
        <div className="bg-[#4a8a50] px-4 py-3 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <h4 className="font-bold text-white text-sm">Thông tin thanh toán</h4>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-green-50/50 p-3 rounded-lg border border-green-100/50 flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium whitespace-nowrap">Số tài khoản:</span>
            <span className="text-lg font-bold text-[#4a8a50] tracking-wide">{bankAccount}</span>
          </div>
          
          <div className="space-y-3 text-xs">
            <div>
              <p className="text-gray-500 mb-0.5">Chủ tài khoản:</p>
              <p className="font-bold text-gray-900 uppercase">{bankOwner}</p>
            </div>
            <div className="h-px w-full bg-gray-100" />
            <div>
              <p className="text-gray-500 mb-0.5">Ngân hàng:</p>
              <p className="font-bold text-gray-900">{bankName}</p>
            </div>
            <div className="h-px w-full bg-gray-100" />
            <div>
              <p className="text-gray-500 mb-0.5">Mã số thuế:</p>
              <p className="font-bold text-gray-900">{taxCode}</p>
            </div>
          </div>
          
          <div className="pt-2 flex justify-center gap-4 text-gray-400 font-bold italic opacity-70">
            <span>Vietcombank</span>
            <span>NAPAS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
