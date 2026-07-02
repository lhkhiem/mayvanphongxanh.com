'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      clearCart();
      router.push('/checkout/success');
    }, 1500);
  };

  if (items.length === 0 && !isSubmitting) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
          <h2 className="text-2xl font-bold text-foreground mb-4">Giỏ hàng của bạn đang trống!</h2>
          <p className="text-muted-foreground mb-8">Vui lòng chọn thêm sản phẩm để tiến hành thanh toán.</p>
          <Link href="/san-pham" className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Quay lại Cửa hàng
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 mx-auto max-w-7xl px-4 py-8 w-full">
        <Link href="/san-pham" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Quay lại mua sắm
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-8">Thanh toán & Giao hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
              {/* Billing Info */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-6">Thông tin Giao hàng</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Họ và tên *</label>
                    <input required type="text" className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Nhập họ tên đầy đủ" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Số điện thoại *</label>
                    <input required type="tel" className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="VD: 0912345678" />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                  <input required type="email" className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Để gửi mã theo dõi đơn hàng" />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">Địa chỉ giao hàng chi tiết *</label>
                  <input required type="text" className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Ghi chú thêm (Tùy chọn)</label>
                  <textarea rows={3} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none" placeholder="Lưu ý giao hàng, giờ nhận hàng..."></textarea>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-6">Phương thức Thanh toán</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-secondary/30">
                    <input type="radio" name="payment" value="cod" defaultChecked className="w-5 h-5 text-primary focus:ring-primary border-border" />
                    <div>
                      <h4 className="font-semibold text-foreground">Thanh toán khi nhận hàng (COD)</h4>
                      <p className="text-sm text-muted-foreground">Kiểm tra hàng trước khi thanh toán</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input type="radio" name="payment" value="transfer" className="w-5 h-5 text-primary focus:ring-primary border-border" />
                    <div>
                      <h4 className="font-semibold text-foreground">Chuyển khoản ngân hàng</h4>
                      <p className="text-sm text-muted-foreground">Thông tin STK sẽ hiển thị ở bước tiếp theo</p>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-28">
              <h2 className="text-xl font-bold text-foreground mb-6">Tóm tắt Đơn hàng</h2>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-secondary">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                      <span className="absolute -top-2 -right-2 bg-primary text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground line-clamp-2">{item.name}</h4>
                      <p className="text-sm font-semibold text-primary mt-1">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tạm tính</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Phí giao hàng</span>
                  <span className="text-green-600 font-medium">Miễn phí</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-border">
                  <span className="text-foreground">Tổng cộng</span>
                  <span className="text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}</span>
                </div>
              </div>

              <button 
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center shadow-lg"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt Hàng Ngay'}
              </button>

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>Bảo mật thông tin 100%</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                  <Truck className="w-4 h-4 text-primary" />
                  <span>Giao hàng tận nơi toàn quốc</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
