import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { idFromSlug, productSlug } from '@/lib/utils';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Building2, ArrowLeft, Share2, MapPin, CheckCircle2, ChevronRight, Calendar } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = idFromSlug(slug);
  let project = null;
  
  if (!isNaN(id)) {
    project = await prisma.project.findUnique({ where: { id } });
  }
  
  if (!project) {
    project = await prisma.project.findUnique({ where: { slug } });
  }

  if (!project) {
    return {
      title: 'Không tìm thấy dự án',
    };
  }
  return {
    title: `${project.title} | Máy Văn Phòng Xanh`,
    description: project.description || '',
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = idFromSlug(slug);
  let project = null;

  if (!isNaN(id)) {
    project = await prisma.project.findUnique({ where: { id } });
  }
  
  if (!project) {
    project = await prisma.project.findUnique({ where: { slug } });
  }
  
  if (!project) {
    notFound();
  }

  const relatedProjects = await prisma.project.findMany({
    where: { isActive: true, id: { not: project.id } },
    take: 3,
    orderBy: { id: 'desc' }
  });

  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen font-sans pb-20">
        
        {/* HERO SECTION FOR PROJECT */}
        <div className="relative bg-[#0d2a45] text-white pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Image 
              src={project.image} 
              alt="Background" 
              fill 
              className="object-cover blur-sm"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d2a45] via-[#0d2a45]/90 to-[#0d2a45]/80"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <Link href="/du-an" className="inline-flex items-center text-sm font-semibold text-gray-400 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách dự án
            </Link>
            
            <div className="max-w-4xl">
              <span className="inline-block uppercase tracking-wider text-sm font-bold text-yellow-400 mb-4 bg-yellow-400/10 px-3 py-1 rounded">
                {project.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
                {project.title}
              </h1>
              <div 
                className="text-gray-300 text-lg md:text-xl max-w-3xl leading-relaxed mb-8 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: project.description || '' }}
              />
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 border-t border-white/10 pt-6">
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-primary" />
                  <span className="font-semibold text-white">Khách hàng: </span>
                  <span className="ml-2">{project.client}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  <span className="font-semibold text-white">Địa điểm: </span>
                  <span className="ml-2">Toàn quốc</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  <span className="font-semibold text-white">Năm thực hiện: </span>
                  <span className="ml-2">2023 - 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="container mx-auto px-4 -mt-10 relative z-20">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Content */}
            <div className="w-full lg:w-[70%]">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-12 mb-8">
                <div className="relative w-full h-[300px] md:h-[450px] rounded-lg overflow-hidden mb-10">
                  <Image src={project.image} alt={project.title} fill className="object-cover" />
                </div>
                
                <div className="prose prose-lg max-w-none text-gray-700">
                  <h2 className="text-2xl font-bold text-[#0d2a45] mb-4">Tổng quan dự án</h2>
                  <div dangerouslySetInnerHTML={{ __html: project.description || '' }} />
                </div>
              </div>
            </div>
            
            {/* Right Sidebar */}
            <div className="w-full lg:w-[30%] flex flex-col gap-8">
              
              {/* Project Info Widget */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-[#0d2a45] mb-5 border-b border-gray-100 pb-3">Thông tin tóm tắt</h3>
                
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Khách hàng</span>
                    <span className="font-medium text-gray-900">{project.client}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Lĩnh vực</span>
                    <span className="font-medium text-gray-900">{project.category}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Thời gian</span>
                    <span className="font-medium text-gray-900">45 Ngày làm việc</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Trạng thái</span>
                    <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Hoàn thành</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button className="flex items-center justify-center w-full bg-[#0d2a45] hover:bg-primary text-white font-bold py-3 px-4 rounded transition-colors">
                    <Share2 className="w-4 h-4 mr-2" /> Chia sẻ dự án
                  </button>
                </div>
              </div>

              {/* CTA Widget */}
              <div className="bg-gradient-to-br from-primary to-green-600 rounded-xl shadow-sm p-6 text-white text-center">
                <h3 className="text-xl font-bold mb-3">Bạn có dự án tương tự?</h3>
                <p className="text-primary-foreground/90 text-sm mb-6">
                  Đội ngũ kỹ sư của Máy Văn Phòng Xanh sẵn sàng tư vấn và cung cấp giải pháp thiết bị tối ưu nhất.
                </p>
                <Link href="/contact" className="inline-flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-[#0d2a45] font-bold py-3 px-6 rounded transition-colors w-full">
                  Nhận báo giá ngay
                </Link>
              </div>
              
            </div>
          </div>
        </div>

        {/* Other Projects */}
        <div className="container mx-auto px-4 mt-16 border-t border-gray-200 pt-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-[#0d2a45]">Dự án tiêu biểu khác</h3>
            <Link href="/du-an" className="text-primary hover:text-[#0d2a45] font-semibold flex items-center transition-colors">
              Xem tất cả <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedProjects.map((p) => (
              <div key={p.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow group flex flex-col h-full">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image 
                    src={p.image} 
                    alt={p.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase shadow">
                      {p.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <h4 className="text-base font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    <Link href={`/du-an/${productSlug(p.title, p.id)}`}>{p.title}</Link>
                  </h4>
                  <div className="mt-auto">
                    <div className="flex items-start text-xs text-gray-600 mb-2">
                      <Building2 className="w-3.5 h-3.5 mr-1.5 text-primary shrink-0" />
                      <span className="line-clamp-1">{p.client}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
