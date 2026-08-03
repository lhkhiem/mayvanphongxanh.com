"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Save, Eye, EyeOff, HelpCircle, Tag, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getFaqs, createFaq, updateFaq, deleteFaq, toggleFaqActive,
  renameFaqCategory, deleteFaqCategory,
  type FaqFormData
} from "./actions";

type Faq = FaqFormData & { id: number; createdAt: Date };

const DEFAULT_FAQ: FaqFormData = {
  question: "",
  answer: "",
  category: "",
  order: 0,
  isActive: true,
};

export default function FaqsPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FaqFormData>(DEFAULT_FAQ);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("Tất cả");

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [catRenameValue, setCatRenameValue] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await getFaqs();
    if (res.error) toast.error(res.error);
    else setFaqs(res.data as Faq[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const existingCategories = Array.from(
    new Set(faqs.map((f) => f.category?.trim()).filter(Boolean))
  ) as string[];

  const filteredFaqs = filterCategory === "Tất cả"
    ? faqs
    : faqs.filter((f) => (f.category?.trim() || "Chung") === filterCategory);

  const handleSave = async () => {
    if (!formData.question || !formData.answer) return toast.error("Vui lòng nhập câu hỏi và câu trả lời!");
    
    if (editingId) {
      const res = await updateFaq(editingId, formData);
      if (res.error) toast.error(res.error);
      else { toast.success("Đã cập nhật câu hỏi"); setShowForm(false); fetchData(); }
    } else {
      const res = await createFaq(formData);
      if (res.error) toast.error(res.error);
      else { toast.success("Đã thêm câu hỏi mới"); setShowForm(false); fetchData(); }
    }
  };

  const handleEdit = (faq: Faq) => {
    setFormData({ ...faq, category: faq.category || "" });
    setEditingId(faq.id);
    setShowForm(true);
  };

  const handleDelete = async (faq: Faq) => {
    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) return;
    const res = await deleteFaq(faq.id);
    if (res.error) toast.error(res.error);
    else { toast.success("Đã xóa câu hỏi"); fetchData(); }
  };

  const handleRenameCategory = async (oldName: string) => {
    if (!catRenameValue.trim()) return toast.error("Tên danh mục không được để trống!");
    if (catRenameValue.trim() === oldName) {
      setEditingCatName(null);
      return;
    }
    const res = await renameFaqCategory(oldName, catRenameValue.trim());
    if (res.error) toast.error(res.error);
    else {
      toast.success(`Đã đổi tên danh mục "${oldName}" thành "${catRenameValue.trim()}"`);
      setEditingCatName(null);
      fetchData();
    }
  };

  const handleDeleteCategory = async (catName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${catName}"? Tất cả câu hỏi thuộc danh mục này sẽ được gán về dạng không thuộc danh mục.`)) return;
    const res = await deleteFaqCategory(catName);
    if (res.error) toast.error(res.error);
    else {
      toast.success(`Đã xóa danh mục "${catName}"`);
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Câu hỏi thường gặp (FAQs)
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Quản lý các câu hỏi phổ biến và danh mục hỗ trợ khách hàng
          </p>
        </div>
        {!showForm && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3.5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-xs cursor-pointer"
            >
              <Tag className="h-4 w-4 text-primary" /> Quản lý danh mục
            </button>
            <button
              onClick={() => { setFormData(DEFAULT_FAQ); setEditingId(null); setShowForm(true); }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Thêm câu hỏi
            </button>
          </div>
        )}
      </div>

      {/* Category CRUD Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#2a303d] rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" /> Quản lý danh mục FAQ
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-xs text-gray-500">
                Quản lý, đổi tên hoặc xóa các danh mục FAQ. Đổi tên danh mục sẽ tự động cập nhật tất cả câu hỏi thuộc danh mục đó.
              </p>

              {existingCategories.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500 italic border border-dashed rounded-xl">
                  Chưa có danh mục nào. Hãy gán danh mục khi thêm hoặc chỉnh sửa câu hỏi.
                </div>
              ) : (
                <div className="space-y-2">
                  {existingCategories.map((cat) => {
                    const count = faqs.filter(f => (f.category?.trim() || '') === cat).length;
                    const isEditingThis = editingCatName === cat;

                    return (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 gap-2"
                      >
                        {isEditingThis ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={catRenameValue}
                              onChange={(e) => setCatRenameValue(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') handleRenameCategory(cat); }}
                              className="flex-1 px-3 py-1.5 rounded-lg border border-primary bg-white dark:bg-gray-900 text-sm outline-none font-medium"
                              autoFocus
                            />
                            <button
                              onClick={() => handleRenameCategory(cat)}
                              className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                              title="Lưu"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingCatName(null)}
                              className="p-1.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                              title="Hủy"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{cat}</span>
                              <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-semibold shrink-0">
                                {count} câu hỏi
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => { setEditingCatName(cat); setCatRenameValue(cat); }}
                                className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                                title="Đổi tên danh mục"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat)}
                                className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer"
                                title="Xóa danh mục"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white dark:bg-[#2a303d] rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm max-w-4xl">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            {editingId ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 md:col-span-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Câu hỏi *</label>
                <textarea 
                  value={formData.question} 
                  onChange={e => setFormData({ ...formData, question: e.target.value })} 
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
                  rows={2} 
                  placeholder="VD: Chính sách bảo hành như thế nào?" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Câu trả lời *</label>
                <textarea 
                  value={formData.answer} 
                  onChange={e => setFormData({ ...formData, answer: e.target.value })} 
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
                  rows={5} 
                  placeholder="Nội dung câu trả lời chi tiết..." 
                />
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Danh mục câu hỏi</label>
                <div className="space-y-2">
                  <input 
                    type="text" 
                    list="faq-categories-list"
                    value={formData.category || ""} 
                    onChange={e => setFormData({ ...formData, category: e.target.value })} 
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="Nhập tên danh mục mới hoặc chọn danh mục phía dưới (VD: Bảo hành, Dịch vụ...)" 
                  />
                  <datalist id="faq-categories-list">
                    {existingCategories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>

                  {existingCategories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-xs text-gray-500 font-medium shrink-0">Danh mục sẵn có:</span>
                      {existingCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat })}
                          className={cn(
                            "text-xs px-2.5 py-1 rounded-full transition-all cursor-pointer border",
                            formData.category === cat
                              ? "bg-primary text-white border-primary font-bold shadow-xs"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary"
                          )}
                        >
                          + {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Thứ tự</label>
                  <input 
                    type="number" 
                    value={formData.order} 
                    onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} 
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Trạng thái</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.isActive} 
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })} 
                      className="rounded border-gray-300 text-primary focus:ring-primary w-5 h-5" 
                    />
                    <span className="text-sm">Hiển thị công khai</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-5">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
              Hủy
            </button>
            <button onClick={handleSave} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 shadow-sm cursor-pointer">
              <Save className="h-4 w-4" /> Lưu Câu hỏi
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <div className="space-y-4">
          {existingCategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0 mr-1">
                Lọc theo danh mục:
              </span>
              {['Tất cả', ...existingCategories].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                    filterCategory === cat
                      ? "bg-primary text-white shadow-xs font-bold"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="bg-white dark:bg-[#2a303d] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium w-1/3">Câu hỏi</th>
                  <th className="px-4 py-3 font-medium">Danh mục</th>
                  <th className="px-4 py-3 font-medium text-center">Thứ tự</th>
                  <th className="px-4 py-3 font-medium text-center">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredFaqs.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">Không có câu hỏi nào trong danh mục này.</td></tr>
                ) : filteredFaqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{faq.question}</p>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-1">{faq.answer}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {faq.category || "Chung"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono">{faq.order}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={async () => {
                          await toggleFaqActive(faq.id, faq.isActive);
                          fetchData();
                        }}
                        className={cn(
                          "inline-flex items-center justify-center p-1.5 rounded-full transition-colors cursor-pointer",
                          faq.isActive ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        )}
                        title={faq.isActive ? "Ẩn" : "Hiện"}
                      >
                        {faq.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(faq)} className="p-1.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 hover:text-primary transition-colors cursor-pointer" title="Sửa"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(faq)} className="p-1.5 rounded bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 transition-colors cursor-pointer" title="Xóa"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
