'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Star, ArrowRightLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCompare } from '@/context/CompareContext';
import { productSlug } from '@/lib/utils';

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
}: ProductCardProps) {
  const [showCompareToast, setShowCompareToast] = useState(false);
  const [showCompareErrorToast, setShowCompareErrorToast] = useState('');
  const [imageError, setImageError] = useState(false);
  
  const { addToCart } = useCart();
  const { addCompareItem, removeCompareItem, hasItem } = useCompare();
  
  const router = useRouter();
  const discount = originalPrice && price > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  
  const isCompared = hasItem(id);

  const handleAddToCart = () => {
    addToCart({ id, name, price, image });
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
        className="relative overflow-hidden bg-white h-48 md:h-52 mb-4 flex items-center justify-center cursor-pointer"
        onClick={() => router.push(`/san-pham/${productSlug(name, id)}`)}
      >
        {!imageError ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
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
        <Link href={`/san-pham/${productSlug(name, id)}`}>
          <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-[13px] leading-snug hover:text-primary transition-colors min-h-[36px]">
            {name}
          </h3>
        </Link>

        {/* Rating and SKU */}
        <div className="flex items-center gap-1.5 mb-1">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-3 h-3"
                fill={i < Math.floor(rating) ? '#FBBF24' : '#E5E7EB'}
                color={i < Math.floor(rating) ? '#FBBF24' : '#E5E7EB'}
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-500">({reviews})</span>
        </div>
        <div className="text-[11px] text-gray-500 mb-3">
          Mã SP: <span className="font-medium text-gray-700 uppercase">{sku || `HPT-${id}`}</span>
        </div>

        {/* Price */}
        <div className="mt-auto">
          {price > 0 ? (
            <div className="flex items-end gap-2 justify-between">
              <div>
                {originalPrice && (
                  <div className="text-[11px] text-gray-400 line-through mb-0.5">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(originalPrice)}
                  </div>
                )}
                <div className="font-bold text-[17px] text-primary">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                </div>
              </div>
              {/* Discount Badge on the right of price */}
              {discount > 0 && (
                <div className="bg-primary text-white px-1.5 py-0.5 text-[10px] font-bold rounded mb-1">
                  -{discount}%
                </div>
              )}
            </div>
          ) : (
            <div className="font-bold text-[17px] text-primary mt-4">Liên hệ</div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex gap-3">
          <button 
            onClick={handleToggleCompare}
            className={`flex items-center gap-1 text-[11px] transition-colors font-medium ${
              isCompared ? 'text-primary' : 'text-gray-500 hover:text-primary'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" /> So sánh
          </button>
          
          {stock > 0 ? (
            <div className="flex items-center gap-1 text-[11px] text-green-600 font-medium">
              <span className="text-sm leading-none mt-[-2px]">✓</span> Còn hàng
            </div>
          ) : (
            <div className="text-[11px] text-red-500 font-medium">Hết hàng</div>
          )}
        </div>

        <button 
          onClick={handleAddToCart}
          disabled={stock === 0}
          className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded shadow-sm hover:bg-primary/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          title="Thêm vào giỏ"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
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
