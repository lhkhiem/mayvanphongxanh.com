'use client';

import { useState, useEffect } from 'react';
import { Phone, ArrowUp, MessageCircle, X } from 'lucide-react';
import Link from 'next/link';

export function FloatingActionButtons() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="fixed bottom-5 right-4 md:right-5 z-50 flex flex-col items-end gap-2">

      {/* Contact panel */}
      {panelOpen && (
        <div className="mb-1 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-primary px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Liên hệ hỗ trợ</span>
            <button onClick={() => setPanelOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zalo */}
          <a
            href="https://zalo.me/0987654321"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">Zalo</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Tư vấn Zalo</p>
              <p className="text-[10px] text-gray-500">08:30 – 21:00</p>
            </div>
          </a>

          {/* Messenger */}
          <a
            href="https://m.me/mayvanphongxanh"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Chat Facebook</p>
              <p className="text-[10px] text-gray-500">08:30 – 21:00</p>
            </div>
          </a>

          {/* Phone */}
          <a
            href="tel:0987654321"
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Gọi điện ngay</p>
              <p className="text-[10px] text-green-600 font-semibold">0987.654.321</p>
            </div>
          </a>

          {/* Online badge */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-green-600">Đang hỗ trợ Online</span>
          </div>
        </div>
      )}

      {/* Toggle button (always visible) */}
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        className="relative w-12 h-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 hover:scale-105 transition-all duration-200 flex items-center justify-center"
        aria-label="Hỗ trợ"
      >
        {/* Ping animation */}
        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />
        {panelOpen ? (
          <X className="w-5 h-5 relative z-10" />
        ) : (
          <Phone className="w-5 h-5 relative z-10" />
        )}
        {/* Online dot */}
        <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full z-20" />
      </button>

      {/* Scroll to top */}
      <button
        onClick={scrollToTop}
        className={`w-12 h-12 rounded-full bg-white border border-gray-200 text-gray-600 shadow-md flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Lên đầu trang"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}
