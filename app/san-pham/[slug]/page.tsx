'use client';

import { useState, use } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { products } from '@/lib/mockData';
import { idFromSlug } from '@/lib/utils';
import { Star, ShoppingCart, Truck, ShieldCheck, ArrowLeft, Plus, Minus, CheckCircle2, Printer, Phone, Mail, MapPin, CreditCard, ChevronRight, Download } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { QuoteTemplate } from '@/components/print/QuoteTemplate';
import { ProductCard } from '@/components/products/ProductCard';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const product = products.find(p => p.id === idFromSlug(resolvedParams.slug));
  const [quantity, setQuantity] = useState(1);
  
  if (!product) {
    notFound();
  }
  
  // Add state for image gallery
  const [activeImage, setActiveImage] = useState(product.image);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  // Tabs state
  const [activeTab, setActiveTab] = useState('specs');
  const [activeRelatedTab, setActiveRelatedTab] = useState(product.category === 'Máy in' ? 'consumables' : 'similar');

  // Related products logic
  const similarProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const sameBrandProducts = products.filter(p => p.id !== product.id).reverse().slice(0, 4); 
  const relatedProducts = products.filter(p => p.id !== product.id).slice(2, 6);
  const consumables = product.category === 'Máy in' 
    ? products.filter(p => p.category === 'Vật tư').slice(0, 4)
    : [];
  
  // Create mock gallery
  const gallery = [
    product.image,
    product.image + "?mock=1",
    product.image + "?mock=2",
    product.image + "?mock=3"
  ];

  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({ 
      id: product.id, 
      name: product.name, 
      price: product.price, 
      image: product.image 
    }, quantity);
  };

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <>
    <main className="min-h-screen bg-background flex flex-col print:hidden">
      <Header />
      
      <div className="flex-1 mx-auto max-w-7xl px-4 py-8 w-full">
        <div className="flex items-center justify-between mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground line-clamp-2">
            {product.name}
          </h1>
          <Link href="/san-pham" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors whitespace-nowrap flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="md:col-span-5 lg:col-span-5 flex flex-col gap-4">
            <div 
              className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-border cursor-crosshair"
              onMouseMove={(e) => {
                const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - left) / width) * 100;
                const y = ((e.clientY - top) / height) * 100;
                setMousePosition({ x, y });
              }}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
            >
              <Image 
                src={activeImage} 
                alt={product.name} 
                fill 
                className={`object-contain transition-transform duration-200 ${isZooming ? 'scale-[2]' : 'scale-100'}`}
                style={{
                  transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
                }}
                priority
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-4 py-2 rounded-full font-bold shadow-md z-10">
                  -{discount}%
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative aspect-square rounded-xl overflow-hidden bg-white border-2 transition-all ${activeImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}
                >
                  <Image src={img} alt={`${product.name} thumbnail ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="md:col-span-7 lg:col-span-7 flex flex-col">
            <div className="mb-8">
              <div className="flex items-end flex-wrap gap-x-3 gap-y-1 mb-1">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-foreground">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (Đã bao gồm VAT)
                  </span>
                </div>
              </div>
              {product.originalPrice && discount > 0 && (
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <span className="text-muted-foreground">
                    Giá trước đây: <span className="line-through">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice)}</span>
                  </span>
                  <span className="text-destructive font-medium bg-destructive/10 px-1.5 py-0.5 rounded text-xs">
                    Tiết kiệm {discount}%
                  </span>
                </div>
              )}
              <span className={product.stock > 0 ? "inline-flex items-center gap-1.5 text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full" : "inline-flex items-center gap-1.5 text-sm font-medium text-destructive bg-destructive/10 px-3 py-1 rounded-full"}>
                {product.stock > 0 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Có sẵn hàng
                  </>
                ) : (
                  "Hết hàng"
                )}
              </span>
            </div>



            {/* Included Items for Service Packages */}
            {product.includedItems && product.includedItems.length > 0 && (
              <div className="mb-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Trọn gói bao gồm:
                </h3>
                <ul className="space-y-3">
                  {product.includedItems.map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 mb-8">
              <div className="flex flex-col xl:flex-row gap-3">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <div className="flex items-center border border-border rounded-lg h-12 w-full sm:w-32 flex-shrink-0">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-full flex items-center justify-center hover:bg-secondary text-foreground transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="flex-1 text-center font-semibold">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-full flex items-center justify-center hover:bg-secondary text-foreground transition-colors"
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
  
                  <div className="flex flex-1 gap-3">
                    <button 
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className="flex-1 h-12 bg-primary/10 text-primary rounded-lg font-semibold text-sm hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4 hidden sm:block" />
                      THÊM VÀO GIỎ
                    </button>
    
                    <button 
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className="flex-1 h-12 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                    >
                      MUA NGAY
                    </button>
                  </div>
                </div>

                <button 
                  onClick={() => window.print()}
                  className="w-full xl:w-32 h-12 bg-card border border-border text-foreground rounded-lg font-semibold text-sm hover:bg-secondary transition-colors flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <Printer className="w-4 h-4" />
                  IN BÁO GIÁ
                </button>
              </div>
            </div>



            {/* Quick Specs (Mock) */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-primary uppercase mb-4 tracking-wider">THÔNG TIN NHANH SẢN PHẨM</h3>
              <ul className="space-y-3 text-sm text-foreground">
                <li className="pb-2 border-b border-border/50">Tên sản phẩm: {product.name}</li>
                <li className="pb-2 border-b border-border/50">Sản phẩm chính hãng mới 100%</li>
                <li className="pb-2 border-b border-border/50">Bảo hành 1 đổi 1 trong 12 tháng</li>
                <li className="pb-2 border-b border-border/50">Hỗ trợ kỹ thuật 24/7 chuyên nghiệp</li>
              </ul>
            </div>

            {/* Features (Original) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                <Truck className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">Giao hàng Miễn phí</h4>
                  <p className="text-sm text-muted-foreground">Cho đơn hàng trên 500k</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary rounded-lg">
                <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground">Bảo hành Chính hãng</h4>
                  <p className="text-sm text-muted-foreground">Tối thiểu 12 tháng</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Detailed Description with Tabs */}
        <div className="mt-16 pt-8 border-t border-border">
          {/* Tabs Navigation */}
          <div className="flex flex-wrap border-b border-border mb-6 gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === 'specs' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              Thông số kỹ thuật
            </button>
            <button
              onClick={() => setActiveTab('desc')}
              className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === 'desc' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              Mô tả sản phẩm
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === 'manual' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              Hướng dẫn sử dụng
            </button>
            <button
              onClick={() => setActiveTab('driver')}
              className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === 'driver' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              Driver & Tài liệu
            </button>
          </div>

          {/* Tabs Content */}
          <div className="min-h-[300px]">
            {activeTab === 'specs' && (
              <div className="bg-white border border-border rounded-xl overflow-hidden flex flex-col md:flex-row shadow-sm">
                <div className="md:w-1/4 bg-gray-50 p-6 border-b md:border-b-0 md:border-r border-border">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">TỔNG QUAN</h3>
                  <div className="mb-4">
                    <span className="text-xs text-gray-400 block mb-1">Thương hiệu</span>
                    <span className="font-semibold text-gray-800">{product.brand || 'Khác'}</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-xs text-gray-400 block mb-1">Danh mục</span>
                    <span className="font-semibold text-gray-800">{product.category}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">Mã sản phẩm</span>
                    <span className="font-semibold text-gray-800">{product.sku || `HPT-${product.id}`}</span>
                  </div>
                </div>
                <div className="flex-1 p-0">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                        <td className="py-4 px-6 text-gray-500 font-medium w-1/3">Thương hiệu</td>
                        <td className="py-4 px-6 font-medium text-gray-900">{product.brand || 'Đang cập nhật'}</td>
                      </tr>
                      <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 bg-gray-50/30">
                        <td className="py-4 px-6 text-gray-500 font-medium w-1/3">Trạng thái</td>
                        <td className="py-4 px-6 text-gray-900">{product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</td>
                      </tr>
                      <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                        <td className="py-4 px-6 text-gray-500 font-medium w-1/3">Bảo hành</td>
                        <td className="py-4 px-6 text-gray-900">12 tháng</td>
                      </tr>
                      {/* Thêm các dòng dummy spec để bảng đầy đủ như ảnh */}
                      <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 bg-gray-50/30">
                        <td className="py-4 px-6 text-gray-500 font-medium w-1/3">Tính năng</td>
                        <td className="py-4 px-6 text-gray-900">Đang cập nhật (Printing, Scanning, Copying...)</td>
                      </tr>
                      <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                        <td className="py-4 px-6 text-gray-500 font-medium w-1/3">Tốc độ</td>
                        <td className="py-4 px-6 text-gray-900">Tiêu chuẩn</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="p-4 border-t border-gray-100">
                    <button className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                      Xem thêm (36) <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'desc' && (
              <div className="prose prose-lg text-muted-foreground max-w-none bg-white p-8 rounded-xl border border-border shadow-sm">
                <h3 className="text-xl font-bold text-foreground mb-4">Chi tiết sản phẩm: {product.name}</h3>
                <p>{product.description}</p>
                <p className="mt-4">
                  Sản phẩm được phân phối chính hãng bởi Máy Văn Phòng Xanh. Quý khách hàng sẽ được trải nghiệm dịch vụ hậu mãi chuyên nghiệp, hỗ trợ kỹ thuật tận nơi và bảo hành nhanh chóng.
                </p>
                <div className="mt-6 flex justify-center">
                   <Image src={product.image} alt={product.name} width={600} height={400} className="rounded-lg border border-border" />
                </div>
              </div>
            )}

            {activeTab === 'manual' && (
              <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-4">Hướng dẫn sử dụng cơ bản</h3>
                <ul className="space-y-4 text-muted-foreground list-disc pl-5">
                  <li>Kiểm tra nguồn điện và các kết nối trước khi khởi động thiết bị.</li>
                  <li>Sử dụng đúng loại vật tư tiêu hao khuyến cáo từ nhà sản xuất.</li>
                  <li>Tránh đặt máy ở nơi ẩm ướt hoặc có nhiệt độ quá cao.</li>
                  <li>Vệ sinh máy định kỳ để đảm bảo độ bền và chất lượng hoạt động.</li>
                </ul>
                <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">Tài liệu hướng dẫn chi tiết (PDF)</h4>
                    <p className="text-sm text-muted-foreground">Tải xuống file hướng dẫn chi tiết từ nhà sản xuất.</p>
                  </div>
                  <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Download className="w-4 h-4" /> Tải xuống
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'driver' && (
              <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
                <h3 className="text-lg font-bold text-foreground mb-4">Tải xuống Driver và Phần mềm</h3>
                <p className="text-muted-foreground mb-6">
                  Vui lòng chọn đúng hệ điều hành để tải driver phù hợp cho <strong>{product.name}</strong>.
                </p>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="border border-border p-4 rounded-lg flex items-center justify-between hover:border-primary transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center text-xl font-bold group-hover:bg-primary/10 group-hover:text-primary transition-colors">W</div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">Windows 10 / 11 (64-bit)</h4>
                        <p className="text-xs text-muted-foreground">Phiên bản: 1.2.5 - Cập nhật: 01/2024</p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  
                  <div className="border border-border p-4 rounded-lg flex items-center justify-between hover:border-primary transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center text-xl font-bold group-hover:bg-primary/10 group-hover:text-primary transition-colors">M</div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm">macOS 12 / 13 / 14</h4>
                        <p className="text-xs text-muted-foreground">Phiên bản: 2.0.1 - Cập nhật: 12/2023</p>
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16 bg-white rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="flex flex-wrap border-b border-border bg-gray-50/50">
            {product.category === 'Máy in' && (
              <button
                onClick={() => setActiveRelatedTab('consumables')}
                className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 ${
                  activeRelatedTab === 'consumables' 
                    ? 'border-primary text-primary bg-white' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-100/50'
                }`}
              >
                SẢN PHẨM VẬT TƯ TIÊU HAO
              </button>
            )}
            <button
              onClick={() => setActiveRelatedTab('similar')}
              className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 ${
                activeRelatedTab === 'similar' 
                  ? 'border-primary text-primary bg-white' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-100/50'
              }`}
            >
              SẢN PHẨM TƯƠNG TỰ
            </button>
            <button
              onClick={() => setActiveRelatedTab('same-brand')}
              className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 ${
                activeRelatedTab === 'same-brand' 
                  ? 'border-primary text-primary bg-white' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-100/50'
              }`}
            >
              SẢN PHẨM CÙNG HÃNG
            </button>
            <button
              onClick={() => setActiveRelatedTab('related')}
              className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 ${
                activeRelatedTab === 'related' 
                  ? 'border-primary text-primary bg-white' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-100/50'
              }`}
            >
              SẢN PHẨM LIÊN QUAN
            </button>
            
            <div className="ml-auto px-6 py-4 flex items-center">
              <Link href="/san-pham" className="text-sm font-medium hover:text-primary hover:underline">
                Xem toàn bộ sản phẩm
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {activeRelatedTab === 'consumables' && consumables.length > 0 && consumables.map(p => (
                <div key={p.id}>
                  <ProductCard {...p} />
                </div>
              ))}
              
              {activeRelatedTab === 'consumables' && consumables.length === 0 && (
                <div className="col-span-full py-8 text-center text-muted-foreground">
                  Đang cập nhật vật tư tiêu hao cho sản phẩm này.
                </div>
              )}

              {activeRelatedTab === 'similar' && similarProducts.map(p => (
                <div key={p.id}>
                  <ProductCard {...p} />
                </div>
              ))}
              
              {activeRelatedTab === 'similar' && similarProducts.length === 0 && (
                <div className="col-span-full py-8 text-center text-muted-foreground">
                  Đang cập nhật sản phẩm tương tự.
                </div>
              )}

              {activeRelatedTab === 'same-brand' && sameBrandProducts.map(p => (
                <div key={p.id}>
                  <ProductCard {...p} />
                </div>
              ))}

              {activeRelatedTab === 'related' && relatedProducts.map(p => (
                <div key={p.id}>
                  <ProductCard {...p} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
    <QuoteTemplate product={product} quantity={quantity} />
    </>
  );
}
