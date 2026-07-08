"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/admin/empty-state";
import {
  Folder, Plus, Edit, Trash2, X, Save, ChevronRight,
  Eye, EyeOff, Tag, AlertCircle, Package
} from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
  type CategoryFormData,
} from "./actions";
import { cn } from "@/lib/utils";

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "d")
    .replace(/[^0-9a-z\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Category = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  isFeatured: boolean;
  _count: { products: number };
};

// Preset colors for categories
const PRESET_COLORS = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#06b6d4", "#84cc16",
  "#f97316", "#6366f1", "#14b8a6", "#a855f7",
];

// ── Default form state ────────────────────────────────────────────────────────

const DEFAULT_FORM: CategoryFormData = {
  name: "",
  slug: "",
  parentId: null,
  icon: "",
  color: "#3b82f6",
  isActive: true,
  isFeatured: false,
};

// ── Main Component ─────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const res = await getCategories();
    if (res.error) toast.error(res.error);
    else setCategories((res.data as Category[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleCreate = async (data: CategoryFormData) => {
    const res = await createCategory(data);
    if (res.error) { toast.error(res.error); return false; }
    toast.success("Tạo danh mục thành công!");
    setShowAddForm(false);
    fetchCategories();
    return true;
  };

  const handleUpdate = async (id: number, data: CategoryFormData) => {
    const res = await updateCategory(id, data);
    if (res.error) { toast.error(res.error); return false; }
    toast.success("Cập nhật danh mục thành công!");
    setEditingId(null);
    fetchCategories();
    return true;
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Xóa danh mục "${cat.name}"?`)) return;
    const res = await deleteCategory(cat.id);
    if (res.error) toast.error(res.error);
    else { toast.success("Đã xóa danh mục."); fetchCategories(); }
  };

  const handleToggle = async (cat: Category) => {
    const res = await toggleCategoryActive(cat.id, cat.isActive);
    if (res.error) toast.error(res.error);
    else { toast.success(cat.isActive ? "Đã ẩn danh mục." : "Đã kích hoạt danh mục."); fetchCategories(); }
  };

  // Separate parents and children
  const parentCategories = categories.filter((c) => c.parentId === null);
  const getChildren = (parentId: number) => categories.filter((c) => c.parentId === parentId);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Quản lý Danh mục Sản phẩm
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {categories.length} danh mục • Hỗ trợ cấu trúc danh mục cha – con
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Thêm danh mục
          </button>
        )}
      </div>

      {/* ── Add Form ── */}
      {showAddForm && (
        <CategoryForm
          categories={categories}
          onSubmit={handleCreate}
          onCancel={() => setShowAddForm(false)}
          title="Thêm danh mục mới"
        />
      )}

      {/* ── List ── */}
      {categories.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="Chưa có danh mục nào"
          description="Tạo danh mục đầu tiên để phân loại sản phẩm của bạn."
          action={!showAddForm ? { label: "Thêm danh mục", onClick: () => setShowAddForm(true) } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {parentCategories.map((parent) => {
            const children = getChildren(parent.id);
            return (
              <div key={parent.id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] shadow-sm overflow-hidden">
                {/* Parent Row */}
                {editingId === parent.id ? (
                  <div className="p-5">
                    <CategoryForm
                      categories={categories.filter((c) => c.id !== parent.id)}
                      initialData={{
                        name: parent.name,
                        slug: parent.slug,
                        parentId: parent.parentId,
                        icon: parent.icon || "",
                        color: parent.color || "#3b82f6",
                        isActive: parent.isActive,
                        isFeatured: parent.isFeatured,
                      }}
                      onSubmit={(data) => handleUpdate(parent.id, data)}
                      onCancel={() => setEditingId(null)}
                      title="Chỉnh sửa danh mục"
                      isInline
                    />
                  </div>
                ) : (
                  <CategoryRow
                    category={parent}
                    onEdit={() => setEditingId(parent.id)}
                    onDelete={() => handleDelete(parent)}
                    onToggle={() => handleToggle(parent)}
                    isParent
                  />
                )}

                {/* Children */}
                {children.length > 0 && (
                  <div className="border-t border-gray-100 dark:border-gray-700/60">
                    {children.map((child, idx) => (
                      <div key={child.id} className={cn(idx < children.length - 1 && "border-b border-gray-100 dark:border-gray-700/40")}>
                        {editingId === child.id ? (
                          <div className="p-5 pl-10 bg-gray-50/50 dark:bg-gray-800/30">
                            <CategoryForm
                              categories={categories.filter((c) => c.id !== child.id && c.parentId === null)}
                              initialData={{
                                name: child.name,
                                slug: child.slug,
                                parentId: child.parentId,
                                icon: child.icon || "",
                                color: child.color || "#3b82f6",
                                isActive: child.isActive,
                                isFeatured: child.isFeatured,
                              }}
                              onSubmit={(data) => handleUpdate(child.id, data)}
                              onCancel={() => setEditingId(null)}
                              title="Chỉnh sửa danh mục con"
                              isInline
                            />
                          </div>
                        ) : (
                          <CategoryRow
                            category={child}
                            onEdit={() => setEditingId(child.id)}
                            onDelete={() => handleDelete(child)}
                            onToggle={() => handleToggle(child)}
                            isChild
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Category Row ───────────────────────────────────────────────────────────────

function CategoryRow({
  category,
  onEdit,
  onDelete,
  onToggle,
  isParent,
  isChild,
}: {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  isParent?: boolean;
  isChild?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30",
        isChild && "pl-10 bg-gray-50/30 dark:bg-gray-800/10",
        !category.isActive && "opacity-60"
      )}
    >
      {isChild && (
        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 -ml-4" />
      )}

      {/* Color dot / icon */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-sm"
        style={{ backgroundColor: category.color || "#6366f1" }}
      >
        {category.icon || category.name.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {category.name}
          </span>
          {!category.isActive && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 rounded">
              Ẩn
            </span>
          )}
          {category.isFeatured && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded">
              Nổi bật
            </span>
          )}
          {isParent && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded">
              Danh mục gốc
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">/{category.slug}</span>
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <Package className="h-3 w-3" />
            {category._count.products} sản phẩm
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onToggle}
          className={cn(
            "p-2 rounded-lg transition-colors",
            category.isActive
              ? "hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-500"
              : "hover:bg-green-50 dark:hover:bg-green-900/30 text-green-500"
          )}
          title={category.isActive ? "Ẩn danh mục" : "Kích hoạt danh mục"}
        >
          {category.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        <button
          onClick={onEdit}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          title="Chỉnh sửa"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors"
          title="Xóa"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Category Form ──────────────────────────────────────────────────────────────

function CategoryForm({
  categories,
  initialData,
  onSubmit,
  onCancel,
  title,
  isInline,
}: {
  categories: Category[];
  initialData?: CategoryFormData;
  onSubmit: (data: CategoryFormData) => Promise<boolean>;
  onCancel: () => void;
  title: string;
  isInline?: boolean;
}) {
  const [form, setForm] = useState<CategoryFormData>(initialData || DEFAULT_FORM);
  const [autoSlug, setAutoSlug] = useState(!initialData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (autoSlug && form.name) {
      setForm((prev) => ({ ...prev, slug: generateSlug(form.name) }));
    }
  }, [form.name, autoSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  // Only allow root categories as parents
  const parentOptions = categories.filter((c) => c.parentId === null);

  const wrapper = isInline
    ? "space-y-4"
    : "rounded-lg border border-primary/30 bg-white dark:bg-[#2a303d] p-6 shadow-sm space-y-4";

  return (
    <div className={wrapper}>
      {!isInline && (
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {isInline && (
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h2>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Máy in, Máy photocopy..."
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100 shadow-sm"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Slug <span className="text-red-500">*</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                <input type="checkbox" checked={autoSlug} onChange={(e) => setAutoSlug(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary h-3 w-3" />
                Tự động tạo
              </label>
            </div>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              disabled={autoSlug}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-800 dark:text-gray-100 shadow-sm font-mono"
              required
            />
          </div>

          {/* Parent Category */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
              Danh mục cha
            </label>
            <select
              value={form.parentId ?? ""}
              onChange={(e) => setForm({ ...form, parentId: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100 shadow-sm"
            >
              <option value="">— Là danh mục gốc —</option>
              {parentOptions.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
              Icon (ký tự hoặc emoji)
            </label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="🖨️ hoặc M, P..."
              maxLength={4}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100 shadow-sm"
            />
            <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
              Mẹo: Nhấn <kbd className="px-1 py-0.5 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-mono text-[10px]">Win + .</kbd> để mở bảng Emoji, hoặc copy từ <a href="https://getemoji.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">getemoji.com</a>.
            </p>
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Màu hiển thị
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, color: c })}
                className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none"
                style={{
                  backgroundColor: c,
                  borderColor: form.color === c ? "white" : "transparent",
                  boxShadow: form.color === c ? `0 0 0 2px ${c}` : "none",
                }}
                title={c}
              />
            ))}
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-7 h-7 rounded-full cursor-pointer border border-gray-200 p-0.5 bg-transparent"
              title="Chọn màu tùy chỉnh"
            />
            <div
              className="ml-2 w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
              style={{ backgroundColor: form.color }}
            >
              {form.icon || form.name.charAt(0).toUpperCase() || "A"}
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">Xem trước</span>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                form.isActive ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
              )}
            >
              <span className={cn("inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform", form.isActive ? "translate-x-4" : "translate-x-0.5")} />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {form.isActive ? "Hiển thị trên website" : "Ẩn khỏi website"}
            </span>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, isFeatured: !form.isFeatured })}
              className={cn(
                "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                form.isFeatured ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-600"
              )}
            >
              <span className={cn("inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform", form.isFeatured ? "translate-x-4" : "translate-x-0.5")} />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Danh mục nổi bật
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors dark:text-gray-200"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {submitting ? "Đang lưu..." : "Lưu danh mục"}
          </button>
        </div>
      </form>
    </div>
  );
}
