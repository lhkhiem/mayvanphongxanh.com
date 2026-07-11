"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { EmptyState } from "@/components/admin/empty-state";
import { Briefcase, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { getProjects, deleteProject, toggleProjectActive } from "./actions";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'drafts'>('all');

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  const fetchProjects = async () => {
    setLoading(true);
    const res = await getProjects(filter);
    if (res.error) {
      toast.error(res.error);
    } else if (res.data) {
      setProjects(res.data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa dự án này?")) {
      return;
    }
    const res = await deleteProject(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Xóa dự án thành công");
      fetchProjects();
    }
  };

  const handleTogglePublish = async (project: any) => {
    const res = await toggleProjectActive(project.id, project.isActive);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(project.isActive ? "Đã ẩn dự án" : "Đã hiển thị dự án");
      fetchProjects();
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
            Dự án tiêu biểu
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Quản lý các dự án tiêu biểu đã thực hiện
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Thêm dự án
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter('published')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'published'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Đang hiển thị
        </button>
        <button
          onClick={() => setFilter('drafts')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'drafts'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Đang ẩn
        </button>
      </div>

      {/* List */}
      {projects.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Chưa có dự án nào"
          description={
            filter === 'all'
              ? 'Bắt đầu thêm dự án đầu tiên của bạn'
              : filter === 'published'
              ? 'Chưa có dự án nào đang hiển thị'
              : 'Chưa có dự án nào đang ẩn'
          }
          action={
            filter !== 'published'
              ? {
                  label: "Thêm dự án",
                  onClick: () => window.location.href = '/admin/projects/new',
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {projects.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-32 h-24 md:h-32 object-cover rounded-lg flex-shrink-0 border border-gray-100 dark:border-gray-800"
                  />
                ) : (
                  <div className="w-32 h-24 md:h-32 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-400">
                    <Briefcase className="h-8 w-8" />
                  </div>
                )}
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
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap mb-3">
                        {item.category && (
                          <span className="font-medium text-primary">
                            {item.category}
                          </span>
                        )}
                        {item.client && (
                          <span>Khách hàng: {item.client}</span>
                        )}
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2" dangerouslySetInnerHTML={{ __html: item.description }} />
                      )}
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
                        href={`/admin/projects/${item.id}`}
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
