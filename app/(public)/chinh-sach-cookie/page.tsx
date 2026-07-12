import { notFound } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { prisma as db } from '@/lib/db';
import { Metadata } from 'next';

const SLUG = 'chinh-sach-cookie';

export async function generateMetadata(): Promise<Metadata> {
  const page = await db.page.findUnique({
    where: { slug: SLUG, isActive: true },
  });

  if (!page) {
    return { title: 'Chính sách Cookie | Máy Văn Phòng Xanh' };
  }

  return {
    title: page.metaTitle || `${page.title} | Máy Văn Phòng Xanh`,
    description: page.metaDescription || `Đọc ${page.title} của Máy Văn Phòng Xanh để hiểu rõ hơn về dịch vụ của chúng tôi.`,
    keywords: page.metaKeywords || '',
  };
}

export default async function CookiePolicyPage() {
  const page = await db.page.findUnique({
    where: { slug: SLUG, isActive: true },
  });

  if (!page) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 py-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Chính sách Cookie</h1>
            <p className="text-muted-foreground">Nội dung đang được cập nhật. Vui lòng quay lại sau.</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-card rounded-2xl shadow-sm border border-border p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-foreground pb-6 border-b border-border">
              {page.title}
            </h1>
            
            {page.content ? (
              <div 
                className="prose prose-slate dark:prose-invert max-w-none 
                prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl
                prose-a:text-primary hover:prose-a:text-primary/80 prose-a:no-underline
                prose-img:rounded-xl prose-img:shadow-sm"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            ) : (
              <p className="text-muted-foreground">Nội dung đang được cập nhật.</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
