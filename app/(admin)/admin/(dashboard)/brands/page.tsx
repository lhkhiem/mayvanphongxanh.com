"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { 
  Plus, Edit, Trash2, Search, Check, X, Image as ImageIcon, Briefcase
} from "lucide-react";
import { getBrands, createBrand, updateBrand, deleteBrand } from "./actions";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/admin/empty-state";
import { MediaPickerModal } from "@/components/admin/media-picker-modal";

export default function BrandsPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Media Picker state
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    slug: "",
    logo: "",
    description: "",
    isActive: true
  });

  const loadBrands = async () => {
    setLoading(true);
    const res = await getBrands();
    if (res.data) setBrands(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleOpenAdd = () => {
    setForm({ name: "", slug: "", logo: "", description: "", isActive: true });
    setIsEditing(false);
    setCurrentId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand: any) => {
    setForm({
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo || "",
      description: brand.description || "",
      isActive: brand.isActive
    });
    setIsEditing(true);
    setCurrentId(brand.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, count: number) => {
    if (count > 0) {
      toast.error(`Không thể xóa thương hiệu này vì đang có ${count} sản phẩm.`);
      return;
    }
    if (!confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) return;
    
    const res = await deleteBrand(id);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Đã xóa thương hiệu.");
      loadBrands();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Vui lòng nhập tên thương hiệu.");
    
    setIsSubmitting(true);
    let res;
    
    if (isEditing && currentId) {
      if (!form.slug.trim()) return toast.error("Vui lòng nhập slug.");
      res = await updateBrand(currentId, form);
    } else {
      res = await createBrand(form);
    }
    
    setIsSubmitting(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(isEditing ? "Đã cập nhật thương hiệu." : "Đã tạo thương hiệu.");
      setIsModalOpen(false);
      loadBrands();
    }
  };

  // Generate slug automatically when creating
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm(prev => {
      const updates: any = { name: val };
      if (!isEditing) {
        updates.slug = val.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
          .replace(/[đĐ]/g, 'd')
          .replace(/[\s_]+/g, '-')
          .replace(/[^\w-]/g, '');
      }
      return { ...prev, ...updates };
    });
  };

  const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thương hiệu</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý các thương hiệu sản phẩm (Hãng sản xuất)</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm thương hiệu
        </button>
      </div>

      {/* Filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm thương hiệu..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a303d] focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100 shadow-sm text-sm"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>)}
        </div>
      ) : filteredBrands.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Chưa có thương hiệu nào"
          description="Bắt đầu bằng cách tạo thương hiệu đầu tiên cho cửa hàng của bạn."
          action={{ label: "Thêm thương hiệu", onClick: handleOpenAdd }}
        />
      ) : (
        <div className="bg-white dark:bg-[#2a303d] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-5 py-3 font-semibold text-gray-600 dark:text-gray-300">Thương hiệu</th>
                <th className="px-5 py-3 font-semibold text-gray-600 dark:text-gray-300 w-32 text-center">Sản phẩm</th>
                <th className="px-5 py-3 font-semibold text-gray-600 dark:text-gray-300 w-32 text-center">Trạng thái</th>
                <th className="px-5 py-3 font-semibold text-gray-600 dark:text-gray-300 w-24 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {filteredBrands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white flex items-center justify-center overflow-hidden shrink-0">
                        {brand.logo ? (
                          <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg uppercase">
                            {brand.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{brand.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 font-mono text-[10px]">{brand.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium text-xs">
                      {brand._count?.products || 0}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {brand.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Hiển thị
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        <X className="w-3 h-3" /> Đang ẩn
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenEdit(brand)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(brand.id, brand._count?.products || 0)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e2330] rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {isEditing ? "Cập nhật Thương hiệu" : "Thêm Thương hiệu mới"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Logo Selection */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div 
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors overflow-hidden group relative"
                >
                  {form.logo ? (
                    <>
                      <img src={form.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Edit className="w-5 h-5 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-[10px] text-gray-500 font-medium">Chọn Logo</span>
                    </>
                  )}
                </div>
                {form.logo && (
                  <button type="button" onClick={() => setForm({...form, logo: ""})} className="mt-2 text-xs text-red-500 hover:underline">Xóa logo</button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên thương hiệu *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={handleNameChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#151923] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="VD: HP, Canon, Brother..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug (Đường dẫn)</label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({...form, slug: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#151923] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  placeholder="hp-vietnam"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#151923] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Thông tin về hãng..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({...form, isActive: e.target.checked})}
                  className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Hiển thị thương hiệu này
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100 dark:border-gray-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Tạo thương hiệu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => {
          setForm({ ...form, logo: url });
          setIsMediaPickerOpen(false);
        }}
        title="Chọn Logo Thương hiệu"
      />
    </div>
  );
}
