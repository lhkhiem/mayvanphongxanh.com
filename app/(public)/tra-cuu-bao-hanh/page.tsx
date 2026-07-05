'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Search, ShieldCheck, FileText, Settings2, ShieldAlert, AlertCircle } from 'lucide-react';

type WarrantyHistory = {
  id: number;
  typeLabel: string;
  title: string;
  note: string | null;
  eventDate: string;
};

type WarrantyResult = {
  serialNumber: string;
  productName: string;
  sku: string | null;
  purchaseDate: string;
  expiresAt: string;
  warrantyMonths: number;
  status: string;
  statusLabel: string;
  customerInfo: string;
  history: WarrantyHistory[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export default function WarrantyTrackingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<WarrantyResult | null>(null);
  const [error, setError] = useState('');

  const searchWarranty = async (query: string) => {
    const value = query.trim();
    if (!value) return;

    setIsSearching(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/warranties/lookup?query=${encodeURIComponent(value)}`, {
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Không thể tra cứu bảo hành.');
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tra cứu bảo hành.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchWarranty(searchTerm);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const serial = params.get('serial');
    if (serial) {
      setSearchTerm(serial);
      searchWarranty(serial);
    }
  }, []);

  const isActive = result?.status === 'ACTIVE';

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 mx-auto max-w-3xl px-4 py-16 w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tra cứu Bảo hành
          </h1>
          <p className="text-muted-foreground">
            Kiểm tra thông tin bảo hành sản phẩm bằng số Serial/SN, số điện thoại hoặc email mua hàng.
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
                className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-lg uppercase"
                placeholder="VD: SN123456789 hoặc 0912345678"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="sm:w-48 py-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {isSearching ? 'Đang tìm...' : 'Kiểm tra'}
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
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-foreground mb-2">{result.productName}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Settings2 className="w-4 h-4" />
                      S/N: <strong className="text-foreground font-mono break-all">{result.serialNumber}</strong>
                    </span>
                    {result.sku && <span>SKU: <strong className="text-foreground">{result.sku}</strong></span>}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className={`px-4 py-2 rounded-full font-semibold text-sm inline-flex items-center gap-2 ${
                    isActive
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {isActive ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                    {result.statusLabel}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-background rounded-lg border border-border">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ngày mua hàng</p>
                  <p className="font-medium text-foreground">{formatDate(result.purchaseDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Thời hạn bảo hành</p>
                  <p className="font-medium text-foreground">{result.warrantyMonths} tháng</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ngày hết hạn</p>
                  <p className="font-medium text-foreground">{formatDate(result.expiresAt)}</p>
                </div>
              </div>

              <p className="mt-5 text-sm text-muted-foreground">{result.customerInfo}</p>
            </div>

            <div className="p-6 md:p-8">
              <h4 className="font-bold text-lg text-foreground mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Lịch sử bảo hành / Sửa chữa
              </h4>
              
              {result.history.length > 0 ? (
                <div className="space-y-4">
                  {result.history.map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 border border-border rounded-lg bg-secondary/10">
                      <div className="w-32 shrink-0 text-sm font-medium text-muted-foreground">
                        {formatDate(item.eventDate)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">{item.typeLabel}</p>
                        <p className="font-medium text-foreground">{item.title}</p>
                        {item.note && <p className="text-sm text-muted-foreground mt-1">{item.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">Chưa có lịch sử bảo hành hoặc sửa chữa.</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </main>
  );
}