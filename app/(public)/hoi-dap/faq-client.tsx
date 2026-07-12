'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  id: number;
  category: string | null;
  question: string;
  answer: string;
}

export function FaqClient({ data }: { data: FAQItem[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  // Lọc ra các danh mục duy nhất
  const categories = ['Tất cả', ...Array.from(new Set(data.map((item) => item.category || 'Chung')))];
  
  const filteredFAQ = selectedCategory === 'Tất cả' 
    ? data 
    : data.filter((item) => (item.category || 'Chung') === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full font-semibold transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQ.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Không có câu hỏi nào trong danh mục này.</div>
        ) : (
          filteredFAQ.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-primary transition-colors"
            >
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-1 pr-4">
                  <p className="text-xs font-semibold text-primary mb-1">{(item.category || 'Chung').toUpperCase()}</p>
                  <h3 className="font-semibold text-gray-900">{item.question}</h3>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                    expandedId === item.id ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              {expandedId === item.id && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-gray-700 whitespace-pre-wrap">
                  {item.answer}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Still need help? */}
      <div className="mt-16 p-8 bg-primary/5 border border-primary/20 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Chưa tìm thấy câu trả lời?</h2>
        <p className="text-gray-600 mb-6">Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng. Hãy liên hệ trực tiếp với chúng tôi.</p>
        <a
          href="/lien-he"
          className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm"
        >
          Liên hệ Hỗ trợ
        </a>
      </div>
    </div>
  );
}
