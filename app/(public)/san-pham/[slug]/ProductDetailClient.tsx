'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Star, ShoppingCart, Truck, ShieldCheck, ArrowLeft, Plus, Minus, CheckCircle2, Printer, Phone, Mail, MapPin, CreditCard, ChevronRight, Download, Info } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { QuoteTemplate } from '@/components/print/QuoteTemplate';
import { ProductCard } from '@/components/products/ProductCard';

export default function ProductDetailClient({ 
  product, 
  similarProducts = [], 
  sameBrandProducts = [], 
  relatedProducts = [], 
  consumables = [] 
}: { 
  product: any, 
  similarProducts?: any[], 
  sameBrandProducts?: any[], 
  relatedProducts?: any[], 
  consumables?: any[] 
}) {
  const [quantity, setQuantity] = useState(1);
  
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product?.variants?.length > 0 ? product.variants[0].id : null
  );
  
  const [selectedCustomOptions, setSelectedCustomOptions] = useState<Record<string, string>>(() => {
    if (product?.productType === 'custom-build' && product.customOptions) {
      const initial: Record<string, string> = {};
      product.customOptions.forEach(group => {
        if (group.choices.length > 0) {
          initial[group.name] = group.choices[0].id;
        }
      });
      return initial;
    }
    return {};
  });

  const currentVariant = product?.variants?.find(v => v.id === selectedVariantId) || product?.variants?.[0];

  const currentPrice = () => {
    if (product?.productType === 'custom-build' && product.customOptions) {
      let total = product.price || 0;
      product.customOptions.forEach((group: any) => {
        const choiceId = selectedCustomOptions[group.name];
        const choice = group.choices.find((c: any) => c.id === choiceId);
        if (choice) total += choice.priceModifier;
      });
      return total;
    }
    if (currentVariant) return currentVariant.price;
    return product?.price || 0;
  };

  const currentOriginalPrice = () => {
    if (currentVariant) return currentVariant.originalPrice;
    return product?.originalPrice;
  };

  const currentStock = () => {
    if (currentVariant) return currentVariant.stock || currentVariant.stockQuantity;
    return product?.stock || 0;
  };

  const currentCartItemId = () => {
    if (product?.productType === 'custom-build') {
      const optionIds = Object.values(selectedCustomOptions).sort().join('-');
      return `${product.id}-${optionIds}`;
    }
    if (currentVariant) return `${product.id}-${currentVariant.id}`;
    return product?.id.toString() || '';
  };

  const currentVariantName = () => {
    if (product?.productType === 'custom-build' && product?.customOptions) {
      const parts: string[] = [];
      product.customOptions.forEach((group: any) => {
        const choiceId = selectedCustomOptions[group.name];
        const choice = group.choices.find((c: any) => c.id === choiceId);
        if (choice) parts.push(choice.name);
      });
      return parts.join(', ');
    }
    if (currentVariant && currentVariant.name && currentVariant.name !== 'Mặc định') {
      return currentVariant.name.replace(`${product.name} - `, '');
    }
    return undefined;
  };
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

  // Related products are passed as props

  // Create gallery from variant images if available, else product images
  const gallery = currentVariant?.images && (currentVariant.images as string[]).length > 0 
    ? (currentVariant.images as string[])
    : (product.images?.length > 0 ? product.images : [product.image]);

  useEffect(() => {
    if (gallery.length > 0 && !gallery.includes(activeImage)) {
      setActiveImage(gallery[0]);
    } else if (gallery.length > 0 && selectedVariantId) {
      // Force update active image to the first image of the variant when variant changes
      setActiveImage(gallery[0]);
    }
  }, [selectedVariantId]);

  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({ 
      id: product.id, 
      cartItemId: currentCartItemId(),
      name: product.name,
      variantName: currentVariantName(),
      sku: currentVariant?.sku,
      attributes: currentVariant?.attributes,
      price: currentPrice(), 
      image: activeImage 
    }, quantity);
  };

  const price = currentPrice();
  const originalPrice = currentOriginalPrice();
  const stock = currentStock();

  const discount = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;

  return (
    <>
    <main className="min-h-screen bg-background flex flex-col print:hidden">
      <Header />
      
      <div className="flex-1 mx-auto max-w-7xl px-4 py-8 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 sm:gap-2 text-sm text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
            Trang chủ
          </Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <Link href="/san-pham" className="hover:text-primary transition-colors">
            Sản phẩm
          </Link>
          {product.category && (
            <>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
              <Link href={`/danh-muc/${product.category.slug || '#'}`} className="hover:text-primary transition-colors">
                {product.category.name || product.category}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <span className="text-foreground font-medium truncate">
            {product.name}
          </span>
        </nav>

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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6 leading-tight">
              {product.name}
            </h1>

            <div className="mb-6 bg-secondary/20 rounded-2xl p-5 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1 mb-1">
                  <span className="text-4xl font-extrabold text-foreground tracking-tight">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    (Đã bao gồm VAT)
                  </span>
                </div>
                {originalPrice && discount > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground line-through">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice)}
                    </span>
                    <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                      Giảm {discount}%
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <span className={stock > 0 ? "inline-flex items-center gap-1.5 text-sm font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full" : "inline-flex items-center gap-1.5 text-sm font-semibold text-destructive bg-destructive/10 px-4 py-2 rounded-full"}>
                  {stock > 0 ? (
                    <><CheckCircle2 className="w-4 h-4" /> Có sẵn hàng</>
                  ) : (
                    "Hết hàng"
                  )}
                </span>
              </div>
            </div>

            {/* Variants Selection UI */}
            {product.variants && product.variants.length > 1 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Chọn cấu hình:</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {product.variants.map((variant: any) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`relative text-left p-3 rounded-xl border-2 transition-all overflow-hidden flex flex-col justify-between min-h-[90px] ${
                        selectedVariantId === variant.id
                          ? 'border-primary ring-1 ring-primary shadow-sm bg-primary/5'
                          : 'border-border hover:border-primary/40 bg-card hover:bg-secondary/20'
                      }`}
                    >
                      {selectedVariantId === variant.id && (
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground p-1 rounded-bl-lg">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}
                      <div className="text-sm font-bold text-foreground mb-1 pr-4 line-clamp-2">
                        {variant.name ? variant.name.replace(`${product.name} - `, '') : 'Mặc định'} {variant.sku && <span className="text-muted-foreground font-normal text-[11px] ml-1">({variant.sku})</span>}
                      </div>
                      <div className="text-primary font-bold text-sm">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(variant.price)}
                      </div>
                      {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/50">
                          {Object.entries(variant.attributes).map(([k, v]) => (
                            <span key={k} className="text-[10px] px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded font-medium">
                              {k}: {v as string}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Build Selection UI */}
            {product.productType === 'custom-build' && product.customOptions && (
              <div className="mb-6 space-y-4">
                {product.customOptions.map((group) => (
                  <div key={group.name} className="bg-secondary/30 p-4 rounded-xl border border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-3">{group.name}:</h3>
                    <div className="space-y-2">
                      {group.choices.map((choice) => (
                        <label key={choice.id} className="flex items-center gap-3 cursor-pointer group/label">
                          <input
                            type="radio"
                            name={`option-${group.name}`}
                            value={choice.id}
                            checked={selectedCustomOptions[group.name] === choice.id}
                            onChange={() => setSelectedCustomOptions(prev => ({ ...prev, [group.name]: choice.id }))}
                            className="w-4 h-4 text-primary focus:ring-primary border-border mt-0.5 cursor-pointer"
                          />
                          <div className="flex-1 flex justify-between items-center text-sm">
                            <span className="text-foreground group-hover/label:text-primary transition-colors">{choice.name}</span>
                            {choice.priceModifier > 0 && (
                              <span className="text-muted-foreground">+ {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(choice.priceModifier)}</span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
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

            {/* Quick Specs */}
            <div className="mb-6 bg-secondary/20 rounded-2xl p-5 border border-border">
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" /> Thông số nổi bật
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm text-foreground">
                <li className="flex gap-2 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span><span className="text-muted-foreground">Sản phẩm:</span> {product.name}</span>
                </li>
                {(product.quickSpecs && product.quickSpecs.length > 0) ? (
                  product.quickSpecs.map((spec: any, idx: number) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>
                        {typeof spec === 'string' ? spec : (spec.label ? <><span className="text-muted-foreground">{spec.label}:</span> {spec.value}</> : '')}
                      </span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex gap-2 items-start"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" /><span>Sản phẩm chính hãng mới 100%</span></li>
                    <li className="flex gap-2 items-start"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" /><span>Bảo hành 1 đổi 1 trong 12 tháng</span></li>
                    <li className="flex gap-2 items-start"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" /><span>Hỗ trợ kỹ thuật 24/7 chuyên nghiệp</span></li>
                  </>
                )}
              </ul>
            </div>

            {/* Actions */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center border-2 border-primary/20 bg-background rounded-xl h-14 w-full sm:w-36 flex-shrink-0">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-full flex items-center justify-center hover:bg-secondary text-foreground transition-colors rounded-l-xl"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center font-bold text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                    className="w-12 h-full flex items-center justify-center hover:bg-secondary text-foreground transition-colors rounded-r-xl"
                    disabled={quantity >= stock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
  
                <div className="flex flex-1 gap-3">
                  <button 
                    onClick={handleAddToCart}
                    disabled={stock === 0}
                    className="flex-1 h-14 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
                  >
                    MUA NGAY
                  </button>
                  <button 
                    onClick={handleAddToCart}
                    disabled={stock === 0}
                    className="w-14 h-14 bg-primary/10 text-primary border-2 border-primary/20 rounded-xl hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
                    title="Thêm vào giỏ"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <button 
                  onClick={() => window.print()}
                  className="w-full h-12 bg-transparent border-2 border-dashed border-border text-muted-foreground rounded-xl font-medium text-sm hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  YÊU CẦU BÁO GIÁ CHO DOANH NGHIỆP
                </button>
              </div>
            </div>

            {/* Features / Policies */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {(product.policies && product.policies.length > 0 ? product.policies : [
                { id: 1, icon: 'Truck', title: 'Giao hàng Miễn phí', description: 'Cho đơn hàng trên 500k' },
                { id: 2, icon: 'ShieldCheck', title: 'Bảo hành Chính hãng', description: 'Tối thiểu 12 tháng' }
              ]).map((policy: any) => {
                const Icon = (LucideIcons as any)[policy.icon] || LucideIcons.CheckCircle;
                return (
                  <div key={policy.id} className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-[13px] leading-tight mb-0.5">{policy.title}</h4>
                      {policy.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{policy.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
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
              onClick={() => setActiveTab('docs')}
              className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === 'docs' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              Hướng dẫn & Tài liệu
            </button>
          </div>

          {/* Tabs Content */}
          <div className="min-h-[300px]">
            {activeTab === 'specs' && (
              <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                  <tbody>
                    {product.specifications && product.specifications.length > 0 ? (
                      product.specifications.map((spec: any, idx: number) => (
                        <tr key={idx} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3.5 px-6 bg-gray-50/80 font-medium text-gray-600 w-1/3 md:w-1/4 lg:w-1/5 border-r border-border">
                            {spec.label}
                          </td>
                          <td className="py-3.5 px-6 text-gray-900 font-medium">
                            {spec.value}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3.5 px-6 bg-gray-50/80 font-medium text-gray-600 w-1/3 md:w-1/4 lg:w-1/5 border-r border-border">Bảo hành</td>
                          <td className="py-3.5 px-6 text-gray-900 font-medium">12 tháng</td>
                        </tr>
                        <tr className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3.5 px-6 bg-gray-50/80 font-medium text-gray-600 w-1/3 md:w-1/4 lg:w-1/5 border-r border-border">Tính năng</td>
                          <td className="py-3.5 px-6 text-gray-900 font-medium">Đang cập nhật (Printing, Scanning, Copying...)</td>
                        </tr>
                        <tr className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3.5 px-6 bg-gray-50/80 font-medium text-gray-600 w-1/3 md:w-1/4 lg:w-1/5 border-r border-border">Tốc độ</td>
                          <td className="py-3.5 px-6 text-gray-900 font-medium">Tiêu chuẩn</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'desc' && (
              <div className="prose prose-lg text-muted-foreground max-w-none bg-white p-8 rounded-xl border border-border shadow-sm">
                <h3 className="text-xl font-bold text-foreground mb-4">Chi tiết sản phẩm: {product.name}</h3>
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}

            {activeTab === 'docs' && (
              <div className="space-y-6">
                {(product.manuals?.content || (product.manuals?.files && product.manuals.files.length > 0)) && (
                  <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
                    <h3 className="text-lg font-bold text-foreground mb-4">Hướng dẫn sử dụng</h3>
                    {product.manuals.content && (
                      <div 
                        className="prose prose-sm max-w-none text-muted-foreground mb-6" 
                        dangerouslySetInnerHTML={{ __html: product.manuals.content }} 
                      />
                    )}
                    {product.manuals.files && product.manuals.files.length > 0 && (
                      <div className="space-y-3">
                        {product.manuals.files.map((file: string, idx: number) => (
                          <div key={idx} className="p-4 bg-primary/5 rounded-lg border border-primary/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <LucideIcons.FileText className="w-5 h-5 text-primary" />
                              <h4 className="font-semibold text-foreground text-sm truncate max-w-[200px] sm:max-w-xs">{file.split('/').pop()}</h4>
                            </div>
                            <a href={file} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                              <Download className="w-4 h-4" /> Tải xuống
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {(product.drivers?.content || (product.drivers?.files && product.drivers.files.length > 0)) && (
                  <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
                    <h3 className="text-lg font-bold text-foreground mb-4">Driver & Phần mềm</h3>
                    {product.drivers.content && (
                      <div 
                        className="prose prose-sm max-w-none text-muted-foreground mb-6"
                        dangerouslySetInnerHTML={{ __html: product.drivers.content }}
                      />
                    )}
                    {product.drivers.files && product.drivers.files.length > 0 && (
                      <div className="grid gap-4 md:grid-cols-2">
                        {product.drivers.files.map((file: string, idx: number) => (
                          <a key={idx} href={file} download target="_blank" rel="noopener noreferrer" className="border border-border p-4 rounded-lg flex items-center justify-between hover:border-primary transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-10 h-10 shrink-0 bg-secondary rounded flex items-center justify-center text-xl font-bold group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                              <div className="truncate">
                                <h4 className="font-semibold text-foreground text-sm truncate">{file.split('/').pop()}</h4>
                                <p className="text-xs text-muted-foreground">Tải xuống Driver</p>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {(!product.manuals?.content && !product.manuals?.files?.length && !product.drivers?.content && !product.drivers?.files?.length) && (
                  <div className="bg-white p-12 rounded-xl border border-border shadow-sm flex flex-col items-center justify-center text-muted-foreground">
                    <LucideIcons.FileText className="w-12 h-12 mb-4 opacity-20" />
                    <p>Sản phẩm này chưa có tài liệu hướng dẫn hay driver nào được đính kèm.</p>
                  </div>
                )}
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
