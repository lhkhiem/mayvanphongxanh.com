'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Quote, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';

export function CustomerReviews({ testimonials = [] }: { testimonials?: any[] }) {
  const [current, setCurrent] = useState(0);
  const total = testimonials.length;

  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p + 1) % total), 5000);
    return () => clearInterval(t);
  }, [total]);

  // Show 3 at a time on desktop
  const getVisible = () => {
    const items = [];
    for (let i = 0; i < 3; i++) {
      items.push(testimonials[(current + i) % total]);
    }
    return items;
  };

  return (
    <section className="py-8 bg-gradient-to-b from-[#F4F7F6] to-[#E8F0EA] border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between gap-3 mb-4 sm:mb-5">
          <div className="flex items-start sm:items-center gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 mt-0.5 sm:mt-0">
              <span className="w-1 sm:w-1.5 h-5 sm:h-6 rounded-full bg-primary inline-block" />
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 leading-snug">
              Khách hàng nói gì về chúng tôi
            </h2>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 mt-0.5 sm:mt-0">
            <button
              onClick={() => setCurrent(p => (p - 1 + total) % total)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors shrink-0"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setCurrent(p => (p + 1) % total)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors shrink-0"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getVisible().map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200 flex flex-col relative"
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-primary/10 absolute top-4 right-4" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4"
                    fill={j < Math.floor(t.rating) ? '#FFA726' : '#E0E0E0'}
                    color={j < Math.floor(t.rating) ? '#FFA726' : '#E0E0E0'}
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1.5 font-semibold">{t.rating}</span>
              </div>

              {/* Content */}
              <p className="text-sm text-gray-700 italic leading-relaxed flex-1 mb-4 line-clamp-4">
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-primary/20">
                  <Image src={t.image} alt={t.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{t.name}</p>
                  <p className="text-[10px] text-gray-500 line-clamp-1">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'w-5 h-2 bg-primary' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
