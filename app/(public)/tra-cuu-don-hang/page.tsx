'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Search, Package, CheckCircle, Truck, Clock, AlertCircle, CreditCard } from 'lucide-react';

type TimelineStep = {
  status: string;
  time: string | null;
  completed: boolean;
};

type TrackingItem = {
  id: number;
  productName: string;
  variantName: string | null;
  sku: string;
  price: number;
  quantity: number;
};

type TrackingResult = {
  id: string;
  createdAt: string;
  statusLabel: string;
  paymentStatusLabel: string;
  paymentMethod: string;
  customerInfo: string;
  itemCount: number;
  totalAmount: number;
  items: TrackingItem[];
  timeline: TimelineStep[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return 'Đang cập nhật';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export default function OrderTrackingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState('');

  const searchOrder = async (query: string) => {
    const value = query.trim();
    if (!value) return;

    setIsSearching(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/orders/lookup?query=${encodeURIComponent(value)}`, {
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Không thể tra cứu đơn hàng.');
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tra cứu đơn hàng.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchOrder(searchTerm);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');
    if (orderId) {
      setSearchTerm(orderId);
      searchOrder(orderId);
    }
  }, []);

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
            Kiểm tra tình trạng đơn hàng bằng mã đơn hàng, số điện thoại hoặc email đã đặt hàng.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm mb-8">
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
                placeholder="VD: 63dc95b1-6e2f-4e65-b9fd-c18a71c46bef hoặc 0912345678"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="sm:w-48 py-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {isSearching ? 'Đang tìm...' : 'Tra cứu'}
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 flex gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {result && (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 md:p-8 border-b border-border bg-secondary/30">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground mb-1">Mã đơn hàng</p>
                  <h3 className="text-lg md:text-xl font-bold text-foreground font-mono break-all">{result.id}</h3>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <p className="text-sm text-muted-foreground mb-1">Ngày đặt</p>
                  <p className="font-medium text-foreground">{formatDate(result.createdAt)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  {result.statusLabel}
                </span>
                <span className="px-4 py-2 bg-background border border-border rounded-full font-medium text-sm text-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  {result.paymentStatusLabel}
                </span>
                <span className="px-4 py-2 bg-background border border-border rounded-full font-medium text-sm text-foreground">
                  Tổng: {formatCurrency(result.totalAmount)}
                </span>
              </div>

              <p className="mt-5 text-sm text-muted-foreground">{result.customerInfo}</p>
            </div>

            <div className="p-6 md:p-8 border-b border-border">
              <h4 className="font-bold text-lg text-foreground mb-4">Sản phẩm trong đơn</h4>
              <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                {result.items.map((item) => (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-background">
                    <div>
                      <p className="font-semibold text-foreground">{item.productName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        SKU: {item.sku} {item.variantName ? `• ${item.variantName}` : ''}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(item.price)}</p>
                      <p className="text-xs text-muted-foreground">Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 md:p-8">
              <h4 className="font-bold text-lg text-foreground mb-6">Trạng thái vận chuyển</h4>
              
              <div className="relative border-l-2 border-border ml-3 space-y-8">
                {result.timeline.map((step, index) => (
                  <div key={`${step.status}-${index}`} className="relative pl-8">
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
                        {formatDate(step.time)}
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