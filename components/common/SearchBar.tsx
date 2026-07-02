'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { products } from '@/lib/mockData';
import { productSlug } from '@/lib/utils';
import Link from 'next/link';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(products);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
    } else {
      const lowercaseQuery = query.toLowerCase();
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(lowercaseQuery) ||
          product.category.toLowerCase().includes(lowercaseQuery)
      );
      setResults(filtered.slice(0, 5)); // Limit to 5 suggestions
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative hidden md:block z-50">
      <div
        className={`flex items-center gap-2 bg-secondary rounded-full px-4 py-2 border transition-all duration-300 w-40 lg:w-48 xl:w-64 ${
          isFocused ? 'border-primary ring-2 ring-primary/20 bg-background shadow-sm' : 'border-border'
        }`}
      >
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Tìm kiếm máy in, mực in, POS..."
          className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder-muted-foreground"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground shrink-0 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      <div
        className={`absolute top-full mt-2 w-full bg-background rounded-xl border border-border shadow-xl overflow-hidden transition-all duration-200 transform origin-top ${
          isFocused && query.trim() !== '' ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
        }`}
      >
        {results.length > 0 ? (
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Gợi ý sản phẩm
            </div>
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/san-pham/${productSlug(product.name, product.id)}`}
                className="flex items-center gap-3 px-4 py-2 hover:bg-secondary transition-colors"
                onClick={() => setIsFocused(false)}
              >
                <div className="w-12 h-12 rounded-md overflow-hidden bg-secondary shrink-0 relative border border-border">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">{product.name}</span>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span className="text-primary font-bold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-muted-foreground line-through text-[10px]">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            <div className="bg-secondary/30 p-2 border-t border-border text-center mt-2">
              <Link 
                href={`/tim-kiem?search=${encodeURIComponent(query)}`}
                className="text-xs text-primary font-medium hover:underline flex items-center justify-center gap-1"
                onClick={() => setIsFocused(false)}
              >
                <Search className="w-3 h-3" />
                Xem tất cả {products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase())).length} kết quả
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground">
            <Search className="w-8 h-8 mb-2 opacity-20" />
            <span className="text-sm">Không tìm thấy sản phẩm nào phù hợp với "{query}"</span>
          </div>
        )}
      </div>
    </div>
  );
}
