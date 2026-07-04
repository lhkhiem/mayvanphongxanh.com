import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Calendar, User, ArrowLeft, Share2, Tag } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) {
    return {
      title: 'Không tìm thấy bài viết',
    };
  }
  return {
    title: `${post.title} | Máy Văn Phòng Xanh`,
    description: post.excerpt,
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dbPost = await prisma.post.findUnique({
    where: { slug },
    include: { category: true }
  });
  
  if (!dbPost) {
    notFound();
  }

  const post = {
    ...dbPost,
    date: new Date(dbPost.publishedAt || dbPost.createdAt).toLocaleDateString('vi-VN'),
    category: dbPost.category?.name || 'Tin tức',
    image: dbPost.image || '/placeholder.jpg'
  };

  const dbRelated = await prisma.post.findMany({
    where: { isActive: true, id: { not: dbPost.id } },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    take: 3
  });

  const relatedPosts = dbRelated.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    image: p.image || '/placeholder.jpg',
    date: new Date(p.publishedAt || p.createdAt).toLocaleDateString('vi-VN'),
    category: p.category?.name || 'Tin tức',
  }));



  return (
    <>
      <Header />
      <main className="bg-[#f8f9fa] min-h-screen font-sans pb-20">
        <article>
          {/* Breadcrumb & Meta */}
          <div className="container mx-auto px-4 pt-8 pb-6">
            <Link href="/tin-tuc" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-primary mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại Tin tức
            </Link>
            
            <div className="max-w-4xl mx-auto">
              <div className="mb-4 flex items-center gap-2">
                <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {post.category}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0d2a45] leading-tight mb-6">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center text-sm text-gray-500 gap-6 border-b border-gray-200 pb-6 mb-8">
                <span className="flex items-center"><User className="w-4 h-4 mr-2" /> Ban biên tập MVPX</span>
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> {post.date}</span>
                <span className="flex items-center ml-auto text-primary cursor-pointer hover:text-[#0d2a45] transition-colors"><Share2 className="w-4 h-4 mr-2" /> Chia sẻ</span>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="container mx-auto px-4 mb-12">
            <div className="max-w-5xl mx-auto relative h-[400px] md:h-[500px] lg:h-[600px] w-full rounded-2xl overflow-hidden shadow-lg">
              <Image 
                src={post.image} 
                alt={post.title} 
                fill 
                className="object-cover" 
                priority
              />
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="lead text-xl font-medium text-gray-900 mb-8">
                  {post.excerpt}
                </p>
                <div dangerouslySetInnerHTML={{ __html: post.content || '' }} />
              </div>
              
              <div className="mt-12 pt-8 border-t border-gray-100 flex items-center gap-3">
                <Tag className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-semibold text-gray-600">Tags:</span>
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-colors cursor-pointer">{post.category}</span>
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-colors cursor-pointer">Giải pháp doanh nghiệp</span>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        <div className="container mx-auto px-4 mt-20">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold text-[#0d2a45] mb-8 border-b border-gray-200 pb-4">Bài viết liên quan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map(relatedPost => (
                <div key={relatedPost.id} className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <Link href={`/blog/tin-tuc/${relatedPost.slug}`} className="block relative h-48 w-full overflow-hidden">
                    <Image src={relatedPost.image} alt={relatedPost.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>
                  <div className="p-5">
                    <span className="text-primary text-[10px] font-bold uppercase tracking-wider mb-2 block">{relatedPost.category}</span>
                    <h4 className="font-bold text-[#0d2a45] text-lg leading-snug group-hover:text-primary transition-colors mb-3 line-clamp-2">
                      <Link href={`/blog/tin-tuc/${relatedPost.slug}`}>{relatedPost.title}</Link>
                    </h4>
                    <span className="flex items-center text-xs text-gray-500"><Calendar className="w-3.5 h-3.5 mr-1" /> {relatedPost.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
