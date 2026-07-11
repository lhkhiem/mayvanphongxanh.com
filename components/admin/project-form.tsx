"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createProject, updateProject } from "@/app/(admin)/admin/(dashboard)/projects/actions";
import { MediaPickerInput } from "@/components/admin/media-picker-input";
import { RichTextEditor, RichTextEditorRef } from "@/components/admin/rich-text-editor";
import { MediaPickerModal } from "@/components/admin/media-picker-modal";

export function ProjectForm({
  initialData,
}: {
  initialData?: any;
}) {
  const router = useRouter();
  const isEditing = !!initialData;
  const editorRef = useRef<RichTextEditorRef>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    client: initialData?.client || "",
    description: initialData?.description || "",
    image: initialData?.image || "",
    category: initialData?.category || "",
    isActive: initialData?.isActive ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = isEditing
      ? await updateProject(initialData.id, formData)
      : await createProject(formData);

    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(isEditing ? "Cập nhật thành công" : "Tạo dự án thành công");
      router.push("/admin/projects");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/projects"
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {isEditing ? "Chỉnh sửa dự án" : "Thêm dự án mới"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/projects")}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors dark:text-gray-200 shadow-sm bg-white dark:bg-[#2a303d]"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? "Đang lưu..." : "Lưu dự án"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
              Thông tin dự án
            </h2>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Tên dự án <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100 shadow-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Khách hàng
                </label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100 shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Lĩnh vực / Danh mục
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100 shadow-sm"
                  placeholder="Vd: Ngân hàng, Giáo dục..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Mô tả chi tiết <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                ref={editorRef}
                value={formData.description}
                onChange={(val) => setFormData({ ...formData, description: val })}
                onImagePickerRequest={() => setIsMediaPickerOpen(true)}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings Area */}
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
              Cài đặt hiển thị
            </h2>
            
            <div className="flex items-center gap-3">
              <input
                id="is-active"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 h-5 w-5 text-primary focus:ring-primary"
              />
              <label htmlFor="is-active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Hiển thị dự án
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
              Ảnh đại diện
            </h2>
            <MediaPickerInput
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              placeholder="Click để chọn ảnh"
            />
            {formData.image && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <img src={formData.image} alt="Preview" className="w-full h-auto object-cover max-h-48" />
              </div>
            )}
          </div>
        </div>
      </div>
      
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          editorRef.current?.insertImages([url]);
          setIsMediaPickerOpen(false);
        }}
      />
    </form>
  );
}
