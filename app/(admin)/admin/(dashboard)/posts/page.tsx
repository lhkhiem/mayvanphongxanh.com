"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { EmptyState } from "@/components/admin/empty-state";
import { FileText, Plus, Edit, Trash2, Eye, EyeOff, Calendar } from "lucide-react";
import { getPosts, deletePost, togglePostActive } from "./actions";

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'drafts'>('all');

  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    setLoading(true);
    const res = await getPosts(filter);
    if (res.error) {
      toast.error(res.error);
    } else if (res.data) {
      setPosts(res.data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      return;
    }
    const res = await deletePost(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Xóa bài viết thành công");
      fetchPosts();
    }
  };

  const handleTogglePublish = async (post: any) => {
    const res = await togglePostActive(post.id, post.isActive);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(post.isActive ? "Đã ẩn bài viết" : "Đã publish bài viết");
      fetchPosts();
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
            Quản lý Bài viết
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Quản lý và chỉnh sửa các bài viết tin tức
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Tạo bài viết mới
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
          Đã xuất bản
        </button>
        <button
          onClick={() => setFilter('drafts')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'drafts'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Bản nháp
        </button>
      </div>

      {/* News List */}
      {posts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Chưa có bài viết nào"
          description={
            filter === 'all'
              ? 'Bắt đầu tạo bài viết đầu tiên của bạn'
              : filter === 'published'
              ? 'Chưa có bài viết nào được xuất bản'
              : 'Chưa có bản nháp nào'
          }
          action={
            filter !== 'published'
              ? {
                  label: "Tạo bài viết mới",
                  onClick: () => window.location.href = '/admin/posts/new',
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {posts.map((item) => (
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
                    <FileText className="h-8 w-8" />
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
                            Bản nháp
                          </span>
                        )}
                      </div>
                      
                      {item.excerpt && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                          {item.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                        {item.category?.name && (
                          <span className="font-medium text-primary">
                            {item.category.name}
                          </span>
                        )}
                        {item.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.publishedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0 mt-2 md:mt-0">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        className={`p-2 rounded-lg transition-colors ${
                          item.isActive 
                            ? 'hover:bg-amber-50 text-amber-600 dark:hover:bg-amber-900/30 dark:text-amber-400'
                            : 'hover:bg-green-50 text-green-600 dark:hover:bg-green-900/30 dark:text-green-400'
                        }`}
                        title={item.isActive ? 'Ẩn bài viết' : 'Xuất bản bài viết'}
                      >
                        {item.isActive ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <Link
                        href={`/admin/posts/${item.id}`}
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
