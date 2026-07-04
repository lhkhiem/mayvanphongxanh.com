'use client';

import { useState } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Search, ShieldCheck, FileText, Settings2, ShieldAlert } from 'lucide-react';

export default function WarrantyTrackingPage() {
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
        serialNumber: searchTerm.toUpperCase(),
        productName: 'Máy in Laser Đen Trắng Canon LBP 2900',
        purchaseDate: '15/01/2026',
        warrantyExpiry: '15/01/2027',
        status: 'Còn bảo hành',
        customerInfo: 'Nguyễn Văn A - 0912***789',
        warrantyPeriod: '12 Tháng',
        history: [
          { date: '15/01/2026', action: 'Kích hoạt bảo hành điện tử', note: 'Mua mới tại cửa hàng' }
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
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tra cứu Bảo hành
          </h1>
          <p className="text-muted-foreground">
            Kiểm tra thông tin bảo hành sản phẩm của bạn bằng Số Serial (S/N) hoặc Số điện thoại mua hàng.
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
              {isSearching ? 'Đang tìm...' : 'Kiểm Tra'}
            </button>
          </form>
        </div>

        {/* Tracking Result */}
        {result && (
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 md:p-8 border-b border-border bg-secondary/30">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{result.productName}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Settings2 className="w-4 h-4" />
                    <span>S/N: <strong className="text-foreground">{result.serialNumber}</strong></span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className={`px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 inline-flex ${
                    result.status === 'Còn bảo hành' 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {result.status === 'Còn bảo hành' ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                    {result.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-background rounded-lg border border-border">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ngày mua hàng</p>
                  <p className="font-medium text-foreground">{result.purchaseDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Thời hạn bảo hành</p>
                  <p className="font-medium text-foreground">{result.warrantyPeriod}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ngày hết hạn</p>
                  <p className="font-medium text-foreground">{result.warrantyExpiry}</p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <h4 className="font-bold text-lg text-foreground mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Lịch sử bảo hành / Sửa chữa
              </h4>
              
              {result.history.length > 0 ? (
                <div className="space-y-4">
                  {result.history.map((item: any, index: number) => (
                    <div key={index} className="flex gap-4 p-4 border border-border rounded-lg bg-secondary/10">
                      <div className="w-24 shrink-0 text-sm font-medium text-muted-foreground">
                        {item.date}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.action}</p>
                        <p className="text-sm text-muted-foreground mt-1">{item.note}</p>
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
