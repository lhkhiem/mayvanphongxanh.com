"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/admin/empty-state";
import {
  Plus, Edit, Trash2, Save, Image as ImageIcon,
  Check, X, Eye, EyeOff, LayoutTemplate, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getSliders, createSlider, updateSlider, deleteSlider, toggleSliderActive,
  getBanners, createBanner, updateBanner, deleteBanner, toggleBannerActive,
  type SliderFormData, type BannerFormData
} from "./actions";
import { MediaPickerInput } from "@/components/admin/media-picker-input";

type Slider = SliderFormData & { id: number };
type Banner = BannerFormData & { id: number };

const DEFAULT_SLIDER: SliderFormData = {
  image: "",
  badge: "",
  title: "",
  description: "",
  btnPrimaryLabel: "",
  btnPrimaryUrl: "",
  btnSecondaryLabel: "",
  btnSecondaryUrl: "",
  order: 0,
  isActive: true,
};

const DEFAULT_BANNER: BannerFormData = {
  title: "",
  subTitle: "",
  icon: "",
  url: "",
  image: "",
  order: 0,
  isActive: true,
};

export default function SlidersPage() {
  const [activeTab, setActiveTab] = useState<"sliders" | "banners">("sliders");

  // Slider State
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [showSliderForm, setShowSliderForm] = useState(false);
  const [editingSliderId, setEditingSliderId] = useState<number | null>(null);
  const [sliderForm, setSliderForm] = useState<SliderFormData>(DEFAULT_SLIDER);

  // Banner State
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
  const [bannerForm, setBannerForm] = useState<BannerFormData>(DEFAULT_BANNER);

  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [resSliders, resBanners] = await Promise.all([getSliders(), getBanners()]);
    if (resSliders.error) toast.error(resSliders.error);
    else setSliders(resSliders.data as Slider[]);

    if (resBanners.error) toast.error(resBanners.error);
    else setBanners(resBanners.data as Banner[]);
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Slider Handlers ──
  const handleSaveSlider = async () => {
    if (!sliderForm.image) return toast.error("Vui lòng chọn hình ảnh Slider!");
    if (editingSliderId) {
      const res = await updateSlider(editingSliderId, sliderForm);
      if (res.error) toast.error(res.error);
      else { toast.success("Đã cập nhật Slider"); setShowSliderForm(false); fetchData(); }
    } else {
      const res = await createSlider(sliderForm);
      if (res.error) toast.error(res.error);
      else { toast.success("Đã tạo Slider"); setShowSliderForm(false); fetchData(); }
    }
  };

  const handleEditSlider = (slider: Slider) => {
    setSliderForm({ ...slider });
    setEditingSliderId(slider.id);
    setShowSliderForm(true);
  };

  const handleDeleteSlider = async (slider: Slider) => {
    if (!confirm("Bạn có chắc chắn muốn xóa Slider này?")) return;
    const res = await deleteSlider(slider.id);
    if (res.error) toast.error(res.error);
    else { toast.success("Đã xóa Slider"); fetchData(); }
  };

  // ── Banner Handlers ──
  const handleSaveBanner = async () => {
    if (!bannerForm.title) return toast.error("Vui lòng nhập tiêu đề Banner!");
    if (editingBannerId) {
      const res = await updateBanner(editingBannerId, bannerForm);
      if (res.error) toast.error(res.error);
      else { toast.success("Đã cập nhật Banner"); setShowBannerForm(false); fetchData(); }
    } else {
      const res = await createBanner(bannerForm);
      if (res.error) toast.error(res.error);
      else { toast.success("Đã tạo Banner"); setShowBannerForm(false); fetchData(); }
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setBannerForm({ ...banner });
    setEditingBannerId(banner.id);
    setShowBannerForm(true);
  };

  const handleDeleteBanner = async (banner: Banner) => {
    if (!confirm("Bạn có chắc chắn muốn xóa Banner này?")) return;
    const res = await deleteBanner(banner.id);
    if (res.error) toast.error(res.error);
    else { toast.success("Đã xóa Banner"); fetchData(); }
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
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Quản lý Sliders & Banners
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Tùy chỉnh giao diện trang chủ website
          </p>
        </div>
      </div>

      <div className="flex space-x-1 rounded-xl bg-gray-200/60 dark:bg-gray-800/60 p-1 w-full max-w-md">
        <button
          onClick={() => setActiveTab("sliders")}
          className={cn(
            "w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center gap-2 transition-all",
            activeTab === "sliders"
              ? "bg-white dark:bg-gray-700 text-primary shadow"
              : "text-gray-600 dark:text-gray-400 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-gray-200"
          )}
        >
          <LayoutTemplate className="w-4 h-4" /> Slider chính
        </button>
        <button
          onClick={() => setActiveTab("banners")}
          className={cn(
            "w-full rounded-lg py-2.5 text-sm font-medium leading-5 flex items-center justify-center gap-2 transition-all",
            activeTab === "banners"
              ? "bg-white dark:bg-gray-700 text-primary shadow"
              : "text-gray-600 dark:text-gray-400 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-gray-200"
          )}
        >
          <Layers className="w-4 h-4" /> Sub Banners (3 block)
        </button>
      </div>

      {/* ── Sliders Tab ── */}
      {activeTab === "sliders" && (
        <div className="space-y-4">
          {!showSliderForm && (
            <div className="flex justify-end">
              <button
                onClick={() => { setSliderForm(DEFAULT_SLIDER); setEditingSliderId(null); setShowSliderForm(true); }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" /> Thêm Slider
              </button>
            </div>
          )}

          {showSliderForm && (
            <div className="bg-white dark:bg-[#2a303d] rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                {editingSliderId ? "Chỉnh sửa Slider" : "Thêm Slider mới"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <MediaPickerInput
                    label="Hình ảnh Slider *"
                    value={sliderForm.image}
                    onChange={(url) => setSliderForm({ ...sliderForm, image: url })}
                  />
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Badge (Nhãn phụ)</label>
                    <input type="text" value={sliderForm.badge || ""} onChange={e => setSliderForm({ ...sliderForm, badge: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm" placeholder="VD: ⭐ Giải pháp #1" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Tiêu đề chính (\n để xuống dòng)</label>
                    <textarea value={sliderForm.title || ""} onChange={e => setSliderForm({ ...sliderForm, title: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm" rows={2} placeholder="Tiêu đề chính..." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
                    <textarea value={sliderForm.description || ""} onChange={e => setSliderForm({ ...sliderForm, description: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm" rows={3} placeholder="Mô tả chi tiết..." />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nút chính (Label)</label>
                      <input type="text" value={sliderForm.btnPrimaryLabel || ""} onChange={e => setSliderForm({ ...sliderForm, btnPrimaryLabel: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm" placeholder="VD: Xem Sản phẩm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Link Nút chính</label>
                      <input type="text" value={sliderForm.btnPrimaryUrl || ""} onChange={e => setSliderForm({ ...sliderForm, btnPrimaryUrl: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm" placeholder="VD: /products" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Nút phụ (Label)</label>
                      <input type="text" value={sliderForm.btnSecondaryLabel || ""} onChange={e => setSliderForm({ ...sliderForm, btnSecondaryLabel: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm" placeholder="VD: Nhận Tư vấn" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Link Nút phụ</label>
                      <input type="text" value={sliderForm.btnSecondaryUrl || ""} onChange={e => setSliderForm({ ...sliderForm, btnSecondaryUrl: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm" placeholder="VD: /contact" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Thứ tự (Order)</label>
                      <input type="number" value={sliderForm.order} onChange={e => setSliderForm({ ...sliderForm, order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Trạng thái</label>
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input type="checkbox" checked={sliderForm.isActive} onChange={e => setSliderForm({ ...sliderForm, isActive: e.target.checked })} className="rounded border-gray-300 text-primary focus:ring-primary w-5 h-5" />
                        <span className="text-sm">Đang hiển thị</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-5">
                <button onClick={() => setShowSliderForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  Hủy
                </button>
                <button onClick={handleSaveSlider} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 shadow-sm">
                  <Save className="h-4 w-4" /> Lưu Slider
                </button>
              </div>
            </div>
          )}

          {!showSliderForm && (
            <div className="bg-white dark:bg-[#2a303d] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Hình ảnh</th>
                    <th className="px-4 py-3 font-medium">Tiêu đề</th>
                    <th className="px-4 py-3 font-medium">Thứ tự</th>
                    <th className="px-4 py-3 font-medium text-center">Trạng thái</th>
                    <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {sliders.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">Chưa có Slider nào.</td></tr>
                  ) : sliders.map((slider) => (
                    <tr key={slider.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="w-24 h-12 bg-gray-100 rounded overflow-hidden">
                          <img src={slider.image} alt="Slider" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{slider.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{slider.badge}</p>
                      </td>
                      <td className="px-4 py-3">{slider.order}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={async () => {
                            await toggleSliderActive(slider.id, slider.isActive);
                            fetchData();
                          }}
                          className={cn(
                            "inline-flex items-center justify-center p-1.5 rounded-full transition-colors",
                            slider.isActive ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          )}
                          title={slider.isActive ? "Ẩn slider" : "Hiện slider"}
                        >
                          {slider.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEditSlider(slider)} className="p-1.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 hover:text-primary transition-colors"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDeleteSlider(slider)} className="p-1.5 rounded bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Banners Tab ── */}
      {activeTab === "banners" && (
        <div className="space-y-4">
          {!showBannerForm && (
            <div className="flex justify-end">
              <button
                onClick={() => { setBannerForm(DEFAULT_BANNER); setEditingBannerId(null); setShowBannerForm(true); }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" /> Thêm Sub Banner
              </button>
            </div>
          )}

          {showBannerForm && (
            <div className="bg-white dark:bg-[#2a303d] rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm max-w-3xl">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                {editingBannerId ? "Chỉnh sửa Sub Banner" : "Thêm Sub Banner mới"}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Tiêu đề *</label>
                  <input type="text" value={bannerForm.title} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm" placeholder="VD: Laptop Doanh Nghiệp" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Mô tả phụ</label>
                  <input type="text" value={bannerForm.subTitle || ""} onChange={e => setBannerForm({ ...bannerForm, subTitle: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm" placeholder="VD: Gaming - Đồ họa" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Icon (Emoji hoặc Ảnh/Link)</label>
                  <input type="text" value={bannerForm.icon || ""} onChange={e => setBannerForm({ ...bannerForm, icon: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm" placeholder="VD: 💻 hoặc URL ảnh" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Đường dẫn (URL)</label>
                  <input type="text" value={bannerForm.url || ""} onChange={e => setBannerForm({ ...bannerForm, url: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm" placeholder="VD: /san-pham" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <MediaPickerInput
                    label="Ảnh nền"
                    value={bannerForm.image || ""}
                    onChange={(url) => setBannerForm({ ...bannerForm, image: url })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Thứ tự</label>
                  <input type="number" value={bannerForm.order} onChange={e => setBannerForm({ ...bannerForm, order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Trạng thái</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" checked={bannerForm.isActive} onChange={e => setBannerForm({ ...bannerForm, isActive: e.target.checked })} className="rounded border-gray-300 text-primary focus:ring-primary w-5 h-5" />
                    <span className="text-sm">Đang hiển thị</span>
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-5">
                <button onClick={() => setShowBannerForm(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  Hủy
                </button>
                <button onClick={handleSaveBanner} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 shadow-sm">
                  <Save className="h-4 w-4" /> Lưu Banner
                </button>
              </div>
            </div>
          )}

          {!showBannerForm && (
            <div className="bg-white dark:bg-[#2a303d] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden max-w-4xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-medium w-16 text-center">Icon</th>
                    <th className="px-4 py-3 font-medium">Tiêu đề / Sub</th>
                    <th className="px-4 py-3 font-medium text-center">Ảnh nền</th>
                    <th className="px-4 py-3 font-medium text-center">Trạng thái</th>
                    <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {banners.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">Chưa có Banner nào.</td></tr>
                  ) : banners.map((banner) => (
                    <tr key={banner.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 text-center text-2xl">{banner.icon}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{banner.title}</p>
                        <p className="text-xs text-gray-500">{banner.subTitle}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {banner.image ? (
                          <div className="w-16 h-8 rounded bg-gray-100 overflow-hidden mx-auto">
                            <img src={banner.image} alt="Nền" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Trống</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={async () => {
                            await toggleBannerActive(banner.id, banner.isActive);
                            fetchData();
                          }}
                          className={cn(
                            "inline-flex items-center justify-center p-1.5 rounded-full transition-colors",
                            banner.isActive ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          )}
                        >
                          {banner.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEditBanner(banner)} className="p-1.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 hover:text-primary transition-colors"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDeleteBanner(banner)} className="p-1.5 rounded bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
