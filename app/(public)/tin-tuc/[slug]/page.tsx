import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPosts } from '@/lib/mockData';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Calendar, User, ArrowLeft, Share2, Tag } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
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
  const post = blogPosts.find((p) => p.slug === slug);
  const relatedPosts = blogPosts.filter(p => p.id !== post?.id).slice(0, 3);

  if (!post) {
    notFound();
  }

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
                
                {/* Dummy Content for Demo */}
                <h2 className="text-2xl font-bold text-[#0d2a45] mb-4 mt-8">Tầm quan trọng của giải pháp này</h2>
                <p className="mb-4">
                  Trong thời đại công nghệ số 4.0, việc tối ưu hóa hệ thống máy móc văn phòng không chỉ giúp doanh nghiệp tiết kiệm chi phí mà còn nâng cao hiệu suất làm việc. 
                  Một hệ thống trơn tru giúp nhân viên tập trung vào chuyên môn thay vì mất thời gian sửa lỗi thiết bị.
                </p>
                <p className="mb-4">
                  Thực tế đã chứng minh, các doanh nghiệp đầu tư vào cơ sở hạ tầng IT ngay từ đầu sẽ có khả năng cạnh tranh cao hơn 30% so với các đối thủ cùng ngành. 
                  Hơn nữa, chi phí bảo trì dài hạn cũng giảm đáng kể nhờ các giải pháp quản trị đồng bộ.
                </p>
                
                <h3 className="text-xl font-bold text-[#0d2a45] mb-4 mt-8">Các bước triển khai cơ bản</h3>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                  <li><strong>Đánh giá thực trạng:</strong> Khảo sát hệ thống hiện tại, xác định các "nút thắt cổ chai".</li>
                  <li><strong>Lên kế hoạch thay thế:</strong> Đề xuất thiết bị phù hợp với ngân sách và quy mô doanh nghiệp.</li>
                  <li><strong>Triển khai lắp đặt:</strong> Đội ngũ kỹ thuật thi công tận nơi, đảm bảo không ảnh hưởng đến vận hành.</li>
                  <li><strong>Bảo hành bảo trì:</strong> Định kỳ kiểm tra và vệ sinh hệ thống hàng tháng.</li>
                </ul>

                <blockquote className="border-l-4 border-primary pl-4 py-2 italic text-lg text-gray-600 bg-gray-50 mb-6 rounded-r">
                  "Đầu tư vào công nghệ là khoản đầu tư sinh lời nhanh nhất nếu bạn chọn đúng đối tác đồng hành."
                </blockquote>

                <p className="mb-4">
                  Để biết thêm chi tiết về giải pháp hoặc cần tư vấn cụ thể cho doanh nghiệp của bạn, đừng ngần ngại liên hệ với đội ngũ chuyên gia của Máy Văn Phòng Xanh. 
                  Chúng tôi luôn sẵn sàng hỗ trợ 24/7.
                </p>
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
