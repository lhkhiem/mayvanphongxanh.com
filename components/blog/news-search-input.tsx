"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export function NewsSearchInput({ initialSearch }: { initialSearch?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(initialSearch || "");
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (term.trim()) {
      params.set("q", term.trim());
    } else {
      params.delete("q");
    }

    startTransition(() => {
      router.push(`/tin-tuc?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setTerm("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    startTransition(() => {
      router.push(`/tin-tuc?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="relative flex items-center min-w-[220px] max-w-[320px]">
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Tìm kiếm bài viết..."
        className="w-full pl-9 pr-8 py-1.5 text-xs md:text-sm rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-800"
      />
      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
      {term && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </form>
  );
}
