'use client';

import { useState } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Search, Package, CheckCircle, Truck, Clock } from 'lucide-react';

export default function OrderTrackingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsSearching(false);
      setResult({
        id: searchTerm.startsWith('MVPX') ? searchTerm : 'MVPX-658291',
        date: '30/06/2026 10:15',
        status: 'Đang giao hàng',
        customerInfo: 'Nguyễn Văn A - 0912***789',
        items: 2,
        total: 16500000,
        timeline: [
          { status: 'Đã đặt hàng', time: '30/06/2026 10:15', completed: true },
          { status: 'Đã xác nhận thanh toán', time: '30/06/2026 10:30', completed: true },
          { status: 'Đang đóng gói', time: '30/06/2026 14:00', completed: true },
          { status: 'Đang giao hàng', time: '01/07/2026 08:30', completed: true },
          { status: 'Giao hàng thành công', time: 'Dự kiến 01/07/2026', completed: false }
        ]
      });
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 mx-auto max-w-3xl px-4 py-16 w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tra cứu Đơn hàng
          </h1>
          <p className="text-muted-foreground">
            Kiểm tra tình trạng đơn hàng của bạn bằng Mã đơn hàng, Số điện thoại hoặc Email.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm mb-12">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-lg"
                placeholder="VD: MVPX-123456 hoặc 0912345678"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="sm:w-48 py-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {isSearching ? 'Đang tìm...' : 'Tra Cứu'}
            </button>
          </form>
        </div>

        {/* Tracking Result */}
        {result && (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 md:p-8 border-b border-border bg-secondary/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng</p>
                  <h3 className="text-2xl font-bold text-foreground">{result.id}</h3>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-muted-foreground mb-1">Ngày đặt</p>
                  <p className="font-medium text-foreground">{result.date}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-6">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  {result.status}
                </span>
                <span className="px-4 py-2 bg-background border border-border rounded-full font-medium text-sm text-foreground">
                  Tổng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.total)}
                </span>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <h4 className="font-bold text-lg text-foreground mb-6">Trạng thái vận chuyển</h4>
              
              <div className="relative border-l-2 border-border ml-3 space-y-8">
                {result.timeline.map((step: any, index: number) => (
                  <div key={index} className="relative pl-8">
                    {/* Circle icon */}
                    <div className={`absolute -left-[11px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-green-500' : 'bg-secondary border-2 border-muted'
                    }`}>
                      {step.completed && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    
                    <div>
                      <h5 className={`font-semibold ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.status}
                      </h5>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        {step.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </main>
  );
}
