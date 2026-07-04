"use client";

import { useState, useEffect } from "react";
import { getPolicies, createPolicy, updatePolicy, deletePolicy, type PolicyInput } from "./actions";
import { toast } from "sonner";
import { Plus, Edit, Trash2, ShieldCheck, Truck, Headphones, Star, CheckCircle, Package, Zap, Gift, RefreshCw, Award, ThumbsUp, Wrench, Settings, AlertCircle, Info, Bookmark, HelpCircle, Phone, Lock, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  Truck, ShieldCheck, Headphones, Star, CheckCircle, Package, Zap, Gift, RefreshCw, Award, ThumbsUp, Wrench, Settings, AlertCircle, Info, Bookmark, HelpCircle, Phone, Lock, Heart
};

type IconName = keyof typeof ICONS;

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<PolicyInput>({
    title: "",
    description: "",
    icon: "CheckCircle",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getPolicies();
    setPolicies(data);
    setLoading(false);
  };

  const openModal = (policy?: any) => {
    if (policy) {
      setEditingId(policy.id);
      setForm({ title: policy.title, description: policy.description || "", icon: policy.icon });
    } else {
      setEditingId(null);
      setForm({ title: "", description: "", icon: "CheckCircle" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Vui lòng nhập tên chính sách.");

    const res = editingId 
      ? await updatePolicy(editingId, form)
      : await createPolicy(form);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(editingId ? "Cập nhật thành công!" : "Tạo thành công!");
      fetchData();
      closeModal();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chính sách này? Các sản phẩm đang dùng sẽ bị gỡ bỏ.")) return;
    const res = await deletePolicy(id);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Đã xóa chính sách!");
      fetchData();
    }
  };

  const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
    const IconComponent = ICONS[name as IconName] || ICONS.CheckCircle;
    return <IconComponent className={className} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Chính sách & Tiện ích</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quản lý các thẻ nổi bật trên trang sản phẩm (Giao hàng, Bảo hành...)</p>
        </div>
        <button onClick={() => openModal()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 shadow-sm transition-colors">
          <Plus className="h-4 w-4" /> Thêm Chính sách
        </button>
      </div>

      {loading ? (
        <div className="flex h-32 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : policies.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 py-16 text-center text-gray-500">
          <CheckCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p>Chưa có chính sách nào. Bấm "Thêm Chính sách" để bắt đầu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {policies.map((p) => (
            <div key={p.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#2a303d] p-5 shadow-sm hover:shadow-md transition-shadow group relative">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <DynamicIcon name={p.icon} className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{p.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{p.description}</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => openModal(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10"><Edit className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#2a303d] shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{editingId ? "Sửa Chính sách" : "Thêm Chính sách mới"}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500"><Plus className="h-5 w-5 rotate-45" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Biểu tượng (Icon)</label>
                <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1">
                  {(Object.keys(ICONS) as IconName[]).map((iconName) => {
                    const IconComponent = ICONS[iconName];
                    return (
                      <div
                        key={iconName}
                        onClick={() => setForm({ ...form, icon: iconName })}
                        className={cn(
                          "flex h-10 cursor-pointer items-center justify-center rounded-lg border transition-colors",
                          form.icon === iconName ? "border-primary bg-primary/10 text-primary" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Tiêu đề</label>
                <input required type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="VD: Giao hàng miễn phí" className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Mô tả phụ</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="VD: Cho đơn hàng trên 500k" className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-sm font-medium text-white hover:bg-primary/90 transition-colors">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
