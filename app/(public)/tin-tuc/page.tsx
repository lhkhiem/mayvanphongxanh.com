import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { NewsSearchInput } from '@/components/blog/news-search-input';
import { Calendar, LayoutGrid, FileText, Search } from 'lucide-react';

export const metadata = {
  title: 'Tin tức & Giải pháp | Máy Văn Phòng Xanh',
  description: 'Cập nhật tin tức, thủ thuật, xu hướng và giải pháp công nghệ mới nhất từ Máy Văn Phòng Xanh.',
};

export default async function TechNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category: selectedCategorySlug, q: searchQuery } = await searchParams;

  // Lấy tất cả danh mục bài viết từ CSDL (sắp xếp theo thứ tự order)
  const dbCategories = await prisma.postCategory.findMany({
    orderBy: [{ order: 'asc' }, { id: 'asc' }]
  });

  // Lấy tất cả bài viết active
  const allDbPosts = await prisma.post.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  });

  const allFormattedPosts = allDbPosts.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || '',
    image: p.image || '/placeholder.jpg',
    date: new Date(p.publishedAt || p.createdAt).toLocaleDateString('vi-VN'),
    category: p.category?.name || 'Tin tức',
    categorySlug: p.category?.slug,
    isFeatured: p.isFeatured,
    isTrending: p.isTrending,
  }));

  // Lọc theo từ khóa tìm kiếm (nếu có)
  const queryNormalized = searchQuery?.trim().toLowerCase();
  const searchFilteredPosts = queryNormalized
    ? allFormattedPosts.filter(p => 
        p.title.toLowerCase().includes(queryNormalized) ||
        p.excerpt.toLowerCase().includes(queryNormalized) ||
        p.category.toLowerCase().includes(queryNormalized)
      )
    : allFormattedPosts;

  // Danh mục hiện tại đang được chọn (nếu có)
  const currentCategory = dbCategories.find(c => c.slug === selectedCategorySlug);

  // Bài viết thuộc danh mục đang chọn & kết quả tìm kiếm
  const categoryPosts = selectedCategorySlug
    ? searchFilteredPosts.filter(p => p.categorySlug === selectedCategorySlug)
    : searchFilteredPosts;

  // Dữ liệu cho trang Tổng quan
  const featuredPost = allFormattedPosts.find(p => p.isFeatured) || allFormattedPosts[0];
  const remainingPosts = allFormattedPosts.filter(p => p.id !== featuredPost?.id);
  const topThreePosts = remainingPosts.slice(0, 3);
  const horizontalPosts = remainingPosts.slice(3, 8);
  
  // Dữ liệu cho Sidebar (Bài mới nhất & Bài nổi bật/xu hướng)
  const latestPosts = allFormattedPosts.slice(0, 5);
  const markedTrending = allFormattedPosts.filter(p => p.isTrending);
  const trendingPosts = markedTrending.length > 0 
    ? Array.from(new Set([...markedTrending, ...allFormattedPosts])).slice(0, 5)
    : allFormattedPosts.slice(0, 5);

  return (
    <>
      <Header />
      <main className="bg-[#f8f9fa] min-h-screen font-sans pb-20">
        
        {/* DYNAMIC SUB NAVIGATION & SEARCH */}
        <div className="bg-white border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex overflow-x-auto hide-scrollbar gap-2 w-full sm:w-auto">
              <Link 
                href="/tin-tuc" 
                className={`flex items-center whitespace-nowrap px-4 py-2 text-sm rounded-md transition-colors ${
                  !selectedCategorySlug && !searchQuery
                    ? 'text-primary font-bold bg-primary/10' 
                    : 'text-gray-700 hover:text-primary font-semibold hover:bg-gray-50'
                }`}
              >
                <LayoutGrid className="w-4 h-4 mr-2" /> Tổng quan
              </Link>

              {dbCategories.map((cat) => {
                const isActive = selectedCategorySlug === cat.slug;
                return (
                  <Link
                    key={cat.id}
                    href={`/tin-tuc?category=${cat.slug}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}`}
                    className={`flex items-center whitespace-nowrap px-4 py-2 text-sm rounded-md transition-colors ${
                      isActive 
                        ? 'text-primary font-bold bg-primary/10' 
                        : 'text-gray-700 hover:text-primary font-semibold hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="w-4 h-4 mr-2" /> {cat.name}
                  </Link>
                );
              })}
            </div>

            {/* News Search Input Box */}
            <div className="w-full sm:w-auto shrink-0">
              <NewsSearchInput initialSearch={searchQuery} />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 mt-6">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LEFT COLUMN - MAIN CONTENT */}
            <div className="w-full lg:w-[70%]">
              
              {/* Search Banner Notice */}
              {searchQuery && (
                <div className="mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700 text-sm">
                    <Search className="w-4 h-4 text-primary" />
                    <span>Kết quả tìm kiếm cho từ khóa: <strong className="text-primary">&quot;{searchQuery}&quot;</strong></span>
                    <span className="text-gray-400">({categoryPosts.length} bài viết)</span>
                  </div>
                  <Link 
                    href={selectedCategorySlug ? `/tin-tuc?category=${selectedCategorySlug}` : '/tin-tuc'} 
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Xóa tìm kiếm
                  </Link>
                </div>
              )}

              {!selectedCategorySlug && !searchQuery ? (
                /* ================= TỔNG QUAN (MAGAZINE LAYOUT BY FLAGS) ================= */
                <>
                  {/* Featured Main Post */}
                  {featuredPost && (
                    <div className="mb-8 group">
                      <Link href={`/tin-tuc/${featuredPost.slug}`} className="block">
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
                        {featuredPost.categorySlug && (
                          <Link href={`/tin-tuc?category=${featuredPost.categorySlug}`} className="text-primary font-medium hover:underline">
                            {featuredPost.category}
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3 Posts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 border-b border-gray-200 pb-10">
                    {topThreePosts.map(post => (
                      <div key={post.id} className="group flex flex-col">
                        <Link href={`/tin-tuc/${post.slug}`} className="block relative h-40 w-full overflow-hidden rounded-md mb-3">
                          <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        </Link>
                        <h3 className="font-bold text-[#0d2a45] text-[15px] leading-snug group-hover:text-primary transition-colors mb-2 line-clamp-3">
                          <Link href={`/tin-tuc/${post.slug}`}>{post.title}</Link>
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
                        <Link href={`/tin-tuc/${post.slug}`} className="block relative w-full md:w-[220px] h-[140px] shrink-0 overflow-hidden rounded-md">
                          <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        </Link>
                        <div className="flex flex-col pt-1">
                          <h4 className="font-bold text-[#0d2a45] text-[17px] leading-snug group-hover:text-primary transition-colors mb-2">
                            <Link href={`/tin-tuc/${post.slug}`}>{post.title}</Link>
                          </h4>
                          <div className="flex items-center text-xs text-gray-500 gap-3 mb-2.5">
                            <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {post.date}</span>
                            <span className="text-gray-400">|</span>
                            {post.categorySlug && (
                              <Link href={`/tin-tuc?category=${post.categorySlug}`} className="text-primary font-medium hover:underline">
                                {post.category}
                              </Link>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* ================= DANH MỤC (CARD GRID LAYOUT) ================= */
                <div>
                  {categoryPosts.length === 0 ? (
                    <div className="bg-white rounded-lg p-12 text-center border border-gray-200 my-4 shadow-sm">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-1">Chưa có bài viết nào</h3>
                      <p className="text-sm text-gray-500">Chuyên mục này hiện chưa có bài viết được xuất bản.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {categoryPosts.map((post) => (
                        <div 
                          key={post.id} 
                          className="bg-white rounded-lg border border-gray-200 overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col"
                        >
                          <Link href={`/tin-tuc/${post.slug}`} className="block relative h-48 w-full overflow-hidden">
                            <Image 
                              src={post.image} 
                              alt={post.title} 
                              fill 
                              className="object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                          </Link>
                          <div className="p-5 flex-1 flex flex-col">
                            <div className="flex items-center text-xs text-gray-500 gap-3 mb-2">
                              <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {post.date}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-primary font-medium">{post.category}</span>
                            </div>
                            <h3 className="font-bold text-[#0d2a45] text-base leading-snug group-hover:text-primary transition-colors mb-2 line-clamp-2">
                              <Link href={`/tin-tuc/${post.slug}`}>{post.title}</Link>
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                              {post.excerpt}
                            </p>
                            <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                              <Link 
                                href={`/tin-tuc/${post.slug}`}
                                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                              >
                                Xem chi tiết →
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
            
            {/* RIGHT COLUMN - SIDEBAR (ALWAY PRESENT LIKE OVERVIEW) */}
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
                      <Link href={`/tin-tuc/${post.slug}`} className="block relative w-[100px] h-[70px] shrink-0 overflow-hidden rounded">
                        <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      </Link>
                      <div className="flex flex-col">
                        <h4 className="font-bold text-[#0d2a45] text-sm leading-snug group-hover:text-primary transition-colors mb-1 line-clamp-2">
                          <Link href={`/tin-tuc/${post.slug}`}>{post.title}</Link>
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
                    <Link href={`/tin-tuc/${trendingPosts[0].slug}`} className="block relative w-full h-[180px] overflow-hidden rounded mb-3">
                      <Image src={trendingPosts[0].image} alt={trendingPosts[0].title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </Link>
                    <h4 className="font-bold text-[#0d2a45] text-[15px] leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      <Link href={`/tin-tuc/${trendingPosts[0].slug}`}>{trendingPosts[0].title}</Link>
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
                          <Link href={`/tin-tuc/${post.slug}`}>{post.title}</Link>
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

