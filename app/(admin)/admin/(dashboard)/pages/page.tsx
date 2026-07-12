"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { EmptyState } from "@/components/admin/empty-state";
import { FileText, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

export default function PagesPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pages");
      if (!res.ok) throw new Error("Failed to fetch pages");
      const data = await res.json();
      setPages(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách trang");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa trang này?")) {
      return;
    }
    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete page");
      toast.success("Xóa trang thành công");
      fetchPages();
    } catch (error) {
      toast.error("Lỗi khi xóa trang");
    }
  };

  const handleTogglePublish = async (page: any) => {
    try {
      const res = await fetch(`/api/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...page, isActive: !page.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update page");
      toast.success(page.isActive ? "Đã ẩn trang" : "Đã hiển thị trang");
      fetchPages();
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
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
            Quản lý Trang tĩnh
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Tạo và quản lý các trang nội dung tĩnh như Chính sách, Điều khoản
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Thêm trang
        </Link>
      </div>

      {pages.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Chưa có trang tĩnh nào"
          description="Bắt đầu tạo trang nội dung đầu tiên của bạn"
          action={{
            label: "Thêm trang",
            onClick: () => window.location.href = '/admin/pages/new',
          }}
        />
      ) : (
        <div className="space-y-4">
          {pages.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                          {item.title}
                        </h3>
                        {!item.isActive && (
                          <span className="px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded whitespace-nowrap">
                            Đang ẩn
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        Slug: /{item.slug}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0 mt-2 md:mt-0">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        className={`p-2 rounded-lg transition-colors ${
                          item.isActive 
                            ? 'hover:bg-amber-50 text-amber-600 dark:hover:bg-amber-900/30 dark:text-amber-400'
                            : 'hover:bg-green-50 text-green-600 dark:hover:bg-green-900/30 dark:text-green-400'
                        }`}
                        title={item.isActive ? 'Ẩn' : 'Hiển thị'}
                      >
                        {item.isActive ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <Link
                        href={`/admin/pages/${item.id}`}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
