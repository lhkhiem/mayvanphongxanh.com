import type { Metadata } from 'next';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { ShareButtons } from '@/components/blog/share-buttons';
import { Calendar, User, ArrowLeft, Folder } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.replace(/\.html$/, '');
  const post = await prisma.post.findFirst({
    where: { slug, isActive: true },
    include: { category: true }
  });

  if (!post) {
    return {
      title: 'Không tìm thấy bài viết | Máy Văn Phòng Xanh',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mayvanphongxanh.com';
  
  const isCustom = post.isSeoCustom;

  const defaultTitle = `${post.title} | Máy Văn Phòng Xanh`;
  const defaultDesc = post.excerpt?.trim() || `Đọc bài viết "${post.title}" tại Máy Văn Phòng Xanh`;
  const defaultKeywords = `${post.title}, tin tức máy văn phòng xanh, blog máy văn phòng xanh`;

  const title = (isCustom && post.metaTitle?.trim())
    ? post.metaTitle.trim()
    : defaultTitle;

  const description = (isCustom && post.metaDescription?.trim())
    ? post.metaDescription.trim()
    : defaultDesc;

  const keywords = (isCustom && post.metaKeywords?.trim())
    ? post.metaKeywords.trim()
    : defaultKeywords;

  const pageUrl = `${baseUrl}/tin-tuc/${post.slug}`;

  // Đảm bảo URL ảnh luôn là tuyệt đối (https://...) cho Facebook/Zalo crawler
  let absoluteImageUrl = `${baseUrl}/placeholder.jpg`;
  if (post.image) {
    if (post.image.startsWith('http://') || post.image.startsWith('https://')) {
      absoluteImageUrl = post.image;
    } else {
      absoluteImageUrl = `${baseUrl}${post.image.startsWith('/') ? '' : '/'}${post.image}`;
    }
  }

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Máy Văn Phòng Xanh',
      type: 'article',
      publishedTime: (post.publishedAt || post.createdAt).toISOString(),
      authors: ['Ban biên tập Máy Văn Phòng Xanh'],
      section: post.category?.name || 'Tin tức',
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: 'vi_VN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteImageUrl],
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const slug = rawSlug.replace(/\.html$/, '');
  const dbPost = await prisma.post.findFirst({
    where: { slug, isActive: true },
    include: { category: true }
  });
  
  if (!dbPost) {
    notFound();
  }

  const post = {
    ...dbPost,
    date: new Date(dbPost.publishedAt || dbPost.createdAt).toLocaleDateString('vi-VN'),
    category: dbPost.category?.name || 'Tin tức',
    categorySlug: dbPost.category?.slug,
    image: dbPost.image || '/placeholder.jpg'
  };

  // Lấy các bài viết khác cho Sidebar & Bài viết liên quan
  const allOtherPosts = await prisma.post.findMany({
    where: { isActive: true, id: { not: dbPost.id } },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  const formattedOthers = allOtherPosts.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    image: p.image || '/placeholder.jpg',
    date: new Date(p.publishedAt || p.createdAt).toLocaleDateString('vi-VN'),
    category: p.category?.name || 'Tin tức',
    isTrending: p.isTrending,
  }));

  // Bài viết liên quan (ưu tiên bài cùng danh mục)
  const sameCategoryPosts = formattedOthers.filter(p => p.category === post.category);
  const relatedPosts = (sameCategoryPosts.length >= 3 ? sameCategoryPosts : formattedOthers).slice(0, 3);

  // Sidebar posts
  const latestSidebarPosts = formattedOthers.slice(0, 5);
  const markedTrending = formattedOthers.filter(p => p.isTrending);
  const trendingSidebarPosts = markedTrending.length > 0
    ? Array.from(new Set([...markedTrending, ...formattedOthers])).slice(0, 5)
    : formattedOthers.slice(0, 5);

  return (
    <>
      <Header />
      <main className="bg-[#f8f9fa] min-h-screen font-sans pb-20">
        <div className="mx-auto max-w-7xl px-4 pt-6">
          
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Link href="/tin-tuc" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại Tin tức
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LEFT COLUMN - MAIN ARTICLE */}
            <article className="w-full lg:w-[70%]">
              
              {/* Post Header Info */}
              <div className="mb-3">
                {post.categorySlug ? (
                  <Link 
                    href={`/tin-tuc?category=${post.categorySlug}`}
                    className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider hover:bg-primary hover:text-white transition-colors"
                  >
                    {post.category}
                  </Link>
                ) : (
                  <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {post.category}
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#0d2a45] leading-tight mb-4">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center text-xs md:text-sm text-gray-500 gap-4 md:gap-6 border-b border-gray-200 pb-4 mb-6 justify-between">
                <div className="flex items-center gap-4 md:gap-6 flex-wrap">
                  <span className="flex items-center"><User className="w-4 h-4 mr-2 text-primary" /> Ban biên tập MVPX</span>
                  <span className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-primary" /> {post.date}</span>
                </div>
                <ShareButtons title={post.title} excerpt={post.excerpt || ''} slug={post.slug} />
              </div>

              {/* Featured Banner Image */}
              <div className="relative w-full h-[320px] md:h-[440px] rounded-xl overflow-hidden mb-6 shadow-sm border border-gray-100">
                <Image 
                  src={post.image} 
                  alt={post.title} 
                  fill 
                  className="object-cover" 
                  priority
                />
              </div>

              {/* Main Content Box */}
              <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-200 shadow-sm mb-10">
                <div className="prose prose-lg max-w-none text-gray-700">
                  {post.excerpt && (
                    <p className="lead text-base md:text-lg font-medium text-gray-800 mb-6 pb-6 border-b border-gray-100 leading-relaxed italic">
                      {post.excerpt}
                    </p>
                  )}
                  <div dangerouslySetInnerHTML={{ __html: post.content || '' }} />
                </div>
                
                {/* Article Footer: Category Badge & Share */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">Chuyên mục:</span>
                    {post.categorySlug ? (
                      <Link
                        href={`/tin-tuc?category=${post.categorySlug}`}
                        className="inline-flex items-center gap-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold px-3 py-1 rounded-full transition-colors"
                      >
                        <Folder className="w-3.5 h-3.5" />
                        <span>{post.category}</span>
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
                        <Folder className="w-3.5 h-3.5" />
                        <span>{post.category}</span>
                      </span>
                    )}
                  </div>

                  <ShareButtons title={post.title} excerpt={post.excerpt || ''} slug={post.slug} />
                </div>
              </div>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="mt-8">
                  <h3 className="uppercase text-base md:text-lg font-bold text-[#0d2a45] border-b-2 border-primary pb-2 mb-6">
                    Bài viết liên quan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedPosts.map(relPost => (
                      <div key={relPost.id} className="group bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                        <Link href={`/tin-tuc/${relPost.slug}`} className="block relative h-36 w-full overflow-hidden">
                          <Image src={relPost.image} alt={relPost.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        </Link>
                        <div className="p-4 flex-1 flex flex-col">
                          <span className="text-primary text-[10px] font-bold uppercase tracking-wider mb-1 block">{relPost.category}</span>
                          <h4 className="font-bold text-[#0d2a45] text-sm leading-snug group-hover:text-primary transition-colors mb-2 line-clamp-2">
                            <Link href={`/tin-tuc/${relPost.slug}`}>{relPost.title}</Link>
                          </h4>
                          <div className="mt-auto flex items-center text-xs text-gray-400">
                            <Calendar className="w-3 h-3 mr-1" /> {relPost.date}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </article>

            {/* RIGHT COLUMN - SIDEBAR */}
            <div className="w-full lg:w-[30%] flex flex-col gap-8">
              
              {/* Widget: Bài viết mới nhất */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="uppercase text-base font-bold text-[#0d2a45] border-b-2 border-primary pb-2 mb-4">
                  Bài viết mới nhất
                </h3>
                <div className="flex flex-col gap-4">
                  {latestSidebarPosts.map(p => (
                    <div key={`side-latest-${p.id}`} className="group flex gap-3">
                      <Link href={`/tin-tuc/${p.slug}`} className="block relative w-[80px] h-[60px] shrink-0 overflow-hidden rounded">
                        <Image src={p.image} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      </Link>
                      <div className="flex flex-col justify-center">
                        <h4 className="font-bold text-[#0d2a45] text-xs leading-snug group-hover:text-primary transition-colors mb-1 line-clamp-2">
                          <Link href={`/tin-tuc/${p.slug}`}>{p.title}</Link>
                        </h4>
                        <div className="flex items-center text-[11px] text-gray-400">
                          <Calendar className="w-3 h-3 mr-1" /> {p.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Widget: Bài viết nổi bật */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h3 className="uppercase text-base font-bold text-[#0d2a45] border-b-2 border-primary pb-2 mb-4">
                  Bài viết nổi bật
                </h3>
                
                {trendingSidebarPosts[0] && (
                  <div className="mb-4 group">
                    <Link href={`/tin-tuc/${trendingSidebarPosts[0].slug}`} className="block relative w-full h-[150px] overflow-hidden rounded-lg mb-2">
                      <Image src={trendingSidebarPosts[0].image} alt={trendingSidebarPosts[0].title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </Link>
                    <h4 className="font-bold text-[#0d2a45] text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      <Link href={`/tin-tuc/${trendingSidebarPosts[0].slug}`}>{trendingSidebarPosts[0].title}</Link>
                    </h4>
                  </div>
                )}
                
                <div className="flex flex-col">
                  {trendingSidebarPosts.map((p, idx) => (
                    <div key={`side-trend-${p.id}`} className="group flex items-start gap-3 py-2.5 border-t border-gray-100 first:border-t-0">
                      <span className="text-2xl font-extrabold text-gray-300 italic leading-none shrink-0 w-6">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="flex flex-col">
                        <h4 className="font-semibold text-[#0d2a45] text-xs leading-snug group-hover:text-primary transition-colors mb-1 line-clamp-2">
                          <Link href={`/tin-tuc/${p.slug}`}>{p.title}</Link>
                        </h4>
                        <div className="flex items-center text-[10px] text-gray-400">
                          <Calendar className="w-2.5 h-2.5 mr-1" /> {p.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
