"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, ArrowLeft, Globe, Share2, Info, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { createService, updateService } from "@/app/(admin)/admin/(dashboard)/services/actions";
import { MediaPickerInput } from "@/components/admin/media-picker-input";
import { RichTextEditor, RichTextEditorRef } from "@/components/admin/rich-text-editor";
import { MediaPickerModal } from "@/components/admin/media-picker-modal";
import { cn, cleanUrl } from "@/lib/utils";

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

export function ServiceForm({
  initialData,
}: {
  initialData?: any;
}) {
  const router = useRouter();
  const isEditing = !!initialData;
  const editorRef = useRef<RichTextEditorRef>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    image: initialData?.image || "",
    icon: initialData?.icon || "",
    order: initialData?.order || 0,
    price: initialData?.price || "",
    originalPrice: initialData?.originalPrice || "",
    isContactPrice: initialData?.isContactPrice ?? true,
    isSeoCustom: initialData?.isSeoCustom ?? false,
    metaTitle: initialData?.metaTitle || "",
    metaDescription: initialData?.metaDescription || "",
    metaKeywords: initialData?.metaKeywords || "",
    isActive: initialData?.isActive ?? true,
  });

  const [autoGenerateSlug, setAutoGenerateSlug] = useState(!isEditing);
  const [loading, setLoading] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  useEffect(() => {
    if (autoGenerateSlug && formData.title) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(formData.title) }));
    }
  }, [formData.title, autoGenerateSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = isEditing
      ? await updateService(initialData.id, formData)
      : await createService(formData);

    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(isEditing ? "Cập nhật thành công" : "Tạo dịch vụ thành công");
      router.push("/admin/services");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/services"
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {isEditing ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/services")}
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
            {loading ? "Đang lưu..." : "Lưu dịch vụ"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
              Nội dung chính
            </h2>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Tên dịch vụ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100 shadow-sm"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Slug <span className="text-red-500">*</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoGenerateSlug}
                    onChange={(e) => setAutoGenerateSlug(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  Tự động tạo
                </label>
              </div>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                disabled={autoGenerateSlug}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-800 dark:text-gray-100 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Mô tả ngắn (Tóm tắt)
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100 shadow-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Nội dung chi tiết <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                ref={editorRef}
                value={formData.content}
                onChange={(val) => setFormData({ ...formData, content: val })}
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
                Hiển thị dịch vụ
              </label>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-3">
              <div className="flex items-center gap-3">
                <input
                  id="is-contact-price"
                  type="checkbox"
                  checked={formData.isContactPrice}
                  onChange={(e) => setFormData({ ...formData, isContactPrice: e.target.checked })}
                  className="rounded border-gray-300 h-5 w-5 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="is-contact-price" className="text-sm font-medium text-amber-900 dark:text-amber-200">
                  Giá Liên Hệ (Ẩn giá tiền)
                </label>
              </div>

              {!formData.isContactPrice && (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Giá dịch vụ (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="VD: 500000"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Giá gốc / Niêm yết (nếu có giảm giá)
                    </label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      placeholder="VD: 700000"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100 shadow-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100 shadow-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Icon (tên icon của Lucide-react hoặc URL ảnh)
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100 shadow-sm"
              />
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

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-emerald-500" />
                  SEO Metadata & Chia sẻ
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Chuyển đổi giữa chế độ SEO tự động từ dịch vụ hoặc tùy chỉnh.
                </p>
              </div>

              {/* Switch Toggle for Custom SEO */}
              <div className="flex items-center gap-2.5 bg-gray-100 dark:bg-gray-800/80 p-1.5 px-3 rounded-lg border border-gray-200 dark:border-gray-700 shrink-0">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {formData.isSeoCustom ? "SEO Tùy chỉnh (ON)" : "SEO Tự động (OFF)"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.isSeoCustom || false}
                  onClick={() => setFormData({ ...formData, isSeoCustom: !formData.isSeoCustom })}
                  className={cn(
                    "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    formData.isSeoCustom ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      formData.isSeoCustom ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Option 1: Default Mode Notice (when isSeoCustom is OFF) */}
            {!formData.isSeoCustom ? (
              <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200/70 dark:border-emerald-900/40 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                    OFF: SEO Mặc định dịch vụ
                  </span>
                </div>
                <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-2 pl-4 list-disc">
                  <li>
                    <strong>SEO Title:</strong> <code>{formData.title ? `${formData.title} | Máy Văn Phòng Xanh` : 'Tên dịch vụ | Máy Văn Phòng Xanh'}</code>
                  </li>
                  <li>
                    <strong>Meta Description:</strong> Tự động lấy từ Tóm tắt dịch vụ ({formData.excerpt ? `${formData.excerpt.slice(0, 100)}...` : 'Chưa có tóm tắt'}).
                  </li>
                  <li>
                    <strong>SEO Image:</strong> Tự động lấy <strong>Ảnh đại diện dịch vụ</strong>.
                  </li>
                </ul>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 pt-2 italic border-t border-emerald-100 dark:border-emerald-900/30 mt-2">
                  💡 Bật công tắc <strong>"SEO Tùy chỉnh (ON)"</strong> ở trên để tự nhập Tiêu đề, Mô tả và Từ khóa riêng cho dịch vụ này.
                </p>
              </div>
            ) : (
              /* Option 2: Custom SEO Input Fields (when isSeoCustom is ON) */
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-600 text-white">
                    ON: SEO Tùy chỉnh
                  </span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      SEO Title (Tiêu đề chia sẻ)
                    </label>
                    <span className="text-xs text-gray-400">{(formData.metaTitle || '').length}/60</span>
                  </div>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    maxLength={60}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-gray-100 shadow-sm"
                    placeholder={formData.title ? `${formData.title} | Máy Văn Phòng Xanh` : "Tiêu đề trang chia sẻ..."}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Khuyên dùng 50 - 60 ký tự. Để trống sẽ tự động dùng tên dịch vụ.
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Meta Description (Mô tả chia sẻ)
                    </label>
                    <span className="text-xs text-gray-400">{(formData.metaDescription || '').length}/160</span>
                  </div>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    maxLength={160}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-gray-100 shadow-sm resize-none"
                    placeholder="Mô tả tóm tắt hiển thị khi chia sẻ..."
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Khuyên dùng 120 - 160 ký tự.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">
                    SEO Keywords (Từ khóa SEO)
                  </label>
                  <input
                    type="text"
                    value={formData.metaKeywords}
                    onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                    placeholder="Nhập các từ khóa phân cách bằng dấu phẩy..."
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-gray-100 shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* Social Share Live Preview */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="font-semibold flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                  <Share2 className="w-3.5 h-3.5 text-emerald-500" /> Xem trước hiển thị chia sẻ
                </span>
                <span>{formData.isSeoCustom ? "Trạng thái: Tùy chỉnh" : "Trạng thái: Mặc định"}</span>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/40 shadow-sm">
                <div className="relative aspect-video w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {formData.image ? (
                    <img src={cleanUrl(formData.image) || '/placeholder.jpg'} alt="SEO Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <ImageIcon className="w-8 h-8 opacity-40" />
                      <span className="text-xs">Chưa có ảnh đại diện dịch vụ</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 space-y-1 bg-white dark:bg-[#2a303d]">
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">MAYVANPHONGXANH.COM</div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
                    {formData.isSeoCustom
                      ? (formData.metaTitle?.trim() || formData.title || 'Tên dịch vụ khi chia sẻ')
                      : (formData.title ? `${formData.title} | Máy Văn Phòng Xanh` : 'Tên dịch vụ khi chia sẻ')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {formData.isSeoCustom
                      ? (formData.metaDescription?.trim() || formData.excerpt || 'Mô tả dịch vụ khi chia sẻ...')
                      : (formData.excerpt || (formData.content ? formData.content.replace(/<[^>]+>/g, '').trim().slice(0, 120) : '') || 'Mô tả dịch vụ khi chia sẻ...')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        multiple={true}
        onSelectMultiple={(urls) => {
          editorRef.current?.insertImages(urls);
          setIsMediaPickerOpen(false);
        }}
        onSelect={(url) => {
          editorRef.current?.insertImages([url]);
          setIsMediaPickerOpen(false);
        }}
      />
    </form>
  );
}
