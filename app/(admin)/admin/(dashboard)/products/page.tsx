"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EmptyState } from "@/components/admin/empty-state";
import {
  Package, Plus, Edit, Trash2, Eye, EyeOff, RotateCcw,
  Search, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, GripVertical, Copy
} from "lucide-react";
import { getProducts, deleteProduct, toggleProductActive, updateProductOrders, restoreProduct, hardDeleteProduct, duplicateProduct } from "./actions";
import { getCategories } from "../categories/actions";
import { CategoryFilterDropdown } from "@/components/admin/category-filter-dropdown";
import { ProductTypeFilterDropdown } from "@/components/admin/product-type-filter-dropdown";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

// ── Pagination Component ───────────────────────────────────────────────────────
function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}) {
  // Generate page numbers around current page
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      {/* Info */}
      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <span>
          Hiển thị <span className="font-medium text-gray-700 dark:text-gray-200">{from}–{to}</span> / <span className="font-medium text-gray-700 dark:text-gray-200">{total}</span> sản phẩm
        </span>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">Hiển thị</span>
          <select
            value={pageSize}
            onChange={(e) => { onPageSizeChange(parseInt(e.target.value)); onPageChange(1); }}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a303d] px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s} / trang</option>
            ))}
          </select>
        </div>
      </div>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
          title="Trang đầu"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
          title="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((p, idx) =>
          p === '...' ? (
            <span key={`dots-${idx}`} className="px-2 text-gray-400 text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                "min-w-[32px] h-8 rounded-md text-sm font-medium transition-colors",
                p === page
                  ? "bg-primary text-white shadow-sm"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
          title="Trang sau"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 transition-colors"
          title="Trang cuối"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>

        {/* Jump to page */}
        <div className="ml-2 hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Đến</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            defaultValue={page}
            key={page}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = parseInt((e.target as HTMLInputElement).value);
                if (val >= 1 && val <= totalPages) onPageChange(val);
              }
            }}
            className="w-14 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a303d] px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100"
          />
          <span>/ {totalPages}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [productType, setProductType] = useState<string>('all');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive' | 'deleted'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [restoredScroll, setRestoredScroll] = useState<number | null>(null);

  // Drag and drop state
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  // Restore state on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('products_list_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setSearch(state.search ?? "");
        setCategoryId(state.categoryId);
        setProductType(state.productType ?? 'all');
        setStatus(state.status ?? 'all');
        setPage(state.page ?? 1);
        setPageSize(state.pageSize ?? 20);
        if (state.scroll) setRestoredScroll(state.scroll);
      } catch (e) {}
      sessionStorage.removeItem('products_list_state');
    }
  }, []);

  // Helper to save state before leaving
  const saveState = () => {
    const main = document.querySelector('main');
    const scrollPos = main ? main.scrollTop : 0;
    sessionStorage.setItem('products_list_state', JSON.stringify({
      search, categoryId, productType, status, page, pageSize, scroll: scrollPos
    }));
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await getProducts({
      search: search || undefined,
      categoryId,
      productType,
      status,
      page,
      pageSize,
    });
    if (res.error) {
      toast.error(res.error);
    } else {
      setProducts(res.data || []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    }
    setLoading(false);
  }, [search, categoryId, productType, status, page, pageSize]);

  // Restore scroll after loading completes
  useEffect(() => {
    if (!loading && restoredScroll !== null) {
      setTimeout(() => {
        const main = document.querySelector('main');
        if (main) {
          main.scrollTo({ top: restoredScroll, behavior: 'instant' });
        }
        setRestoredScroll(null);
      }, 50);
    }
  }, [loading, restoredScroll]);

  useEffect(() => {
    getCategories().then((res) => {
      if (res.data) setCategories(res.data);
    });
  }, []);

  // Reset to page 1 when filters change (only if not restoring from cache)
  useEffect(() => {
    if (restoredScroll === null) {
      setPage(1);
      setSelectedIds(new Set());
    }
  }, [search, categoryId, productType, status, pageSize]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 250);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleDelete = async (p: any) => {
    if (!confirm(`Chuyển sản phẩm "${p.name}" vào thùng rác?`)) return;
    const res = await deleteProduct(p.id);
    if (res.error) toast.error(res.error);
    else { toast.success("Đã chuyển sản phẩm vào thùng rác."); fetchProducts(); }
  };

  const handleRestore = async (p: any) => {
    const res = await restoreProduct(p.id);
    if (res.error) toast.error(res.error);
    else { toast.success(`Đã khôi phục sản phẩm "${p.name}".`); fetchProducts(); }
  };

  const handleHardDelete = async (p: any) => {
    if (!confirm(`XÓA VĨNH VIỄN sản phẩm "${p.name}"? Thao tác này không thể hoàn tác!`)) return;
    const res = await hardDeleteProduct(p.id);
    if (res.error) toast.error(res.error);
    else { toast.success("Đã xóa vĩnh viễn sản phẩm."); fetchProducts(); }
  };

  const handleToggle = async (p: any) => {
    const res = await toggleProductActive(p.id, p.isActive);
    if (res.error) toast.error(res.error);
    else {
      toast.success(p.isActive ? "Đã ẩn sản phẩm." : "Đã kích hoạt sản phẩm.");
      fetchProducts();
    }
  };

  const handleDuplicate = async (p: any) => {
    if (!confirm(`Bạn có chắc chắn muốn sao chép sản phẩm "${p.name}"?`)) return;
    toast.loading("Đang sao chép sản phẩm...", { id: "dup-toast" });
    const res = await duplicateProduct(p.id);
    if (res.error) {
      toast.error(res.error, { id: "dup-toast" });
    } else {
      toast.success("Sao chép sản phẩm thành công!", { id: "dup-toast" });
      if (res.data?.id) {
        saveState();
        router.push(`/admin/products/${res.data.id}`);
      } else {
        fetchProducts();
      }
    }
  };

  const handleMoveProduct = async (p: any, direction: "up" | "down") => {
    const index = products.findIndex((prod) => prod.id === p.id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const newProducts = [...products];
    const temp = newProducts[index];
    newProducts[index] = newProducts[targetIndex];
    newProducts[targetIndex] = temp;

    const updates = newProducts.map((item, idx) => ({
      id: item.id,
      order: idx,
    }));

    setProducts(newProducts);

    const res = await updateProductOrders(updates);
    if (res.error) {
      toast.error(res.error);
      fetchProducts();
    } else {
      toast.success(`Đã cập nhật thứ tự sản phẩm.`);
      fetchProducts();
    }
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(id));
  };

  const handleDragOver = (e: React.DragEvent, targetId: number) => {
    if (!draggedId || draggedId === targetId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverId !== targetId) {
      setDragOverId(targetId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, id: number) => {
    if (dragOverId === id) {
      setDragOverId(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetProduct: any) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetProduct.id) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const draggedIndex = products.findIndex((p) => p.id === draggedId);
    const targetIndex = products.findIndex((p) => p.id === targetProduct.id);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const newProducts = [...products];
    const [removed] = newProducts.splice(draggedIndex, 1);
    newProducts.splice(targetIndex, 0, removed);

    const updates = newProducts.map((item, idx) => ({
      id: item.id,
      order: idx,
    }));

    setProducts(newProducts);
    setDraggedId(null);
    setDragOverId(null);

    const res = await updateProductOrders(updates);
    if (res.error) {
      toast.error(res.error);
      fetchProducts();
    } else {
      toast.success(`Đã di chuyển "${removed.name}" sang vị trí mới.`);
      fetchProducts();
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Xóa ${selectedIds.size} sản phẩm đã chọn?`)) return;
    let successCount = 0;
    for (const id of selectedIds) {
      const res = await deleteProduct(id);
      if (!res.error) successCount++;
    }
    toast.success(`Đã xóa ${successCount} sản phẩm.`);
    setSelectedIds(new Set());
    fetchProducts();
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Quản lý Sản phẩm
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {loading ? "Đang tải..." : `${total} sản phẩm • Kéo thả `}
            <GripVertical className="inline-block h-4 w-4 align-text-bottom text-gray-400" />
            {` hoặc dùng mũi tên để sắp xếp vị trí`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Xóa {selectedIds.size} mục
            </button>
          )}
          <Link
            href={`/admin/products/new?${new URLSearchParams({
              ...(categoryId ? { categoryId: categoryId.toString() } : {}),
              ...(productType && productType !== 'all' ? { productType } : {})
            }).toString()}`}
            onClick={saveState}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên, thương hiệu, SKU..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100 shadow-sm"
          />
        </div>

        <CategoryFilterDropdown
          categories={categories}
          value={categoryId}
          onChange={setCategoryId}
        />

        <ProductTypeFilterDropdown
          value={productType}
          onChange={setProductType}
        />

        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 shrink-0">
          {(['all', 'active', 'inactive', 'deleted'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                status === s
                  ? s === 'deleted'
                    ? "bg-red-500 text-white shadow-sm"
                    : "bg-white dark:bg-[#2a303d] text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              {s === 'all' ? 'Tất cả' : s === 'active' ? 'Đang bán' : s === 'inactive' ? 'Ẩn' : 'Thùng rác'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={cn("h-[72px] animate-pulse", i % 2 === 0 ? "bg-gray-100 dark:bg-gray-800" : "bg-white dark:bg-[#2a303d]")} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title={search || categoryId || status !== 'all' ? "Không tìm thấy sản phẩm nào" : "Chưa có sản phẩm nào"}
          description={search || categoryId || status !== 'all' ? "Thử thay đổi điều kiện lọc." : "Bắt đầu thêm sản phẩm đầu tiên."}
          action={!search && !categoryId && status === 'all' ? { label: "Thêm sản phẩm", onClick: () => window.location.href = '/admin/products/new' } : undefined}
        />
      ) : (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-left">
                <th className="w-14 pl-3 pr-2 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 shrink-0" />
                    <input
                      type="checkbox"
                      checked={selectedIds.size === products.length && products.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Sản phẩm</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 hidden lg:table-cell">Danh mục</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 hidden xl:table-cell">Biến thể</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Giá từ</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 hidden lg:table-cell">Tồn kho</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {products.map((p, pIdx) => {
                const firstVariant = p.variants?.[0];
                const images = Array.isArray(p.images) ? p.images : [];
                const totalStock = p.variants?.reduce((sum: number, v: any) => sum + v.stockQuantity, 0) ?? 0;
                const isSelected = selectedIds.has(p.id);

                return (
                  <tr
                    key={p.id}
                    draggable={!!categoryId}
                    onDragStart={(e) => categoryId && handleDragStart(e, p.id)}
                    onDragOver={(e) => categoryId && handleDragOver(e, p.id)}
                    onDragLeave={(e) => categoryId && handleDragLeave(e, p.id)}
                    onDrop={(e) => categoryId && handleDrop(e, p)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "transition-all",
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/10"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/30",
                      draggedId === p.id && "opacity-40 border-2 border-dashed border-primary bg-primary/5",
                      dragOverId === p.id && "ring-2 ring-primary ring-inset bg-blue-50/80 dark:bg-blue-950/40"
                    )}
                  >
                    {/* Drag Grip Handle & Checkbox */}
                    <td className="pl-3 pr-2 py-3 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            "shrink-0 p-0.5 transition-colors",
                            categoryId
                              ? "cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                              : "cursor-not-allowed opacity-30 text-gray-400"
                          )}
                          title={categoryId ? "Nắm kéo thả để sắp xếp" : "Vui lòng chọn 1 danh mục cụ thể để kéo thả sắp xếp thứ tự"}
                        >
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelectedIds((prev) => {
                              const next = new Set(prev);
                              if (next.has(p.id)) next.delete(p.id);
                              else next.add(p.id);
                              return next;
                            });
                          }}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 shrink-0 overflow-hidden flex items-center justify-center">
                          {images[0] ? (
                            <img src={images[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <Package className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`/admin/products/${p.id}`}
                              onClick={saveState}
                              className="font-semibold text-gray-900 dark:text-gray-100 hover:text-primary transition-colors line-clamp-1"
                            >
                              {p.name}
                            </Link>
                            <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700 shrink-0">
                              #{p.order ?? 0}
                            </span>
                            {p.isFeatured && (
                              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded shrink-0">
                                Nổi bật
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {p.brand && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{p.brand}</span>
                            )}
                            {p.productType && (
                              <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border",
                                p.productType === 'rental' ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800" :
                                p.productType === 'custom-build' ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800" :
                                p.productType === 'pre-packaged' ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800" :
                                "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                              )}>
                                {p.productType === 'rental' ? 'Cho thuê' :
                                p.productType === 'custom-build' ? 'Tùy chỉnh' :
                                p.productType === 'pre-packaged' ? 'Trọn gói' : 'Tiêu chuẩn'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 hidden lg:table-cell">
                      {p.category && (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-white"
                          style={{ backgroundColor: p.category.color || '#6366f1' }}
                        >
                          {p.category.name}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 hidden xl:table-cell text-sm text-gray-600 dark:text-gray-300">
                      {p._count?.variants ?? 0} biến thể
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell">
                      {firstVariant ? (
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {formatPrice(firstVariant.price)}
                          </p>
                          {firstVariant.originalPrice && firstVariant.originalPrice > firstVariant.price && (
                            <p className="text-xs text-gray-400 line-through">
                              {formatPrice(firstVariant.originalPrice)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Chưa có</span>
                      )}
                    </td>

                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={cn(
                        "text-sm font-medium",
                        totalStock === 0
                          ? "text-red-500"
                          : totalStock < 5
                          ? "text-amber-500"
                          : "text-green-600 dark:text-green-400"
                      )}>
                        {totalStock}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap",
                        p.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                      )}>
                        {p.isActive ? "Đang bán" : "Ẩn"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {status === 'deleted' ? (
                          <>
                            <button
                              onClick={() => handleRestore(p)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 text-xs font-medium transition-colors"
                              title="Khôi phục sản phẩm"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Khôi phục
                            </button>
                            <button
                              onClick={() => handleHardDelete(p)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Order Move Buttons Group */}
                            {categoryId ? (
                              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 border border-gray-200/70 dark:border-gray-700/70 mr-1">
                                <button
                                  onClick={() => handleMoveProduct(p, "up")}
                                  disabled={pIdx === 0}
                                  className="p-1.5 rounded hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                                  title="Di chuyển lên"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleMoveProduct(p, "down")}
                                  disabled={pIdx === products.length - 1}
                                  className="p-1.5 rounded hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                                  title="Di chuyển xuống"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : null}

                            <button
                              onClick={() => handleToggle(p)}
                              className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                p.isActive
                                  ? "hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-500"
                                  : "hover:bg-green-50 dark:hover:bg-green-900/30 text-green-500"
                              )}
                              title={p.isActive ? "Ẩn sản phẩm" : "Hiện sản phẩm"}
                            >
                              {p.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDuplicate(p)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                              title="Sao chép sản phẩm"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <Link
                              href={`/admin/products/${p.id}`}
                              onClick={saveState}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(p)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                              title="Chuyển vào thùng rác"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={(p) => { setPage(p); setSelectedIds(new Set()); }}
              onPageSizeChange={setPageSize}
            />
          )}
        </div>
      )}
    </div>
  );
}
