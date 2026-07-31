'use client';

import { useState, useEffect } from 'react';
import { useCompare } from '@/context/CompareContext';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import Link from 'next/link';
import { Check, X, ShoppingCart, Star, Info, ListFilter, FileText } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { slugify, cleanUrl } from '@/lib/utils';

function ProductCompareImage({ src, alt }: { src?: string; alt: string }) {
  const [imageError, setImageError] = useState(false);
  const cleanSrc = cleanUrl(src) || '/placeholder.jpg';

  return (
    <div className="relative w-44 h-44 sm:w-48 sm:h-48 mx-auto mb-4 bg-white rounded-xl p-3 border border-border/50 shadow-sm flex items-center justify-center overflow-hidden">
      {!imageError ? (
        <img 
          src={cleanSrc} 
          alt={alt} 
          className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center text-gray-400 gap-1.5 p-2 text-center">
          <ShoppingCart className="w-8 h-8 opacity-20" />
          <span className="text-xs font-medium">Chưa có ảnh</span>
        </div>
      )}
    </div>
  );
}

function parseSpecMap(rawSpecs: any): Record<string, string> {
  const map: Record<string, string> = {};
  if (!rawSpecs) return map;

  if (Array.isArray(rawSpecs)) {
    rawSpecs.forEach((item: any) => {
      if (typeof item === 'string') {
        const colonIdx = item.indexOf(':');
        if (colonIdx > 0) {
          const k = item.substring(0, colonIdx).trim();
          const v = item.substring(colonIdx + 1).trim();
          if (k) map[k] = v;
        } else if (item.trim()) {
          map[item.trim()] = 'Có';
        }
      } else if (typeof item === 'object' && item !== null) {
        const label = item.label || item.name || item.key;
        const val = item.value || item.val || item.content;
        if (label) {
          map[String(label).trim()] = val ? String(val).trim() : 'Có';
        }
      }
    });
  } else if (typeof rawSpecs === 'object' && rawSpecs !== null) {
    Object.entries(rawSpecs).forEach(([k, v]) => {
      if (k && v !== undefined && v !== null) {
        map[k.trim()] = String(v).trim();
      }
    });
  }

  return map;
}

export default function ComparePage() {
  const { items, removeCompareItem } = useCompare();
  const { addToCart } = useCart();
  const router = useRouter();
  const [compareProducts, setCompareProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      setCompareProducts([]);
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const ids = items.map(item => item.id).join(',');
        const res = await fetch(`/api/products?ids=${ids}`);
        if (res.ok) {
          const data = await res.json();
          // Keep the order of items
          const orderedData = items.map(item => data.find((p: any) => p.id === item.id)).filter(Boolean);
          setCompareProducts(orderedData);
        }
      } catch (error) {
        console.error('Failed to fetch compare products', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [items]);

  const formatPrice = (product: any) => {
    if (!product || product.isContactPrice || product.price <= 0) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);
  };

  // Extract parsed quick specs maps for each product
  const parsedQuickSpecsList = compareProducts.map(p => parseSpecMap(p?.quickSpecs));
  
  // Extract all unique quick spec keys
  const uniqueQuickSpecKeys = Array.from(
    new Set(parsedQuickSpecsList.flatMap(specMap => Object.keys(specMap)))
  );

  // Extract parsed detailed specs maps for each product
  const parsedDetailSpecsList = compareProducts.map(p => parseSpecMap(p?.specifications));

  // Extract all unique detailed spec keys
  const uniqueDetailSpecKeys = Array.from(
    new Set(parsedDetailSpecsList.flatMap(specMap => Object.keys(specMap)))
  );

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Breadcrumb */}
      <div className="w-full max-w-7xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center justify-start gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-foreground font-medium">So sánh sản phẩm</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">So sánh sản phẩm</h1>
            <p className="text-muted-foreground text-sm mt-1">So sánh chi tiết thông số kỹ thuật và đặc điểm của các sản phẩm bạn quan tâm.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">Đang tải dữ liệu so sánh...</h2>
          </div>
        ) : compareProducts.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">Bạn chưa chọn sản phẩm nào để so sánh</h2>
            <p className="text-muted-foreground mb-8">Hãy duyệt qua các danh mục và chọn sản phẩm bạn muốn so sánh nhé.</p>
            <Link 
              href="/san-pham" 
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-md"
            >
              Khám phá sản phẩm ngay
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <table className="w-full min-w-[800px] border-collapse bg-card rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/50 text-sm">
              <thead>
                <tr>
                  <th className="p-6 border-b border-border/50 bg-secondary/10 w-48 min-w-[200px] whitespace-nowrap text-left font-bold text-foreground">
                    Sản phẩm
                  </th>
                  {compareProducts.map((product) => (
                    <th key={`header-${product?.id}`} className="p-6 border-b border-border/50 text-center relative w-1/3 min-w-[280px]">
                      <button 
                        onClick={() => removeCompareItem(product!.id)}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm z-10"
                        title="Xóa khỏi danh sách so sánh"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <ProductCompareImage src={product?.image} alt={product?.name || ''} />
                      <h3 
                        className="font-bold text-lg text-foreground mb-2 line-clamp-2 hover:text-primary cursor-pointer transition-colors leading-snug" 
                        onClick={() => router.push(`/san-pham/${product!.slug || product!.id}`)}
                      >
                        {product!.name}
                      </h3>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3.5 h-3.5"
                              fill={i < Math.floor(product!.rating || 5) ? '#F59E0B' : '#E5E7EB'}
                              color={i < Math.floor(product!.rating || 5) ? '#F59E0B' : '#E5E7EB'}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({product!.reviews || 120})</span>
                      </div>
                    </th>
                  ))}
                  {/* Empty columns to fill space if less than 3 products */}
                  {Array.from({ length: 3 - compareProducts.length }).map((_, i) => (
                    <th key={`empty-${i}`} className="p-6 border-b border-border/50 bg-muted/10 text-center w-1/3 min-w-[280px]">
                      <Link 
                        href={items.length > 0 ? `/danh-muc/${slugify(items[0].category)}` : '/san-pham'} 
                        className="w-full h-full min-h-[220px] flex flex-col items-center justify-center text-muted-foreground/60 border-2 border-dashed border-border/60 rounded-2xl hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer group p-4"
                      >
                        <span className="text-4xl mb-2 group-hover:scale-125 transition-transform duration-300 font-light">+</span>
                        <span className="font-semibold text-xs sm:text-sm">Thêm sản phẩm so sánh</span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* --- MỤC 1: THÔNG TIN CHUNG --- */}
                <tr className="bg-primary/5">
                  <td colSpan={1 + Math.max(3, compareProducts.length)} className="p-3 px-6 font-bold text-primary text-xs uppercase tracking-wider border-y border-primary/10">
                    <span className="flex items-center gap-2"><Info className="w-4 h-4" /> THÔNG TIN CHUNG</span>
                  </td>
                </tr>

                {/* Price Row */}
                <tr className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 px-6 border-b border-border/50 bg-secondary/10 font-medium text-foreground whitespace-nowrap">Giá bán</td>
                  {compareProducts.map((product) => (
                    <td key={`price-${product?.id}`} className="p-4 border-b border-border/50 text-center">
                      <div className="font-bold text-xl text-primary">{formatPrice(product)}</div>
                      {product?.originalPrice && !product?.isContactPrice && (
                        <div className="text-xs font-medium text-muted-foreground/70 line-through mt-0.5">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice)}</div>
                      )}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareProducts.length }).map((_, i) => (
                    <td key={`empty-price-${i}`} className="p-4 border-b border-border/50 bg-muted/10"></td>
                  ))}
                </tr>

                {/* Brand Row */}
                <tr className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 px-6 border-b border-border/50 bg-secondary/10 font-medium text-foreground whitespace-nowrap">Thương hiệu</td>
                  {compareProducts.map((product) => (
                    <td key={`brand-${product?.id}`} className="p-4 border-b border-border/50 text-center font-semibold text-foreground">
                      {product?.brand || 'Chính hãng'}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareProducts.length }).map((_, i) => (
                    <td key={`empty-brand-${i}`} className="p-4 border-b border-border/50 bg-muted/10"></td>
                  ))}
                </tr>

                {/* Category Row */}
                <tr className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 px-6 border-b border-border/50 bg-secondary/10 font-medium text-foreground whitespace-nowrap">Danh mục</td>
                  {compareProducts.map((product) => (
                    <td key={`category-${product?.id}`} className="p-4 border-b border-border/50 text-center text-foreground">
                      {product?.category || 'Chưa phân loại'}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareProducts.length }).map((_, i) => (
                    <td key={`empty-category-${i}`} className="p-4 border-b border-border/50 bg-muted/10"></td>
                  ))}
                </tr>

                {/* SKU Row */}
                <tr className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 px-6 border-b border-border/50 bg-secondary/10 font-medium text-foreground whitespace-nowrap">Mã sản phẩm (SKU)</td>
                  {compareProducts.map((product) => (
                    <td key={`sku-${product?.id}`} className="p-4 border-b border-border/50 text-center text-muted-foreground font-mono text-xs">
                      {product?.sku || 'Đang cập nhật'}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareProducts.length }).map((_, i) => (
                    <td key={`empty-sku-${i}`} className="p-4 border-b border-border/50 bg-muted/10"></td>
                  ))}
                </tr>

                {/* Status Row */}
                <tr className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 px-6 border-b border-border/50 bg-secondary/10 font-medium text-foreground whitespace-nowrap">Tình trạng kho</td>
                  {compareProducts.map((product) => (
                    <td key={`stock-${product?.id}`} className="p-4 border-b border-border/50 text-center">
                      {product!.stock > 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
                          <Check className="w-3.5 h-3.5" /> Còn hàng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-semibold border border-red-200">
                          <X className="w-3.5 h-3.5" /> Hết hàng
                        </span>
                      )}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareProducts.length }).map((_, i) => (
                    <td key={`empty-stock-${i}`} className="p-4 border-b border-border/50 bg-muted/10"></td>
                  ))}
                </tr>

                {/* --- MỤC 2: THÔNG TIN NHANH / NỔI BẬT --- */}
                {uniqueQuickSpecKeys.length > 0 && (
                  <>
                    <tr className="bg-primary/5">
                      <td colSpan={1 + Math.max(3, compareProducts.length)} className="p-3 px-6 font-bold text-primary text-xs uppercase tracking-wider border-y border-primary/10">
                        <span className="flex items-center gap-2"><ListFilter className="w-4 h-4" /> THÔNG TIN NỔI BẬT (QUICK SPECS)</span>
                      </td>
                    </tr>
                    {uniqueQuickSpecKeys.map((key) => (
                      <tr key={`quick-spec-${key}`} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4 px-6 border-b border-border/50 bg-secondary/10 font-medium text-foreground whitespace-nowrap">{key}</td>
                        {compareProducts.map((product, pIdx) => {
                          const val = parsedQuickSpecsList[pIdx]?.[key] || '—';
                          return (
                            <td key={`quick-spec-val-${product?.id}-${key}`} className="p-4 border-b border-border/50 text-center text-foreground font-medium">
                              {val}
                            </td>
                          );
                        })}
                        {Array.from({ length: 3 - compareProducts.length }).map((_, i) => (
                          <td key={`empty-quick-spec-${key}-${i}`} className="p-4 border-b border-border/50 bg-muted/10"></td>
                        ))}
                      </tr>
                    ))}
                  </>
                )}

                {/* --- MỤC 3: THÔNG SỐ KỸ THUẬT CHI TIẾT --- */}
                {uniqueDetailSpecKeys.length > 0 && (
                  <>
                    <tr className="bg-primary/5">
                      <td colSpan={1 + Math.max(3, compareProducts.length)} className="p-3 px-6 font-bold text-primary text-xs uppercase tracking-wider border-y border-primary/10">
                        <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> THÔNG SỐ KỸ THUẬT CHI TIẾT</span>
                      </td>
                    </tr>
                    {uniqueDetailSpecKeys.map((key) => (
                      <tr key={`detail-spec-${key}`} className="hover:bg-muted/10 transition-colors">
                        <td className="p-4 px-6 border-b border-border/50 bg-secondary/10 font-medium text-foreground whitespace-nowrap">{key}</td>
                        {compareProducts.map((product, pIdx) => {
                          const val = parsedDetailSpecsList[pIdx]?.[key] || '—';
                          return (
                            <td key={`detail-spec-val-${product?.id}-${key}`} className="p-4 border-b border-border/50 text-center text-foreground">
                              {val}
                            </td>
                          );
                        })}
                        {Array.from({ length: 3 - compareProducts.length }).map((_, i) => (
                          <td key={`empty-detail-spec-${key}-${i}`} className="p-4 border-b border-border/50 bg-muted/10"></td>
                        ))}
                      </tr>
                    ))}
                  </>
                )}

                {/* Description Row */}
                <tr className="hover:bg-muted/10 transition-colors">
                  <td className="p-4 px-6 border-b border-border/50 bg-secondary/10 font-medium text-foreground align-top whitespace-nowrap">Mô tả tóm tắt</td>
                  {compareProducts.map((product) => (
                    <td key={`desc-${product?.id}`} className="p-4 border-b border-border/50 align-top text-muted-foreground text-xs leading-relaxed max-w-xs">
                      {product?.description ? (
                        <div className="line-clamp-4" dangerouslySetInnerHTML={{ __html: product.description }} />
                      ) : (
                        'Chưa có mô tả'
                      )}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareProducts.length }).map((_, i) => (
                    <td key={`empty-desc-${i}`} className="p-4 border-b border-border/50 bg-muted/10"></td>
                  ))}
                </tr>

                {/* Action Row */}
                <tr>
                  <td className="p-4 px-6 bg-secondary/10 font-bold text-foreground">Mua hàng</td>
                  {compareProducts.map((product) => (
                    <td key={`action-${product?.id}`} className="p-6 text-center bg-background/50">
                      <button 
                        onClick={() => addToCart({ id: product!.id, cartItemId: String(product!.id), name: product!.name, price: product!.price, image: cleanUrl(product!.image) })}
                        disabled={product!.stock === 0}
                        className="w-full mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {product?.isContactPrice || product?.price <= 0 ? 'Liên hệ báo giá' : 'Thêm vào giỏ'}
                      </button>
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareProducts.length }).map((_, i) => (
                    <td key={`empty-action-${i}`} className="p-6 bg-muted/10"></td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <Footer />
    </main>
  );
}
