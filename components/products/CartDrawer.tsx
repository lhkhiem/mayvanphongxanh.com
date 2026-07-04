'use client';

import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, cartTotal, updateQuantity, removeFromCart } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-screen w-full md:w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Giỏ hàng của bạn
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-12 flex flex-col items-center">
              <ShoppingBag className="w-12 h-12 mb-4 text-gray-300" />
              <p>Giỏ hàng đang trống</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.cartItemId} className="flex gap-4 border-b border-gray-100 pb-4">
                <div className="w-20 h-20 bg-gray-50 rounded-lg flex-shrink-0 relative overflow-hidden border border-gray-100">
                  <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`/san-pham/${item.id}`} onClick={onClose} className="font-semibold text-gray-800 text-sm hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {item.name}
                    </Link>
                    {(item.variantName || item.sku) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.variantName}
                        {item.variantName && item.sku && " - "}
                        {item.sku && `SKU: ${item.sku}`}
                      </p>
                    )}
                    {item.attributes && Object.keys(item.attributes).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(item.attributes).map(([k, v]) => (
                          <span key={k} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {k}: {v as string}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-primary font-bold text-sm mt-1">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-0 border border-gray-200 rounded-md overflow-hidden bg-white">
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="p-1.5 hover:bg-gray-100 text-gray-600 transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.cartItemId)} className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-500 rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span className="font-medium text-gray-600">Tổng tiền:</span>
              <span className="font-bold text-primary">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/gio-hang"
                onClick={onClose}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold text-center hover:bg-gray-50 transition-colors"
              >
                Xem giỏ hàng
              </Link>
              <Link
                href="/thanh-toan"
                onClick={onClose}
                className="w-full px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-bold text-center hover:bg-primary/90 transition-colors shadow-sm"
              >
                Thanh toán
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
