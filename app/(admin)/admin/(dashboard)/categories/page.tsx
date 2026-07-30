"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/admin/empty-state";
import { MediaPickerInput } from "@/components/admin/media-picker-input";
import {
  Folder, Plus, Edit, Trash2, X, Save, ChevronRight,
  Eye, EyeOff, Tag, AlertCircle, Package, ArrowUp, ArrowDown, GripVertical
} from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
  updateCategoryOrders,
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
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  showInFooter: boolean;
  hasPromo: boolean;
  promoTitle: string | null;
  promoDescription: string | null;
  promoBadgeText: string | null;
  promoBadgeColor: string | null;
  promoTargetUrl: string | null;
  promoImageUrl: string | null;
  _count: {
    products: number;
    activeProducts?: number;
    inactiveProducts?: number;
    trashProducts?: number;
  };
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
  order: 0,
  isActive: true,
  isFeatured: true,
  showInFooter: true,
  hasPromo: false,
  promoTitle: "",
  promoDescription: "",
  promoBadgeText: "",
  promoBadgeColor: "",
  promoTargetUrl: "",
  promoImageUrl: "",
};

// ── Main Component ─────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Drag and drop state
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

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

  const handleMove = async (category: Category, direction: "up" | "down") => {
    const siblings = categories.filter((c) => c.parentId === category.parentId);
    const index = siblings.findIndex((c) => c.id === category.id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= siblings.length) return;

    const newSiblings = [...siblings];
    const temp = newSiblings[index];
    newSiblings[index] = newSiblings[targetIndex];
    newSiblings[targetIndex] = temp;

    const updates = newSiblings.map((item, idx) => ({
      id: item.id,
      order: idx,
    }));

    const res = await updateCategoryOrders(updates);
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

  const handleDragOver = (e: React.DragEvent, targetCategory: Category) => {
    if (!draggedId || draggedId === targetCategory.id) return;
    const draggedCategory = categories.find((c) => c.id === draggedId);
    if (!draggedCategory) return;

    if (draggedCategory.parentId === targetCategory.parentId) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dragOverId !== targetCategory.id) {
        setDragOverId(targetCategory.id);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent, id: number) => {
    if (dragOverId === id) {
      setDragOverId(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetCategory: Category) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetCategory.id) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const draggedCategory = categories.find((c) => c.id === draggedId);
    if (!draggedCategory || draggedCategory.parentId !== targetCategory.parentId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const siblings = categories
      .filter((c) => c.parentId === targetCategory.parentId)
      .sort((a, b) => a.order - b.order || a.id - b.id);

    const draggedIndex = siblings.findIndex((c) => c.id === draggedId);
    const targetIndex = siblings.findIndex((c) => c.id === targetCategory.id);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const newSiblings = [...siblings];
    const [removed] = newSiblings.splice(draggedIndex, 1);
    newSiblings.splice(targetIndex, 0, removed);

    const updates = newSiblings.map((item, idx) => ({
      id: item.id,
      order: idx,
    }));

    setCategories((prev) =>
      prev.map((c) => {
        const match = updates.find((u) => u.id === c.id);
        return match ? { ...c, order: match.order } : c;
      })
    );

    setDraggedId(null);
    setDragOverId(null);

    const res = await updateCategoryOrders(updates);
    if (res.error) {
      toast.error(res.error);
      fetchCategories();
    } else {
      toast.success(`Đã di chuyển "${draggedCategory.name}" sang vị trí mới.`);
      fetchCategories();
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // Separate parents and children sorted by order
  const parentCategories = categories
    .filter((c) => c.parentId === null)
    .sort((a, b) => a.order - b.order || a.id - b.id);

  const getChildren = (parentId: number) =>
    categories
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => a.order - b.order || a.id - b.id);

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
          {parentCategories.map((parent, pIdx) => {
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
                        order: parent.order,
                        isActive: parent.isActive,
                        isFeatured: parent.isFeatured,
                        showInFooter: parent.showInFooter,
                        hasPromo: parent.hasPromo,
                        promoTitle: parent.promoTitle || "",
                        promoDescription: parent.promoDescription || "",
                        promoBadgeText: parent.promoBadgeText || "",
                        promoBadgeColor: parent.promoBadgeColor || "",
                        promoTargetUrl: parent.promoTargetUrl || "",
                        promoImageUrl: parent.promoImageUrl || "",
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
                    onMoveUp={() => handleMove(parent, "up")}
                    onMoveDown={() => handleMove(parent, "down")}
                    isFirst={pIdx === 0}
                    isLast={pIdx === parentCategories.length - 1}
                    isParent
                    onDragStart={(e) => handleDragStart(e, parent.id)}
                    onDragOver={(e) => handleDragOver(e, parent)}
                    onDragLeave={(e) => handleDragLeave(e, parent.id)}
                    onDrop={(e) => handleDrop(e, parent)}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedId === parent.id}
                    isDragOver={dragOverId === parent.id}
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
                                order: child.order,
                                isActive: child.isActive,
                                isFeatured: child.isFeatured,
                                showInFooter: child.showInFooter,
                                hasPromo: child.hasPromo,
                                promoTitle: child.promoTitle || "",
                                promoDescription: child.promoDescription || "",
                                promoBadgeText: child.promoBadgeText || "",
                                promoBadgeColor: child.promoBadgeColor || "",
                                promoTargetUrl: child.promoTargetUrl || "",
                                promoImageUrl: child.promoImageUrl || "",
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
                            onMoveUp={() => handleMove(child, "up")}
                            onMoveDown={() => handleMove(child, "down")}
                            isFirst={idx === 0}
                            isLast={idx === children.length - 1}
                            isChild
                            onDragStart={(e) => handleDragStart(e, child.id)}
                            onDragOver={(e) => handleDragOver(e, child)}
                            onDragLeave={(e) => handleDragLeave(e, child.id)}
                            onDrop={(e) => handleDrop(e, child)}
                            onDragEnd={handleDragEnd}
                            isDragging={draggedId === child.id}
                            isDragOver={dragOverId === child.id}
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
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isParent,
  isChild,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  isDragging,
  isDragOver,
}: {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isParent?: boolean;
  isChild?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
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
        isChild && "pl-10 bg-gray-50/30 dark:bg-gray-800/10",
        !category.isActive && "opacity-60",
        isDragging && "opacity-40 border-2 border-dashed border-primary bg-primary/5",
        isDragOver && "ring-2 ring-primary ring-inset bg-blue-50/80 dark:bg-blue-950/40"
      )}
    >
      {/* Drag Grip Handle */}
      <div className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0" title="Nắm kéo thả để di chuyển">
        <GripVertical className="h-4 w-4" />
      </div>

      {isChild && (
        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 -ml-1" />
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
          <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700">
            #{category.order}
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
        <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
          <span className="text-gray-400 dark:text-gray-500 font-mono">/{category.slug}</span>
          <span className="text-gray-300 dark:text-gray-700 font-bold">•</span>
          <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/40" title="Sản phẩm đang bán">
            <Package className="h-3 w-3" />
            {category._count?.activeProducts ?? category._count?.products ?? 0} đang bán
          </span>
          {(category._count?.inactiveProducts ?? 0) > 0 && (
            <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200/50 dark:border-amber-800/40" title="Sản phẩm đang ẩn">
              <EyeOff className="h-3 w-3" />
              {category._count?.inactiveProducts} đang ẩn
            </span>
          )}
          {(category._count?.trashProducts ?? 0) > 0 && (
            <span className="flex items-center gap-1 font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200/50 dark:border-red-800/40" title="Sản phẩm trong Thùng rác">
              <Trash2 className="h-3 w-3" />
              {category._count?.trashProducts} thùng rác
            </span>
          )}
        </div>
      </div>

      {/* ── Single Action Column ── */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Order Move Buttons Group */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 border border-gray-200/70 dark:border-gray-700/70 mr-1">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1.5 rounded hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
            title="Di chuyển lên"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1.5 rounded hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
            title="Di chuyển xuống"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Toggle Active */}
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

        {/* Edit */}
        <button
          onClick={onEdit}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          title="Chỉnh sửa"
        >
          <Edit className="h-4 w-4" />
        </button>

        {/* Delete */}
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

          {/* Order */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
              Thứ tự hiển thị (Order)
            </label>
            <input
              type="number"
              value={form.order ?? 0}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
              placeholder="0, 1, 2..."
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100 shadow-sm font-mono"
            />
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

        {/* Promo Banner Settings */}
        <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3 mb-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, hasPromo: !form.hasPromo })}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors mt-0.5",
                form.hasPromo ? "bg-purple-500" : "bg-gray-300 dark:bg-gray-600"
              )}
            >
              <span className={cn("inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform", form.hasPromo ? "translate-x-4" : "translate-x-0.5")} />
            </button>
            <div className="cursor-pointer select-none" onClick={() => setForm({ ...form, hasPromo: !form.hasPromo })}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Cấu hình Promo Banner</h3>
              <p className="text-xs text-gray-500 mt-0.5">Hiển thị banner quảng cáo ở Mega Menu khi rê chuột vào danh mục.</p>
            </div>
          </div>

          {form.hasPromo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-700 dark:text-gray-300">Tiêu đề quảng cáo</label>
                <input
                  type="text"
                  value={form.promoTitle || ""}
                  onChange={(e) => setForm({ ...form, promoTitle: e.target.value })}
                  placeholder="VD: Sắm mạng viễn thông"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-700 dark:text-gray-300">Nhãn nổi bật (Badge)</label>
                <input
                  type="text"
                  value={form.promoBadgeText || ""}
                  onChange={(e) => setForm({ ...form, promoBadgeText: e.target.value })}
                  placeholder="VD: ƯU ĐÃI ĐẶC BIỆT"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1.5 text-gray-700 dark:text-gray-300">Mô tả chi tiết</label>
                <textarea
                  value={form.promoDescription || ""}
                  onChange={(e) => setForm({ ...form, promoDescription: e.target.value })}
                  placeholder="VD: Tặng gói dịch vụ bảo trì 1 năm..."
                  rows={2}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1.5 text-gray-700 dark:text-gray-300">Link đích khi click</label>
                <input
                  type="text"
                  value={form.promoTargetUrl || ""}
                  onChange={(e) => setForm({ ...form, promoTargetUrl: e.target.value })}
                  placeholder="VD: /danh-muc/mang-vien-thong"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
              </div>
              <div className="md:col-span-2">
                <MediaPickerInput
                  label="Hình ảnh Promo"
                  value={form.promoImageUrl || ""}
                  onChange={(url) => setForm({ ...form, promoImageUrl: url })}
                  placeholder="Chọn hoặc tải lên hình ảnh Promo..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Toggles */}
        <div className="pt-4 mt-2 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Tùy chọn hiển thị</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            {/* Active Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
                  form.isActive ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <span className={cn("inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform", form.isActive ? "translate-x-4" : "translate-x-0.5")} />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none" onClick={() => setForm({ ...form, isActive: !form.isActive })}>
                {form.isActive ? "Hiển thị trên website" : "Ẩn khỏi website"}
              </span>
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, isFeatured: !form.isFeatured })}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
                  form.isFeatured ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <span className={cn("inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform", form.isFeatured ? "translate-x-4" : "translate-x-0.5")} />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none" onClick={() => setForm({ ...form, isFeatured: !form.isFeatured })}>
                Danh mục nổi bật
              </span>
            </div>

            {/* Show in Footer Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, showInFooter: !form.showInFooter })}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
                  form.showInFooter ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                <span className={cn("inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform", form.showInFooter ? "translate-x-4" : "translate-x-0.5")} />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none" onClick={() => setForm({ ...form, showInFooter: !form.showInFooter })}>
                Hiển thị ở Footer
              </span>
            </div>
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
