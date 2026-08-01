'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Search, Home, ShoppingBag, PhoneCall, ArrowRight } from "lucide-react";

export default function NotFound() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/tim-kiem?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <>
      <Header />
      <main className="flex min-h-[65vh] flex-col items-center justify-center text-center px-4 py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-xl w-full mx-auto flex flex-col items-center">
          <span className="text-8xl md:text-9xl font-extrabold text-primary/20 tracking-widest select-none">
            404
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 mb-3">
            Trang bạn tìm kiếm không tồn tại
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mb-6 leading-relaxed">
            Có thể liên kết đã bị thay đổi, trang bị xóa hoặc đường dẫn từ Google đã cũ. Hãy thử tìm kiếm sản phẩm bên dưới:
          </p>

          {/* Smart Search Form */}
          <form onSubmit={handleSearch} className="w-full max-w-md flex gap-2 mb-8">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nhập tên máy in, mực in, thiết bị..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm shrink-0"
            >
              Tìm kiếm
            </button>
          </form>

          {/* Quick Categories */}
          <div className="w-full max-w-md bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-8">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Gợi ý truy cập nhanh
            </p>
            <div className="grid grid-cols-2 gap-2 text-left text-xs font-medium">
              <Link href="/danh-muc/may-in" className="p-2.5 rounded-lg bg-gray-50 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between group">
                <span>Máy in chính hãng</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
              <Link href="/danh-muc/vat-tu" className="p-2.5 rounded-lg bg-gray-50 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between group">
                <span>Mực in & Vật tư</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
              <Link href="/cho-thue-may" className="p-2.5 rounded-lg bg-gray-50 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between group">
                <span>Cho thuê máy in</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
              <Link href="/lien-he" className="p-2.5 rounded-lg bg-gray-50 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between group">
                <span>Liên hệ hỗ trợ</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/" className={buttonVariants({ variant: "default", size: "default" })}>
              <Home className="w-4 h-4 mr-2" /> Về trang chủ
            </Link>
            <Link href="/san-pham" className={buttonVariants({ variant: "outline", size: "default" })}>
              <ShoppingBag className="w-4 h-4 mr-2" /> Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
