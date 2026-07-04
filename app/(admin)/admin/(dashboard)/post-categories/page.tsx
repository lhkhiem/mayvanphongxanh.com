"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/admin/empty-state";
import { Folder, Plus, Edit, Trash2, X, Save } from "lucide-react";
import {
  getPostCategories,
  createPostCategory,
  updatePostCategory,
  deletePostCategory,
} from "./actions";

interface PostCategory {
  id: number;
  name: string;
  slug: string;
}

// Hàm hỗ trợ tạo slug từ tiếng Việt
function generateSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/([^0-9a-z-\s])/g, "")
    .replace(/(\s+)/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PostCategoriesPage() {
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", slug: "" });
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (autoGenerateSlug && formData.name) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(formData.name) }));
    }
  }, [formData.name, autoGenerateSlug]);

  const fetchCategories = async () => {
    setLoading(true);
    const res = await getPostCategories();
    if (res.error) {
      toast.error(res.error);
    } else if (res.data) {
      setCategories(res.data);
    }
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createPostCategory(formData);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Tạo danh mục thành công");
      setShowAddForm(false);
      setFormData({ name: "", slug: "" });
      fetchCategories();
    }
  };

  const handleUpdate = async (id: number, data: { name: string; slug: string }) => {
    const res = await updatePostCategory(id, data);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Cập nhật danh mục thành công");
      setEditingId(null);
      fetchCategories();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      return;
    }
    const res = await deletePostCategory(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Xóa danh mục thành công");
      fetchCategories();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Quản lý Danh mục Tin tức
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Quản lý các danh mục bài viết, tin tức trên website
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

      {/* Add Form */}
      {showAddForm && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Thêm danh mục mới
            </h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label htmlFor="add-name" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                id="add-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100 shadow-sm"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="add-slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Slug <span className="text-red-500">*</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoGenerateSlug}
                    onChange={(e) => setAutoGenerateSlug(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  Tự động tạo từ tên
                </label>
              </div>
              <input
                id="add-slug"
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                disabled={autoGenerateSlug}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-800 dark:text-gray-100 shadow-sm"
                required
              />
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors dark:text-gray-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Save className="h-4 w-4" />
                Lưu danh mục
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
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
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] p-4 shadow-sm"
            >
              {editingId === category.id ? (
                <CategoryEditForm
                  category={category}
                  onSave={(data) => handleUpdate(category.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Folder className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        Slug: {category.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => setEditingId(category.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryEditForm({
  category,
  onSave,
  onCancel,
}: {
  category: PostCategory;
  onSave: (data: { name: string; slug: string }) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: category.name,
    slug: category.slug,
  });
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(false);

  useEffect(() => {
    if (autoGenerateSlug && formData.name) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(formData.name) }));
    }
  }, [formData.name, autoGenerateSlug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="edit-name" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Tên danh mục <span className="text-red-500">*</span>
        </label>
        <input
          id="edit-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100 shadow-sm"
          required
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="edit-slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Slug <span className="text-red-500">*</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoGenerateSlug}
              onChange={(e) => setAutoGenerateSlug(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            Tự động tạo từ tên
          </label>
        </div>
        <input
          id="edit-slug"
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
          disabled={autoGenerateSlug}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-800 dark:text-gray-100 shadow-sm"
          required
        />
      </div>
      
      <div className="flex items-center justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors dark:text-gray-200"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Save className="h-4 w-4" />
          Lưu thay đổi
        </button>
      </div>
    </form>
  );
}
