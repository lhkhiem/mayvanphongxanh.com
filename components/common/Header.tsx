'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingCart, Search, Menu, X, Phone, Mail, Clock,
  ChevronDown, ArrowRightLeft, Tag, Headphones, User
} from 'lucide-react';
import { Navigation } from './Navigation';
import { MobileMenu } from './MobileMenu';
import { useCart } from '@/context/CartContext';
import { CartDrawer } from './CartDrawer';
import { useCompare } from '@/context/CompareContext';
import { slugify, productSlug } from '@/lib/utils';
import { useSession, signOut } from 'next-auth/react';


// ──────────────────────────────────────────
// Inline SearchBar (full-width, with category select)
// ──────────────────────────────────────────
function InlineSearchBar({ categories = [] }: { categories?: any[] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [catOpen, setCatOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const catList = ['Tất cả', ...categories.map(c => c.name)];

  useEffect(() => {
    if (query.trim() === '') { setResults([]); return; }
    
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}${selectedCategory !== 'Tất cả' ? `&categoryName=${encodeURIComponent(selectedCategory)}` : ''}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.slice(0, 6));
        }
      } catch (err) {}
    }
    
    // Simple debounce
    const timeout = setTimeout(fetchResults, 300);
    return () => clearTimeout(timeout);
  }, [query, selectedCategory]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsFocused(false); setCatOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full md:flex-1 md:max-w-2xl">
      <div className={`flex items-stretch border rounded-lg overflow-hidden transition-all duration-200 bg-white ${isFocused ? 'ring-2 ring-primary/40 border-primary' : 'border-gray-300'}`}>
        {/* Category selector */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setCatOpen(!catOpen)}
            className="flex items-center gap-1 px-3 py-2.5 bg-gray-50 border-r border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            <span className="hidden sm:inline max-w-[90px] truncate">{selectedCategory}</span>
            <ChevronDown className="w-3.5 h-3.5 shrink-0" />
          </button>
          {catOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] py-1">
              {catList.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setCatOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedCategory === cat ? 'text-primary font-semibold bg-primary/5' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <input
          type="text"
          placeholder="Tìm sản phẩm, giải pháp..."
          className="flex-1 px-3 py-2.5 text-sm outline-none text-gray-800 placeholder-gray-400 min-w-0"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
        {query && (
          <button onClick={() => setQuery('')} className="px-2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
        <button className="px-3 sm:px-4 bg-primary hover:bg-primary/90 text-white transition-colors flex items-center gap-1.5 text-sm font-medium">
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Tìm</span>
        </button>
      </div>

      {/* Dropdown */}
      {isFocused && query.trim() !== '' && (
        <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-2xl z-[100] overflow-hidden">
          {results.length > 0 ? (
            <>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Gợi ý sản phẩm
              </div>
              {results.map(p => (
                <Link
                  key={p.id}
                  href={`/san-pham/${p.slug || productSlug(p.name, p.id)}`}
                  onClick={() => setIsFocused(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate group-hover:text-primary">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-primary font-bold">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                      </span>
                      {p.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-center">
                <Link
                  href={`/tim-kiem?q=${encodeURIComponent(query)}`}
                  onClick={() => setIsFocused(false)}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Xem tất cả kết quả cho &ldquo;{query}&rdquo; →
                </Link>
              </div>
            </>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              Không tìm thấy sản phẩm phù hợp
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────
// Main Header
// ──────────────────────────────────────────
export function Header({ categories = [] }: { categories?: any[] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount, setIsOpen } = useCart();
  const { items: compareItems } = useCompare();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full shadow-md">
      {/* ── Tier 1: Topbar ── */}
      <div className="bg-[#1B5E20] text-white py-1.5 text-xs">
        <div className="mx-auto max-w-7xl px-4 flex justify-between items-center">
          <div className="hidden sm:flex items-center gap-5">
            <a href="mailto:support@mayvanphongxanh.com" className="flex items-center gap-1.5 hover:text-green-200 transition-colors">
              <Mail className="w-3 h-3" />
              <span>support@mayvanphongxanh.com</span>
            </a>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>08:00 – 17:30 (Thứ 2 – Thứ 7)</span>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <a href="tel:0987654321" className="flex items-center gap-1.5 hover:text-green-200 transition-colors">
              <Phone className="w-3 h-3" />
              <span className="font-semibold">0987.654.321</span>
            </a>
            <Link href="/lien-he" className="flex items-center gap-1.5 hover:text-green-200 transition-colors">
              <Headphones className="w-3 h-3" />
              <span>Hỗ trợ kỹ thuật</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Tier 2: Main Header ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 md:py-0 md:h-[88px]">
            {/* Logo */}
            <Link href="/" className="shrink-0 flex items-center overflow-hidden w-36 md:w-52 h-12 md:h-16">
              <div className="relative w-full h-full mix-blend-multiply">
                <Image src="/logo.png" alt="Máy Văn Phòng Xanh" fill className="object-contain object-left scale-[3] md:scale-[3.5] origin-left" priority />
              </div>
            </Link>
            
            {/* Mobile Icons */}
            <div className="flex items-center gap-1 md:hidden">
              <button onClick={() => setIsOpen(true)} className="relative p-2 rounded-lg hover:bg-gray-100">
                 <ShoppingCart className="w-6 h-6 text-gray-700" />
                 {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Search bar */}
            <div className="w-full md:w-auto md:flex-1 order-3 md:order-none">
              <InlineSearchBar categories={categories} />
            </div>

            {/* Right actions (Desktop only) */}
            <div className="hidden md:flex items-center gap-1 shrink-0">
              {/* Quote */}
              <Link
                href="/lien-he"
                className="hidden lg:flex flex-col items-center px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-center group"
              >
                <Tag className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-gray-700 mt-1 whitespace-nowrap">Báo giá nhanh</span>
              </Link>

              {/* Hotline widget */}
              <a
                href="tel:0987654321"
                className="flex flex-col items-center px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <Phone className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-gray-900 mt-1 whitespace-nowrap">0987.654.321</span>
              </a>

              {/* Account / Login */}
              {session ? (
                <div className="relative group/account">
                  <Link
                    href="/tai-khoan"
                    className="flex flex-col items-center px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-600 group-hover/account:text-primary transition-colors" />
                    <span className="text-xs text-gray-700 mt-1 whitespace-nowrap max-w-[80px] truncate">
                      {session.user?.name || 'Tài khoản'}
                    </span>
                  </Link>
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover/account:opacity-100 group-hover/account:visible transition-all z-50 py-2">
                    <Link href="/tai-khoan" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">
                      Trang cá nhân
                    </Link>
                    <Link href="/tai-khoan/don-hang" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary">
                      Đơn hàng của tôi
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button 
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/dang-nhap"
                  className="flex flex-col items-center px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <User className="w-5 h-5 text-gray-600 group-hover:text-primary group-hover:scale-110 transition-all" />
                  <span className="text-xs text-gray-700 mt-1 whitespace-nowrap">Đăng nhập</span>
                </Link>
              )}

              {/* Compare */}
              <Link
                href="/so-sanh"
                className="relative flex flex-col items-center px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <ArrowRightLeft className="w-5 h-5 text-gray-600 group-hover:text-primary group-hover:scale-110 transition-all" />
                <span className="text-xs text-gray-700 mt-1 whitespace-nowrap">So sánh</span>
                {compareItems.length > 0 && (
                  <span className="absolute top-0.5 right-1.5 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {compareItems.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={() => setIsOpen(true)}
                className="relative flex flex-col items-center px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-primary group-hover:scale-110 transition-all" />
                <span className="text-xs text-gray-700 mt-1 whitespace-nowrap">Giỏ hàng</span>
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tier 3: Navbar ── */}
      <div className="hidden lg:block bg-[#2E7D32]">
        <div className="mx-auto max-w-7xl px-4">
          <Navigation />
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <MobileMenu onClose={() => setIsMenuOpen(false)} />
      )}

      <CartDrawer />
    </header>
  );
}
