import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { projects, companyInfo } from '@/lib/mockData';
import { productSlug } from '@/lib/utils';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { 
  Building2, 
  Users, 
  MapPin, 
  HeadphonesIcon, 
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Wrench
} from 'lucide-react';

export const metadata = {
  title: 'Dự án tiêu biểu | Máy Văn Phòng Xanh',
  description: 'Các dự án tiêu biểu mà Máy Văn Phòng Xanh đã triển khai thành công cho khối cơ quan, tài chính và doanh nghiệp.',
};

export default function ImplementedProjectsPage() {
  return (
    <>
      <Header />
      <main className="bg-gray-50 pb-20 min-h-screen font-sans">
        
        {/* HERO SECTION */}
        <div className="relative bg-[#0d2a45] text-white">
          <div className="absolute inset-0 overflow-hidden">
            <Image 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80" 
              alt="Background" 
              fill 
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d2a45] via-[#0d2a45]/80 to-transparent"></div>
          </div>
          
          <div className="container mx-auto px-4 py-20 lg:py-28 relative z-10">
            <div className="max-w-3xl">
              <span className="inline-block uppercase tracking-wider text-sm font-bold text-yellow-400 mb-4 border-b border-yellow-400 pb-1">
                Dự án tiêu biểu
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Dự án tiêu biểu đã triển khai cho khối Cơ quan, Tài chính, Ngân hàng và Doanh nghiệp lớn
              </h1>
              <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed">
                Máy Văn Phòng Xanh cung cấp thiết bị CNTT, máy in, máy scan, giải pháp số hóa tài liệu và hạ tầng công nghệ cho các đơn vị yêu cầu cao về tiến độ, bảo mật và năng lực triển khai.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#projects-list" className="bg-yellow-500 hover:bg-yellow-600 text-[#0d2a45] font-bold px-8 py-3.5 rounded flex items-center justify-center transition-colors">
                  Xem dự án tiêu biểu
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
                <Link href="/contact" className="bg-transparent hover:bg-white/10 border border-white/40 text-white font-semibold px-8 py-3.5 rounded flex items-center justify-center transition-colors">
                  Liên hệ tư vấn hồ sơ thầu
                  <FileCheck2 className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* STATS SECTION */}
        <div className="container mx-auto px-4 relative -mt-8 z-20">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 flex flex-wrap justify-between p-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="w-full md:w-1/4 p-6 flex flex-col items-center justify-center text-center">
              <Building2 className="w-8 h-8 text-yellow-500 mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">{companyInfo.stats[3].value}+</div>
              <div className="text-sm text-gray-500">{companyInfo.stats[3].label}</div>
            </div>
            <div className="w-full md:w-1/4 p-6 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-8 h-8 text-primary mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">{companyInfo.stats[0].value}</div>
              <div className="text-sm text-gray-500">{companyInfo.stats[0].label}</div>
            </div>
            <div className="w-full md:w-1/4 p-6 flex flex-col items-center justify-center text-center">
              <Users className="w-8 h-8 text-primary mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">{companyInfo.stats[1].value}</div>
              <div className="text-sm text-gray-500">{companyInfo.stats[1].label}</div>
            </div>
            <div className="w-full md:w-1/4 p-6 flex flex-col items-center justify-center text-center">
              <HeadphonesIcon className="w-8 h-8 text-primary mb-3" />
              <div className="text-2xl font-bold text-gray-900 mb-1">24/7</div>
              <div className="text-sm text-gray-500">Hỗ trợ kỹ thuật tận nơi</div>
            </div>
          </div>
        </div>

        {/* PROJECTS LIST */}
        <div id="projects-list" className="container mx-auto px-4 mt-16 pt-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow group flex flex-col h-full">
                <div className="relative h-60 w-full overflow-hidden">
                  <Image 
                    src={project.image} 
                    alt={project.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded uppercase shadow">
                      {project.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors leading-snug">
                    {project.title}
                  </h3>
                  
                  <div className="mt-auto space-y-3 mb-6">
                    <div className="flex items-start text-sm text-gray-600">
                      <Building2 className="w-4 h-4 mr-2 text-primary shrink-0 mt-0.5" />
                      <span>{project.client}</span>
                    </div>
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-primary shrink-0 mt-0.5" />
                      <span>Toàn quốc</span>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/du-an/${productSlug(project.title, project.id)}`}
                    className="inline-flex items-center text-sm font-bold text-gray-900 hover:text-primary transition-colors pt-4 border-t border-gray-100"
                  >
                    Xem chi tiết dự án
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COMMITMENT / CTA SECTION */}
        <div className="container mx-auto px-4 mt-20">
          <div className="bg-[#0b1c31] rounded-2xl p-8 lg:p-12 flex flex-col lg:flex-row gap-12 items-center">
            
            <div className="w-full lg:w-2/3">
              <h2 className="text-white text-xl font-bold mb-8">Cam kết từ Máy Văn Phòng Xanh</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <ShieldCheck className="w-6 h-6 text-yellow-500 mb-3" />
                  <p className="text-white text-sm font-semibold mb-2">Sản phẩm chính hãng, đầy đủ CO, CQ</p>
                </div>
                <div>
                  <CheckCircle2 className="w-6 h-6 text-yellow-500 mb-3" />
                  <p className="text-white text-sm font-semibold mb-2">Giải pháp an toàn, bảo mật, đáp ứng tiêu chuẩn</p>
                </div>
                <div>
                  <Building2 className="w-6 h-6 text-yellow-500 mb-3" />
                  <p className="text-white text-sm font-semibold mb-2">Triển khai đúng tiến độ, đảm bảo chất lượng</p>
                </div>
                <div>
                  <Wrench className="w-6 h-6 text-yellow-500 mb-3" />
                  <p className="text-white text-sm font-semibold mb-2">Hỗ trợ kỹ thuật tận nơi, bảo hành nhanh chóng</p>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/3">
              <div className="bg-[#122b49] rounded-xl p-8 border border-white/10">
                <h3 className="text-white text-xl font-bold mb-4">Bạn cần tư vấn giải pháp cho dự án của mình?</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Đội ngũ kỹ thuật của Máy Văn Phòng Xanh sẽ phối hợp khảo sát, tư vấn và cung cấp hồ sơ năng lực theo yêu cầu.
                </p>
                <Link href="/contact" className="inline-flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-[#0d2a45] font-bold px-6 py-3 rounded transition-colors w-full">
                  Liên hệ ngay
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>

          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}

