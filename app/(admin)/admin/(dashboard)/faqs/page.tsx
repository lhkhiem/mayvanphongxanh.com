"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Save, Eye, EyeOff, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getFaqs, createFaq, updateFaq, deleteFaq, toggleFaqActive,
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
            Quản lý các câu hỏi phổ biến để hỗ trợ khách hàng
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setFormData(DEFAULT_FAQ); setEditingId(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Thêm câu hỏi
          </button>
        )}
      </div>

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
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm" 
                  rows={2} 
                  placeholder="VD: Chính sách bảo hành như thế nào?" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Câu trả lời *</label>
                <textarea 
                  value={formData.answer} 
                  onChange={e => setFormData({ ...formData, answer: e.target.value })} 
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm" 
                  rows={5} 
                  placeholder="Nội dung câu trả lời chi tiết..." 
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Danh mục</label>
                <input 
                  type="text" 
                  value={formData.category || ""} 
                  onChange={e => setFormData({ ...formData, category: e.target.value })} 
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm" 
                  placeholder="VD: Bảo hành, Thanh toán..." 
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Thứ tự</label>
                  <input 
                    type="number" 
                    value={formData.order} 
                    onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} 
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm" 
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
                    <span className="text-sm">Hiển thị</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-5">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              Hủy
            </button>
            <button onClick={handleSave} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 shadow-sm">
              <Save className="h-4 w-4" /> Lưu Câu hỏi
            </button>
          </div>
        </div>
      )}

      {!showForm && (
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
              {faqs.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Chưa có câu hỏi nào.</td></tr>
              ) : faqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{faq.question}</p>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-1">{faq.answer}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">
                      {faq.category || "Chung"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{faq.order}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={async () => {
                        await toggleFaqActive(faq.id, faq.isActive);
                        fetchData();
                      }}
                      className={cn(
                        "inline-flex items-center justify-center p-1.5 rounded-full transition-colors",
                        faq.isActive ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      )}
                      title={faq.isActive ? "Ẩn" : "Hiện"}
                    >
                      {faq.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(faq)} className="p-1.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 hover:text-primary transition-colors"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(faq)} className="p-1.5 rounded bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 transition-colors"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
