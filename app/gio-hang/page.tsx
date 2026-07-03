'use client';

import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

export default function CartPage() {
  const { items, cartTotal, updateQuantity, removeFromCart } = useCart();

  const subtotal = cartTotal;
  const shipping = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + shipping;

  return (
    <main className="min-h-screen bg-[#F4F7F6] flex flex-col">
      <Header />

      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <Link href="/san-pham" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          Tiếp tục mua sắm
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingBag className="w-7 h-7 text-primary" />
          Giỏ hàng của bạn ({items.reduce((acc, i) => acc + i.quantity, 0)} sản phẩm)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {items.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex gap-6 p-6 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                    <div className="relative w-28 h-28 border border-gray-200 rounded-lg bg-white overflow-hidden flex-shrink-0 p-2">
                      <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <Link href={`/san-pham/${item.id}`} className="font-semibold text-gray-800 text-lg hover:text-primary transition-colors line-clamp-2">
                            {item.name}
                          </Link>
                          <button onClick={() => removeFromCart(item.cartItemId)} className="p-2 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-lg transition-colors flex-shrink-0">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        {item.variantName && (
                          <p className="text-sm text-gray-500 mt-1">{item.variantName}</p>
                        )}
                        <p className="text-xl font-bold text-primary mt-2">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                          <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="p-2 hover:bg-gray-100 text-gray-600 transition-colors">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 text-gray-800 font-semibold w-12 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="p-2 hover:bg-gray-100 text-gray-600 transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-gray-800 font-bold hidden sm:block">
                          Tổng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-16 text-center shadow-sm">
                <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Giỏ hàng đang trống</h3>
                <p className="text-gray-500 mb-8">Hãy tìm hiểu các sản phẩm tuyệt vời của chúng tôi và thêm vào giỏ hàng nhé!</p>
                <Link href="/san-pham" className="inline-block px-8 py-3.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg">
                  Khám phá ngay
                </Link>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {items.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Tóm tắt đơn hàng</h2>
                
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="font-medium">{shipping === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shipping)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-lg mb-8">
                  <span className="font-bold text-gray-900">Tổng cộng</span>
                  <span className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                  </span>
                </div>

                {shipping === 0 && (
                  <p className="text-sm text-green-700 font-medium mb-6 p-3.5 bg-green-50 border border-green-100 rounded-lg flex items-center justify-center gap-2">
                    <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                    Đơn hàng được miễn phí giao hàng
                  </p>
                )}

                <Link href="/thanh-toan" className="w-full block px-6 py-4 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary/90 transition-all text-center mb-4 shadow-md hover:shadow-lg">
                  Tiến hành thanh toán
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
