'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Star, ArrowRightLeft, PhoneCall } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCompare } from '@/context/CompareContext';
import { productSlug } from '@/lib/utils';
import { WatermarkedImage } from './WatermarkedImage';

export interface ProductCardProps {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  stock: number;
  brand?: string;
  sku?: string;
  slug?: string;
  variantId?: string;
  productType?: string;
  isContactPrice?: boolean;
  vatStatus?: string | null;
}

export function ProductCard({
  id,
  name,
  category,
  price,
  originalPrice,
  rating,
  reviews,
  image,
  stock,
  sku,
  slug,
  variantId,
  productType,
  isContactPrice = false,
  vatStatus,
}: ProductCardProps) {
  const [showCompareToast, setShowCompareToast] = useState(false);
  const [showCompareErrorToast, setShowCompareErrorToast] = useState('');
  const [imageError, setImageError] = useState(false);

  const hrefSlug = slug || productSlug(name, id);

  const { addToCart } = useCart();
  const { addCompareItem, removeCompareItem, hasItem } = useCompare();

  const router = useRouter();
  const showContactPrice = isContactPrice || price <= 0;
  const discount = !showContactPrice && originalPrice && price > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const isCompared = hasItem(id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showContactPrice) {
      router.push(`/san-pham/${hrefSlug}`);
      return;
    }
    addToCart({ id, variantId, cartItemId: variantId ? `${id}-${variantId}` : String(id), name, price, image, sku });
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isCompared) {
      const result = addCompareItem({ id, name, category, image });
      if (!result.success) {
        setShowCompareErrorToast(result.message || 'Không thể so sánh');
        return;
      }
      setShowCompareToast(true);
    } else {
      removeCompareItem(id);
      setShowCompareToast(true);
    }
  };

  useEffect(() => {
    if (showCompareToast) {
      const timer = setTimeout(() => setShowCompareToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showCompareToast]);

  useEffect(() => {
    if (showCompareErrorToast) {
      const timer = setTimeout(() => setShowCompareErrorToast(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [showCompareErrorToast]);

  return (
    <div className="group bg-white border border-gray-200 hover:border-primary overflow-hidden transition-all duration-300 h-full flex flex-col relative p-3 md:p-4 rounded-lg hover:shadow-[0_0_15px_rgba(46,125,50,0.15)]">
      {/* Image Container */}
      <div 
        className="relative overflow-hidden bg-white h-72 sm:h-60 md:h-60 mb-3 sm:mb-4 flex items-center justify-center cursor-pointer group/img"
        onClick={() => router.push(`/san-pham/${hrefSlug}`)}
      >
        {/* Badges on Image (Cho thuê & Stock status) */}
        {(productType === 'rental' || stock <= 0) && (
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
            {productType === 'rental' && (
              <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                Cho Thuê
              </span>
            )}
            {stock <= 0 && (
              <span className="bg-red-600/90 text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded shadow-xs backdrop-blur-xs">
                Hết hàng
              </span>
            )}
          </div>
        )}

        {/* Compare Button (Hiện sẵn trên Mobile, Hover trên Desktop) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleCompare(e);
          }}
          className={`absolute top-2 right-2 z-20 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full shadow-md backdrop-blur-xs transition-all duration-200 text-[11px] sm:text-xs font-semibold ${
            isCompared 
              ? 'bg-primary text-white opacity-100 scale-100' 
              : 'bg-white/95 text-gray-700 hover:text-primary hover:bg-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 translate-y-0 sm:translate-y-1 sm:group-hover:translate-y-0'
          }`}
          title={isCompared ? "Bỏ so sánh" : "Thêm vào so sánh"}
        >
          <ArrowRightLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span>{isCompared ? 'Đã so sánh' : 'So sánh'}</span>
        </button>

        {!imageError ? (
          <WatermarkedImage
            src={image}
            alt={name}
            className="w-full h-full object-contain p-0 group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center text-gray-400 gap-2">
            <ShoppingCart className="w-8 h-8 opacity-20" />
            <span className="text-xs font-medium">Chưa có ảnh</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <Link href={`/san-pham/${hrefSlug}`}>
          <h3 className="font-bold text-gray-800 mb-1.5 sm:mb-2 line-clamp-2 text-xs sm:text-sm md:text-[15px] leading-snug hover:text-primary transition-colors min-h-[36px] sm:min-h-[44px]">
            {name}
          </h3>
        </Link>

        {/* Rating and SKU */}
        {reviews > 0 && (
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5"
                  fill={i < Math.floor(rating || 0) ? '#FBBF24' : '#E5E7EB'}
                  color={i < Math.floor(rating || 0) ? '#FBBF24' : '#E5E7EB'}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({reviews})</span>
          </div>
        )}
        <div className="text-xs text-primary/80 font-medium uppercase tracking-wider mb-2 sm:mb-3 line-clamp-1">
          {category}
        </div>

        {/* Footer: Giá & Nút Thao tác (Liên hệ / Giỏ hàng) */}
        <div className="mt-auto pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
          {!showContactPrice ? (
            <>
              <div className="flex-1 min-w-0">
                <div className="flex items-end gap-1.5 justify-between">
                  <div>
                    {originalPrice && (
                      <div className="text-xs text-gray-400 line-through mb-0.5">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice)}
                      </div>
                    )}
                    <div className="font-bold text-base sm:text-lg text-primary truncate flex items-center gap-1.5 flex-wrap">
                      <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}</span>
                      {productType === 'rental' && <span className="text-xs font-normal text-muted-foreground ml-0.5">/ tháng</span>}
                    </div>
                  </div>
                  {discount > 0 && (
                    <div className="bg-primary text-white px-1.5 py-0.5 text-[11px] font-bold rounded mb-0.5 shrink-0">
                      -{discount}%
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={stock === 0}
                className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed shadow-xs transition-colors"
                title={productType === 'rental' ? "Đăng ký thuê" : "Thêm vào giỏ"}
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </>
          ) : (
            /* Khi sản phẩm có Giá Liên hệ: Chỉ hiển thị duy nhất 1 Nút Liên hệ tràn chiều ngang */
            <button 
              onClick={handleAddToCart}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              title="Liên hệ báo giá"
            >
              <PhoneCall className="w-4 h-4 shrink-0" />
              <span>Liên hệ</span>
            </button>
          )}
        </div>
      </div>

      {/* Local Toasts */}
      {showCompareToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap animate-in fade-in duration-200 z-10">
          {isCompared ? 'Đã thêm so sánh' : 'Bỏ so sánh'}
        </div>
      )}
      {showCompareErrorToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap animate-in fade-in duration-200 shadow-md z-10">
          {showCompareErrorToast}
        </div>
      )}
    </div>
  );
}
