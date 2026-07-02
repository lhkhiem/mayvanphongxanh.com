'use client';

import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { CheckCircle, Truck, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CheckoutSuccessPage() {
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    // Generate a random order ID for mock purposes
    const randomId = Math.floor(100000 + Math.random() * 900000);
    setOrderId(`MVPX-${randomId}`);
  }, []);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-2xl w-full bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm text-center">
          
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-8">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Đặt hàng thành công!
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Cảm ơn bạn đã mua sắm tại Giải pháp Máy Văn Phòng Xanh. Đơn hàng của bạn đã được hệ thống ghi nhận và đang chờ xử lý.
          </p>

          <div className="bg-secondary/50 rounded-xl p-6 mb-8 inline-block min-w-[300px]">
            <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng của bạn</p>
            <p className="text-2xl font-bold text-primary tracking-wider">{orderId}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
            <div className="flex items-start gap-4 p-4 border border-border rounded-lg bg-background">
              <Package className="w-6 h-6 text-primary mt-1" />
              <div>
                <h4 className="font-semibold text-foreground">Chuẩn bị hàng</h4>
                <p className="text-sm text-muted-foreground mt-1">Đơn hàng sẽ được đóng gói trong 24h tới.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 border border-border rounded-lg bg-background">
              <Truck className="w-6 h-6 text-primary mt-1" />
              <div>
                <h4 className="font-semibold text-foreground">Giao hàng</h4>
                <p className="text-sm text-muted-foreground mt-1">Dự kiến giao đến bạn trong 2-3 ngày làm việc.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/order-tracking" 
              className="px-8 py-3 bg-secondary text-foreground rounded-lg font-semibold hover:bg-secondary/80 border border-border transition-colors flex items-center justify-center gap-2"
            >
              Tra cứu đơn hàng
            </Link>
            <Link 
              href="/" 
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Tiếp tục mua sắm
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
