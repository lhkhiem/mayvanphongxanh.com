"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/admin/empty-state";
import {
  Folder, Plus, Edit, Trash2, X, Save,
  FileText, ArrowUp, ArrowDown, GripVertical
} from "lucide-react";
import {
  getPostCategories,
  createPostCategory,
  updatePostCategory,
  deletePostCategory,
  updatePostCategoryOrders,
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

// Preset colors for category avatars
const PRESET_COLORS = [
  "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b",
  "#ef4444", "#ec4899", "#06b6d4", "#84cc16",
  "#f97316", "#6366f1", "#14b8a6", "#a855f7",
];

// ── Types ─────────────────────────────────────────────────────────────────────

type PostCategory = {
  id: number;
  name: string;
  slug: string;
  order: number;
  _count?: {
    posts: number;
  };
};

export default function PostCategoriesPage() {
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Drag and drop state
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const res = await getPostCategories();
    if (res.error) toast.error(res.error);
    else setCategories((res.data as PostCategory[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreate = async (data: { name: string; slug: string; order: number }) => {
    const res = await createPostCategory(data);
    if (res.error) { toast.error(res.error); return false; }
    toast.success("Tạo danh mục thành công!");
    setShowAddForm(false);
    fetchCategories();
    return true;
  };

  const handleUpdate = async (id: number, data: { name: string; slug: string; order: number }) => {
    const res = await updatePostCategory(id, data);
    if (res.error) { toast.error(res.error); return false; }
    toast.success("Cập nhật danh mục thành công!");
    setEditingId(null);
    fetchCategories();
    return true;
  };

  const handleDelete = async (cat: PostCategory) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}"?`)) return;
    const res = await deletePostCategory(cat.id);
    if (res.error) toast.error(res.error);
    else { toast.success("Đã xóa danh mục."); fetchCategories(); }
  };

  const handleMove = async (category: PostCategory, direction: "up" | "down") => {
    const index = categories.findIndex((c) => c.id === category.id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    const updates = newCategories.map((item, idx) => ({
      id: item.id,
      order: idx,
    }));

    const res = await updatePostCategoryOrders(updates);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Đã cập nhật thứ tự danh mục.");
      fetchCategories();
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(id));
  };

  const handleDragOver = (e: React.DragEvent, targetCategory: PostCategory) => {
    if (!draggedId || draggedId === targetCategory.id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverId !== targetCategory.id) {
      setDragOverId(targetCategory.id);
    }
  };

  const handleDragLeave = (e: React.DragEvent, id: number) => {
    if (dragOverId === id) {
      setDragOverId(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetCategory: PostCategory) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetCategory.id) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const draggedIndex = categories.findIndex((c) => c.id === draggedId);
    const targetIndex = categories.findIndex((c) => c.id === targetCategory.id);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const newCategories = [...categories];
    const [removed] = newCategories.splice(draggedIndex, 1);
    newCategories.splice(targetIndex, 0, removed);

    const updates = newCategories.map((item, idx) => ({
      id: item.id,
      order: idx,
    }));

    setCategories(newCategories.map((c, idx) => ({ ...c, order: idx })));
    setDraggedId(null);
    setDragOverId(null);

    const res = await updatePostCategoryOrders(updates);
    if (res.error) {
      toast.error(res.error);
      fetchCategories();
    } else {
      toast.success("Đã di chuyển danh mục sang vị trí mới.");
      fetchCategories();
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

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
            Quản lý Danh mục Tin tức
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm flex items-center gap-1">
            {categories.length} danh mục • Kéo thả <GripVertical className="inline-block h-4 w-4 align-text-bottom text-gray-400" /> hoặc dùng mũi tên để sắp xếp vị trí
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
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] p-6 shadow-sm">
          <PostCategoryForm
            initialData={{
              name: "",
              slug: "",
              order: categories.length,
            }}
            onSubmit={handleCreate}
            onCancel={() => setShowAddForm(false)}
            title="Thêm danh mục mới"
          />
        </div>
      )}

      {/* ── Categories List ── */}
      {categories.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="Chưa có danh mục nào"
          description="Bắt đầu tạo danh mục bài viết đầu tiên của bạn"
          action={
            !showAddForm
              ? {
                  label: "Thêm danh mục",
                  onClick: () => setShowAddForm(true),
                }
              : undefined
          }
        />
      ) : (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-[#2a303d] shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/60">
          {categories.map((category, idx) => (
            <div key={category.id}>
              {editingId === category.id ? (
                <div className="p-6 bg-gray-50/50 dark:bg-gray-800/30">
                  <PostCategoryForm
                    initialData={{
                      name: category.name,
                      slug: category.slug,
                      order: category.order,
                    }}
                    onSubmit={(data) => handleUpdate(category.id, data)}
                    onCancel={() => setEditingId(null)}
                    title="Chỉnh sửa danh mục"
                  />
                </div>
              ) : (
                <CategoryRow
                  category={category}
                  color={PRESET_COLORS[idx % PRESET_COLORS.length]}
                  onEdit={() => setEditingId(category.id)}
                  onDelete={() => handleDelete(category)}
                  onMoveUp={() => handleMove(category, "up")}
                  onMoveDown={() => handleMove(category, "down")}
                  isFirst={idx === 0}
                  isLast={idx === categories.length - 1}
                  onDragStart={(e) => handleDragStart(e, category.id)}
                  onDragOver={(e) => handleDragOver(e, category)}
                  onDragLeave={(e) => handleDragLeave(e, category.id)}
                  onDrop={(e) => handleDrop(e, category)}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedId === category.id}
                  isDragOver={dragOverId === category.id}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Category Row Component ───────────────────────────────────────────────────

function CategoryRow({
  category,
  color,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  isDragging,
  isDragOver,
}: {
  category: PostCategory;
  color: string;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isDragOver: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        "flex items-center gap-3 px-5 py-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/30",
        isDragging && "opacity-40 border-2 border-dashed border-primary bg-primary/5",
        isDragOver && "ring-2 ring-primary ring-inset bg-blue-50/80 dark:bg-blue-950/40"
      )}
    >
      {/* Drag Grip Handle */}
      <div 
        className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0" 
        title="Nắm kéo thả để di chuyển"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Color Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold shadow-sm"
        style={{ backgroundColor: color }}
      >
        {category.name.charAt(0).toUpperCase()}
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {category.name}
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700">
            #{category.order}
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded">
            Danh mục tin tức
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
          <span className="text-gray-400 dark:text-gray-500 font-mono">/{category.slug}</span>
          <span className="text-gray-300 dark:text-gray-700 font-bold">•</span>
          <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/40">
            <FileText className="h-3 w-3" />
            {category._count?.posts ?? 0} bài viết
          </span>
        </div>
      </div>

      {/* Actions & Ordering */}
      <div className="flex items-center gap-3 shrink-0 ml-2">
        {/* Reorder Buttons */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 rounded text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors"
            title="Di chuyển lên"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 rounded text-gray-500 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors"
            title="Di chuyển xuống"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Edit & Delete Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="Chỉnh sửa"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 transition-colors"
            title="Xóa"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Form Component ────────────────────────────────────────────────────────────

function PostCategoryForm({
  initialData,
  onSubmit,
  onCancel,
  title,
}: {
  initialData: { name: string; slug: string; order: number };
  onSubmit: (data: { name: string; slug: string; order: number }) => Promise<boolean>;
  onCancel: () => void;
  title: string;
}) {
  const [name, setName] = useState(initialData.name);
  const [slug, setSlug] = useState(initialData.slug);
  const [order, setOrder] = useState(initialData.order);
  const [autoSlug, setAutoSlug] = useState(!initialData.slug);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (autoSlug && name) {
      setSlug(generateSlug(name));
    }
  }, [name, autoSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Vui lòng nhập tên danh mục."); return; }
    setSubmitting(true);
    await onSubmit({ name: name.trim(), slug: slug.trim(), order });
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tên danh mục <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Tin tức công nghệ"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Thứ tự hiển thị
          </label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
            Slug <span className="text-red-500">*</span>
          </label>
          <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSlug}
              onChange={(e) => setAutoSlug(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            Tự động tạo từ tên
          </label>
        </div>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          disabled={autoSlug}
          placeholder="tin-tuc-cong-nghe"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm disabled:opacity-50 font-mono"
          required
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
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
  );
}
