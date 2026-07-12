import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { prisma as db } from '@/lib/db';
import { FaqClient } from './faq-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Câu hỏi thường gặp | Máy Văn Phòng Xanh',
  description: 'Tìm kiếm các câu trả lời cho các vấn đề thường gặp tại Máy Văn Phòng Xanh',
};

export const dynamic = 'force-dynamic'; // Đảm bảo luôn lấy dữ liệu mới nhất (hoặc cấu hình revalidate)

export default async function FAQPage() {
  const faqs = await db.faq.findMany({
    where: { isActive: true },
    orderBy: [
      { category: 'asc' },
      { order: 'asc' }
    ]
  });

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="py-12 md:py-16 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Câu hỏi thường gặp (FAQs)</h1>
          <p className="text-lg text-gray-600">Tìm kiếm các câu trả lời cho những câu hỏi thường gặp về sản phẩm và dịch vụ của chúng tôi</p>
        </div>
      </section>

      <FaqClient data={faqs} />

      <Footer />
    </main>
  );
}
