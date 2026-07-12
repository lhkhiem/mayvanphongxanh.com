"use client";

import { useState } from "react";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

type Faq = {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  order: number;
};

interface FaqSectionProps {
  faqs: Faq[];
}

export function FaqSection({ faqs }: FaqSectionProps) {
  const [openId, setOpenId] = useState<number | null>(faqs.length > 0 ? faqs[0].id : null);

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <MessageCircleQuestion className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Câu hỏi thường gặp
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Giải đáp nhanh chóng các thắc mắc của bạn về sản phẩm, dịch vụ và chính sách tại Máy Văn Phòng Xanh.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <div
                key={faq.id}
                className={cn(
                  "border border-slate-200 rounded-xl bg-white overflow-hidden transition-all duration-300 shadow-sm",
                  isOpen ? "ring-2 ring-primary/20 border-primary/30" : "hover:border-slate-300"
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none"
                >
                  <span className={cn(
                    "text-lg font-semibold transition-colors duration-200",
                    isOpen ? "text-primary" : "text-slate-800"
                  )}>
                    {faq.question}
                  </span>
                  <div className={cn(
                    "ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300",
                    isOpen ? "bg-primary text-white rotate-180" : "bg-slate-100 text-slate-500"
                  )}>
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </button>
                
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-100 mt-2">
                      <div className="pt-4">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
