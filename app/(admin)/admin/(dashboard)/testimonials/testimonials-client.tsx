"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import Image from "next/image";
import {
  Plus, Edit, Trash2, Save, Eye, EyeOff, MessageSquare, Star, Search,
  ImageIcon, CheckCircle2, Clock, Filter, X, User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaPickerModal } from "@/components/admin/media-picker-modal";
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialActive,
  type TestimonialFormData,
} from "./actions";

export type Testimonial = TestimonialFormData & {
  id: number;
  createdAt: Date | string;
};

const DEFAULT_FORM: TestimonialFormData = {
  name: "",
  role: "",
  content: "",
  rating: 5,
  image: "",
  isActive: true,
};

export function TestimonialsClient() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "PENDING">("ALL");

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<TestimonialFormData>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Media Picker State
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await getTestimonials();
    if (res.error) {
      toast.error(res.error);
    } else {
      setTestimonials((res.data as any[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered List
  const filteredList = testimonials.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase()) ||
      (t.role && t.role.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "ACTIVE") return t.isActive === true;
    if (statusFilter === "PENDING") return t.isActive === false;
    return true;
  });

  const handleOpenCreate = () => {
    setFormData(DEFAULT_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const handleOpenEdit = (t: Testimonial) => {
    setFormData({
      name: t.name,
      role: t.role || "",
      content: t.content,
      rating: t.rating,
      image: t.image || "",
      isActive: t.isActive,
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return toast.error("Vui lòng nhập tên khách hàng!");
    if (!formData.content.trim()) return toast.error("Vui lòng nhập nội dung nhận xét!");

    setSubmitting(true);
    if (editingId) {
      const res = await updateTestimonial(editingId, formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Đã cập nhật đánh giá!");
        setShowForm(false);
        fetchData();
      }
    } else {
      const res = await createTestimonial(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Đã thêm đánh giá thành công!");
        setShowForm(false);
        fetchData();
      }
    }
    setSubmitting(false);
  };

  const handleDelete = async (t: Testimonial) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa đánh giá của "${t.name}"?`)) return;
    const res = await deleteTestimonial(t.id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Đã xóa đánh giá!");
      fetchData();
    }
  };

  const handleToggleActive = async (t: Testimonial) => {
    const res = await toggleTestimonialActive(t.id, t.isActive);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(t.isActive ? "Đã ẩn đánh giá khỏi trang chủ" : "Đã duyệt và hiển thị đánh giá lên trang chủ");
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-primary" /> Quản lý Đánh giá khách hàng
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Quản lý các nhận xét từ khách hàng hiển thị trên Trang chủ và duyệt bài gửi công khai
          </p>
        </div>

        {!showForm && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" /> Thêm đánh giá mới
          </button>
        )}
      </div>

      {/* Form Dialog / Drawer */}
      {showForm && (
        <div className="bg-white dark:bg-[#2a303d] rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-md max-w-4xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              {editingId ? "Chỉnh sửa đánh giá" : "Thêm đánh giá mới"}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Tên khách hàng *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Nguyễn Văn Nam"
                className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Chức danh / Doanh nghiệp
              </label>
              <input
                type="text"
                value={formData.role || ""}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="VD: Trưởng phòng Hành chính, Legal Associates"
                className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Đánh giá số sao (Rating)
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className="w-6 h-6"
                        fill={star <= formData.rating ? "#FFA726" : "#E0E0E0"}
                        color={star <= formData.rating ? "#FFA726" : "#E0E0E0"}
                      />
                    </button>
                  ))}
                </div>
                <span className="font-bold text-base text-amber-600 dark:text-amber-400">
                  {formData.rating} / 5 sao
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Ảnh đại diện (Avatar)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                  {formData.image ? (
                    <Image src={formData.image} alt="Avatar" fill className="object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <input
                  type="text"
                  value={formData.image || ""}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="URL ảnh hoặc chọn thư viện..."
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-primary" /> Chọn
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Nội dung nhận xét *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                placeholder="Nhập cảm nhận, đánh giá của khách hàng về dịch vụ/sản phẩm..."
                className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Duyệt & Hiển thị công khai trên Trang chủ
                </span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              <Save className="h-4 w-4" /> {submitting ? "Đang lưu..." : "Lưu đánh giá"}
            </button>
          </div>
        </div>
      )}

      {/* Main List */}
      {!showForm && (
        <div className="space-y-4">
          {/* Controls: Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#2a303d] p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên khách hàng, nội dung..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              <Filter className="w-4 h-4 text-gray-400 shrink-0 mr-1" />
              {(
                [
                  { key: "ALL", label: `Tất cả (${testimonials.length})` },
                  {
                    key: "ACTIVE",
                    label: `Đã duyệt (${testimonials.filter((t) => t.isActive).length})`,
                  },
                  {
                    key: "PENDING",
                    label: `Chờ duyệt (${testimonials.filter((t) => !t.isActive).length})`,
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap",
                    statusFilter === tab.key
                      ? "bg-primary text-white shadow-xs font-bold"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#2a303d] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Khách hàng</th>
                    <th className="px-4 py-3 font-semibold">Nội dung nhận xét</th>
                    <th className="px-4 py-3 font-semibold text-center">Đánh giá</th>
                    <th className="px-4 py-3 font-semibold text-center">Trạng thái</th>
                    <th className="px-4 py-3 font-semibold text-center">Ngày tạo</th>
                    <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400 italic">
                        Không tìm thấy đánh giá nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((t) => (
                      <tr
                        key={t.id}
                        className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        {/* Author */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                              {t.image ? (
                                <Image
                                  src={t.image}
                                  alt={t.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <User className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-gray-100">
                                {t.name}
                              </p>
                              {t.role && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                  {t.role}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Content */}
                        <td className="px-4 py-3.5 max-w-xs md:max-w-md">
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 italic">
                            &ldquo;{t.content}&rdquo;
                          </p>
                        </td>

                        {/* Rating */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-3.5 h-3.5"
                                fill={i < Math.floor(t.rating) ? "#FFA726" : "#E0E0E0"}
                                color={i < Math.floor(t.rating) ? "#FFA726" : "#E0E0E0"}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-semibold text-gray-500 mt-0.5 block">
                            {t.rating}/5
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => handleToggleActive(t)}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer",
                              t.isActive
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-200"
                            )}
                            title={t.isActive ? "Bấm để Ẩn" : "Bấm để Duyệt & Hiển thị"}
                          >
                            {t.isActive ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Đã duyệt
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5" /> Chờ duyệt
                              </>
                            )}
                          </button>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 text-center text-xs text-gray-500 font-mono">
                          {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleActive(t)}
                              className={cn(
                                "p-1.5 rounded-lg transition-colors cursor-pointer",
                                t.isActive
                                  ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                  : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              )}
                              title={t.isActive ? "Ẩn" : "Duyệt"}
                            >
                              {t.isActive ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleOpenEdit(t)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                              title="Sửa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(t)}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(url) => {
          setFormData((prev) => ({ ...prev, image: url }));
          setShowMediaPicker(false);
        }}
        title="Chọn ảnh đại diện khách hàng"
      />
    </div>
  );
}
