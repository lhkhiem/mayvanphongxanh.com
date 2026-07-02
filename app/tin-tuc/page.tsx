import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { blogPosts } from '@/lib/mockData';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Calendar, LayoutGrid, FileText, BookOpen, Presentation, Bell } from 'lucide-react';

export const metadata = {
  title: 'Tin tức & Giải pháp | Máy Văn Phòng Xanh',
  description: 'Cập nhật tin tức, thủ thuật, xu hướng và giải pháp công nghệ mới nhất từ Máy Văn Phòng Xanh.',
};

export default function TechNewsPage() {
  const featuredPost = blogPosts[0];
  const topThreePosts = blogPosts.slice(1, 4);
  const horizontalPosts = blogPosts.slice(4, 7);
  const latestPosts = blogPosts.slice(7, 9);
  
  // Re-use some posts for "Bài viết nổi bật" section to fill it up
  const trendingPosts = [blogPosts[2], blogPosts[5], blogPosts[1], blogPosts[8]];

  return (
    <>
      <Header />
      <main className="bg-[#f8f9fa] min-h-screen font-sans pb-20">
        
        {/* SUB NAVIGATION */}
        <div className="bg-white border-b border-gray-200 sticky top-[88px] lg:top-[132px] z-40">
          <div className="container mx-auto px-4">
            <div className="flex overflow-x-auto hide-scrollbar gap-2 py-3">
              <Link href="#" className="flex items-center whitespace-nowrap px-4 py-2 text-primary font-bold text-sm bg-primary/10 rounded-md">
                <LayoutGrid className="w-4 h-4 mr-2" /> Tổng quan
              </Link>
              <Link href="#" className="flex items-center whitespace-nowrap px-4 py-2 text-gray-700 hover:text-primary font-semibold text-sm hover:bg-gray-50 rounded-md transition-colors">
                <FileText className="w-4 h-4 mr-2" /> Tin tức
              </Link>
              <Link href="#" className="flex items-center whitespace-nowrap px-4 py-2 text-gray-700 hover:text-primary font-semibold text-sm hover:bg-gray-50 rounded-md transition-colors">
                <BookOpen className="w-4 h-4 mr-2" /> Hướng dẫn
              </Link>
              <Link href="#" className="flex items-center whitespace-nowrap px-4 py-2 text-gray-700 hover:text-primary font-semibold text-sm hover:bg-gray-50 rounded-md transition-colors">
                <Presentation className="w-4 h-4 mr-2" /> Case study
              </Link>
              <Link href="#" className="flex items-center whitespace-nowrap px-4 py-2 text-gray-700 hover:text-primary font-semibold text-sm hover:bg-gray-50 rounded-md transition-colors">
                <Bell className="w-4 h-4 mr-2" /> Thông báo
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-6">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LEFT COLUMN - MAIN CONTENT */}
            <div className="w-full lg:w-[70%]">
              
              {/* Featured Main Post */}
              {featuredPost && (
                <div className="mb-8 group">
                  <Link href={`/blog/tin-tuc/${featuredPost.slug}`} className="block">
                    <div className="relative w-full h-[400px] md:h-[480px] overflow-hidden rounded-lg mb-4">
                      <Image 
                        src={featuredPost.image} 
                        alt={featuredPost.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-700" 
                        priority
                      />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#0d2a45] group-hover:text-primary transition-colors leading-tight mb-3">
                      {featuredPost.title}
                    </h2>
                  </Link>
                  <p className="text-gray-600 text-base mb-3 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 gap-4">
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> {featuredPost.date}</span>
                    <span className="text-primary font-medium">{featuredPost.category}</span>
                  </div>
                </div>
              )}

              {/* 3 Posts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 border-b border-gray-200 pb-10">
                {topThreePosts.map(post => (
                  <div key={post.id} className="group flex flex-col">
                    <Link href={`/blog/tin-tuc/${post.slug}`} className="block relative h-40 w-full overflow-hidden rounded-md mb-3">
                      <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </Link>
                    <h3 className="font-bold text-[#0d2a45] text-[15px] leading-snug group-hover:text-primary transition-colors mb-2 line-clamp-3">
                      <Link href={`/blog/tin-tuc/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <div className="mt-auto flex items-center text-xs text-gray-500 gap-2">
                      <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {post.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* SECTION: Kiến thức & Giải pháp */}
              <div className="mb-6 flex items-center border-b border-gray-200">
                <h3 className="uppercase text-lg font-bold text-primary border-b-2 border-primary pb-2 -mb-[1px]">
                  Kiến thức & Giải pháp
                </h3>
              </div>
              
              <div className="flex flex-col gap-6">
                {horizontalPosts.map(post => (
                  <div key={post.id} className="group flex flex-col md:flex-row gap-5 items-start">
                    <Link href={`/blog/tin-tuc/${post.slug}`} className="block relative w-full md:w-[220px] h-[140px] shrink-0 overflow-hidden rounded-md">
                      <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </Link>
                    <div className="flex flex-col pt-1">
                      <h4 className="font-bold text-[#0d2a45] text-[17px] leading-snug group-hover:text-primary transition-colors mb-2">
                        <Link href={`/blog/tin-tuc/${post.slug}`}>{post.title}</Link>
                      </h4>
                      <div className="flex items-center text-xs text-gray-500 gap-3 mb-2.5">
                        <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {post.date}</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-primary font-medium">{post.category}</span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
            
            {/* RIGHT COLUMN - SIDEBAR */}
            <div className="w-full lg:w-[30%] flex flex-col gap-10">
              
              {/* Widget: Bài viết mới nhất */}
              <div>
                <div className="mb-5 flex items-center border-b border-gray-200">
                  <h3 className="uppercase text-base font-bold text-[#0d2a45] border-b-2 border-[#0d2a45] pb-2 -mb-[1px]">
                    Bài viết mới nhất
                  </h3>
                </div>
                <div className="flex flex-col gap-4">
                  {latestPosts.map(post => (
                    <div key={`latest-${post.id}`} className="group flex gap-3">
                      <Link href={`/blog/tin-tuc/${post.slug}`} className="block relative w-[100px] h-[70px] shrink-0 overflow-hidden rounded">
                        <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      </Link>
                      <div className="flex flex-col">
                        <h4 className="font-bold text-[#0d2a45] text-sm leading-snug group-hover:text-primary transition-colors mb-1 line-clamp-2">
                          <Link href={`/blog/tin-tuc/${post.slug}`}>{post.title}</Link>
                        </h4>
                        <div className="flex items-center text-xs text-gray-500 mt-auto">
                          <Calendar className="w-3 h-3 mr-1" /> {post.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Widget: Bài viết nổi bật (Numbered list) */}
              <div>
                <div className="mb-5 flex items-center border-b border-gray-200">
                  <h3 className="uppercase text-base font-bold text-[#0d2a45] border-b-2 border-[#0d2a45] pb-2 -mb-[1px]">
                    Bài viết nổi bật
                  </h3>
                </div>
                
                {/* Highlight top 1 of trending */}
                {trendingPosts[0] && (
                  <div className="mb-5 group">
                    <Link href={`/blog/tin-tuc/${trendingPosts[0].slug}`} className="block relative w-full h-[180px] overflow-hidden rounded mb-3">
                      <Image src={trendingPosts[0].image} alt={trendingPosts[0].title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </Link>
                    <h4 className="font-bold text-[#0d2a45] text-[15px] leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      <Link href={`/blog/tin-tuc/${trendingPosts[0].slug}`}>{trendingPosts[0].title}</Link>
                    </h4>
                  </div>
                )}
                
                <div className="flex flex-col">
                  {trendingPosts.map((post, index) => (
                    <div key={`trend-${post.id}`} className="group flex items-start gap-4 py-3 border-t border-gray-100 first:border-t-0">
                      <span className="text-3xl font-extrabold text-gray-200 italic leading-none shrink-0 w-8">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="flex flex-col pt-0.5">
                        <h4 className="font-semibold text-[#0d2a45] text-[13px] leading-snug group-hover:text-primary transition-colors mb-1.5">
                          <Link href={`/blog/tin-tuc/${post.slug}`}>{post.title}</Link>
                        </h4>
                        <div className="flex items-center text-[11px] text-gray-400">
                          <Calendar className="w-3 h-3 mr-1" /> {post.date}
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

