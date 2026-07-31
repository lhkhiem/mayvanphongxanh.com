import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { prisma } from '@/lib/db';
import { Calendar, FileText, Package } from 'lucide-react';
import { cleanUrl } from '@/lib/utils';

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const keyword = resolvedParams.q?.trim() || "";

  // Tìm kiếm sản phẩm
  const dbProducts = keyword ? await prisma.product.findMany({
    where: { 
      isActive: true,
      deletedAt: null,
      name: { contains: keyword, mode: 'insensitive' }
    },
    include: { variants: true, category: true, brandRef: true },
    take: 12
  }) : [];

  // Tìm kiếm bài viết tin tức
  const dbPosts = keyword ? await prisma.post.findMany({
    where: {
      isActive: true,
      OR: [
        { title: { contains: keyword, mode: 'insensitive' } },
        { excerpt: { contains: keyword, mode: 'insensitive' } },
      ]
    },
    include: { category: true },
    take: 6
  }) : [];

  const searchResults = dbProducts.map(p => {
    const defaultVariant = p.variants[0];
    const rawImgs = (p.images as string[] || []).map(cleanUrl).filter(Boolean);
    const rawVarImgs = (defaultVariant?.images as string[] || []).map(cleanUrl).filter(Boolean);
    const mainImg = rawImgs[0] || rawVarImgs[0] || '/placeholder.jpg';
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category?.name || 'Khác',
      brand: p.brand || p.brandRef?.name || '',
      price: defaultVariant?.price || 0,
      originalPrice: defaultVariant?.originalPrice,
      rating: 5,
      reviews: 120,
      image: mainImg,
      stock: defaultVariant?.stockQuantity || 0,
      isContactPrice: p.isContactPrice,
      productType: p.productType,
    };
  });

  const postResults = dbPosts.map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || '',
    image: p.image || '/placeholder.jpg',
    date: new Date(p.publishedAt || p.createdAt).toLocaleDateString('vi-VN'),
    category: p.category?.name || 'Tin tức',
  }));

  const totalResults = searchResults.length + postResults.length;

  return (
    <main className="min-h-screen bg-[#f8f9fa]">
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-[#0d2a45]">
            Kết quả tìm kiếm cho: <span className="text-primary">&quot;{keyword}&quot;</span>
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Tìm thấy <strong className="text-primary">{totalResults}</strong> kết quả ({searchResults.length} sản phẩm, {postResults.length} bài viết)
          </p>
        </div>

        {totalResults > 0 ? (
          <div className="space-y-12">
            {/* SẢN PHẨM KẾT QUẢ */}
            {searchResults.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Package className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-[#0d2a45]">Sản phẩm ({searchResults.length})</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {searchResults.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      originalPrice={product.originalPrice ?? undefined}
                      rating={product.rating}
                      reviews={product.reviews}
                      image={product.image}
                      stock={product.stock}
                      slug={product.slug}
                      category={product.category}
                      isContactPrice={product.isContactPrice}
                      productType={product.productType}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* BÀI VIẾT TIN TỨC KẾT QUẢ */}
            {postResults.length > 0 && (
              <section className={searchResults.length > 0 ? "pt-8 border-t border-gray-200" : ""}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-[#0d2a45]">Bài viết & Tin tức ({postResults.length})</h2>
                  </div>
                  <Link href={`/tin-tuc?q=${encodeURIComponent(keyword)}`} className="text-sm font-semibold text-primary hover:underline">
                    Xem tất cả bài viết →
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {postResults.map((post) => (
                    <div key={post.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                      <Link href={`/tin-tuc/${post.slug}`} className="block relative h-40 w-full overflow-hidden">
                        <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      </Link>
                      <div className="p-4 flex-1 flex flex-col">
                        <span className="text-primary text-[10px] font-bold uppercase tracking-wider mb-1 block">{post.category}</span>
                        <h3 className="font-bold text-[#0d2a45] text-base leading-snug group-hover:text-primary transition-colors mb-2 line-clamp-2">
                          <Link href={`/tin-tuc/${post.slug}`}>{post.title}</Link>
                        </h3>
                        <p className="text-gray-500 text-xs line-clamp-2 mb-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                        <div className="mt-auto flex items-center text-xs text-gray-400">
                          <Calendar className="w-3.5 h-3.5 mr-1" /> {post.date}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-[#0d2a45] mb-2">Không tìm thấy kết quả phù hợp!</h2>
            <p className="text-gray-500 text-sm mb-4">Vui lòng kiểm tra lại chính tả hoặc thử với từ khóa khác.</p>
            <Link href="/tin-tuc" className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
              Khám phá trang Tin tức
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
