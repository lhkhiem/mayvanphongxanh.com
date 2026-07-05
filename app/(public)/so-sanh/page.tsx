'use client';

import { useState, useEffect } from 'react';
import { useCompare } from '@/context/CompareContext';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { Check, X, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/utils';

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

  const formatPrice = (price?: number) => {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

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
          <h1 className="text-3xl font-bold text-foreground">So sánh sản phẩm</h1>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">Đang tải dữ liệu...</h2>
          </div>
        ) : compareProducts.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-4">Bạn chưa chọn sản phẩm nào để so sánh</h2>
            <p className="text-muted-foreground mb-8">Hãy duyệt qua các danh mục và chọn sản phẩm bạn muốn so sánh nhé.</p>
            <Link 
              href="/san-pham" 
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Xem sản phẩm
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <table className="w-full min-w-[800px] border-collapse bg-card rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/50">
              <thead>
                <tr>
                  <th className="p-6 border-b border-border/50 bg-secondary/10 w-48 min-w-[200px] whitespace-nowrap text-left font-bold text-foreground">
                    Tiêu chí
                  </th>
                  {compareProducts.map((product) => (
                    <th key={`header-${product?.id}`} className="p-8 border-b border-border/50 text-center relative w-1/3 min-w-[280px]">
                      <button 
                        onClick={() => removeCompareItem(product!.id)}
                        className="absolute top-6 right-6 w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                        title="Xóa khỏi danh sách so sánh"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="relative w-48 h-48 mx-auto mb-6 bg-white rounded-xl p-3 border border-border/50 shadow-sm">
                        <Image 
                          src={product!.image} 
                          alt={product!.name} 
                          fill 
                          className="object-contain hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="font-bold text-xl text-foreground mb-3 line-clamp-2 hover:text-primary cursor-pointer transition-colors" onClick={() => router.push(`/san-pham/${product!.slug || product!.id}`)}>
                        {product!.name}
                      </h3>
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4"
                              fill={i < Math.floor(product!.rating) ? '#F59E0B' : '#E5E7EB'}
                              color={i < Math.floor(product!.rating) ? '#F59E0B' : '#E5E7EB'}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">({product!.reviews})</span>
                      </div>
                    </th>
                  ))}
                  {/* Empty columns to fill space if less than 3 products */}
                  {Array.from({ length: 3 - compareProducts.length }).map((_, i) => (
                    <th key={`empty-${i}`} className="p-8 border-b border-border/50 bg-muted/10 text-center w-1/3 min-w-[280px]">
                      <Link 
                        href={items.length > 0 ? `/category/${slugify(items[0].category)}` : '/products'} 
                        className="w-full h-full min-h-[250px] flex flex-col items-center justify-center text-muted-foreground/50 border-2 border-dashed border-border/50 rounded-2xl hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer group"
                      >
                        <span className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">+</span>
                        <span className="font-medium">Thêm sản phẩm</span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price Row */}
                <tr className="hover:bg-muted/10 transition-colors">
                  <td className="p-6 border-b border-border/50 bg-secondary/10 font-medium text-foreground whitespace-nowrap">Giá bán</td>
                  {compareProducts.map((product) => (
                    <td key={`price-${product?.id}`} className="p-6 border-b border-border/50 text-center">
                      <div className="font-bold text-2xl text-primary">{formatPrice(product?.price)}</div>
                      {product?.originalPrice && (
                        <div className="text-sm font-medium text-muted-foreground/70 line-through mt-1">{formatPrice(product.originalPrice)}</div>
                      )}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareProducts.length }).map((_, i) => (
                    <td key={`empty-price-${i}`} className="p-6 border-b border-border/50 bg-muted/10"></td>
                  ))}
                </tr>

                {/* Status Row */}
                <tr className="hover:bg-muted/10 transition-colors">
                  <td className="p-6 border-b border-border/50 bg-secondary/10 font-medium text-foreground whitespace-nowrap">Tình trạng</td>
                  {compareProducts.map((product) => (
                    <td key={`stock-${product?.id}`} className="p-6 border-b border-border/50 text-center">
                      {product!.stock > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full text-sm font-semibold border border-emerald-100 shadow-sm">
                          <Check className="w-4 h-4" /> Còn hàng ({product!.stock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 px-4 py-1.5 rounded-full text-sm font-semibold border border-red-100 shadow-sm">
                          <X className="w-4 h-4" /> Hết hàng
                        </span>
                      )}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareProducts.length }).map((_, i) => (
                    <td key={`empty-stock-${i}`} className="p-6 border-b border-border/50 bg-muted/10"></td>
                  ))}
                </tr>

                {/* Description Row */}
                <tr className="hover:bg-muted/10 transition-colors">
                  <td className="p-6 border-b border-border/50 bg-secondary/10 font-medium text-foreground align-top whitespace-nowrap">Mô tả nổi bật</td>
                  {compareProducts.map((product) => (
                    <td key={`desc-${product?.id}`} className="p-6 border-b border-border/50 align-top text-muted-foreground leading-relaxed">
                      {product?.description}
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareProducts.length }).map((_, i) => (
                    <td key={`empty-desc-${i}`} className="p-6 border-b border-border/50 bg-muted/10"></td>
                  ))}
                </tr>

                {/* Action Row */}
                <tr>
                  <td className="p-6 bg-secondary/10"></td>
                  {compareProducts.map((product) => (
                    <td key={`action-${product?.id}`} className="p-8 text-center bg-background/50">
                      <button 
                        onClick={() => addToCart({ id: product!.id, cartItemId: String(product!.id), name: product!.name, price: product!.price, image: product!.image })}
                        disabled={product!.stock === 0}
                        className="w-full mx-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Thêm vào giỏ
                      </button>
                    </td>
                  ))}
                  {Array.from({ length: 3 - compareProducts.length }).map((_, i) => (
                    <td key={`empty-action-${i}`} className="p-8 bg-muted/10"></td>
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
