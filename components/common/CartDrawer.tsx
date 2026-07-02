'use client';

import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full md:w-96 bg-background shadow-xl flex flex-col transform transition-transform duration-300 translate-x-0">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Giỏ hàng ({cartCount})
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
              <p className="text-muted-foreground">Giỏ hàng của bạn đang trống</p>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-primary font-medium hover:underline"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 bg-card border border-border rounded-lg">
                <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium text-foreground line-clamp-2 text-sm">{item.name}</h3>
                    <p className="font-bold text-primary text-sm mt-1">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-border rounded-md">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 hover:bg-secondary text-foreground"
                      >
                        -
                      </button>
                      <span className="px-2 text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 hover:bg-secondary text-foreground"
                      >
                        +
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                    >
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
          <div className="border-t border-border p-4 bg-secondary/30">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-foreground">Tổng cộng</span>
              <span className="font-bold text-xl text-primary">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}
              </span>
            </div>
            
            <Link 
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Tiến hành Thanh toán
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
