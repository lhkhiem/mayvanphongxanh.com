"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Save, ArrowLeft, Plus, Trash2, ImageIcon, X,
  GripVertical, Package, Tag, Globe, Settings2
} from "lucide-react";
import Link from "next/link";
import { MediaPickerModal } from "@/components/admin/media-picker-modal";
import { CategoryFilterDropdown } from "@/components/admin/category-filter-dropdown";
import { createProduct, updateProduct, type ProductInput, type ProductVariantInput } from "@/app/(admin)/admin/(dashboard)/products/actions";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────
function generateSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "d")
    .replace(/[^0-9a-z\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function generateSku(name: string, index: number = 0) {
  const base = name
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "")
    .substring(0, 6);
  return `${base}-${String(index + 1).padStart(2, '0')}`;
}

const PRODUCT_TYPES = [
  { value: 'standard', label: 'Tiêu chuẩn (Có nhiều biến thể)' },
  { value: 'pre-packaged', label: 'Trọn gói (Máy + Dịch vụ)' },
  { value: 'custom-build', label: 'Tùy chỉnh (Độ thêm linh kiện)' },
];

const DEFAULT_VARIANT: ProductVariantInput = {
  sku: '', name: '', price: 0, originalPrice: null, stockQuantity: 0, images: [], attributes: {},
};

export type CustomOption = {
  id: string;
  name: string;
  price: number;
};

// ── Main Component ─────────────────────────────────────────────────────────────
export function ProductForm({
  initialData,
  categories,
}: {
  initialData?: any;
  categories: any[];
}) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [tab, setTab] = useState<string>('info');
  const [loading, setLoading] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!isEditing);

  // Form state
  const [form, setForm] = useState<Omit<ProductInput, 'variants' | 'customOptions'>>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    categoryId: initialData?.categoryId || 0,
    brand: initialData?.brand || '',
    images: Array.isArray(initialData?.images) ? initialData.images : [],
    description: initialData?.description || '',
    productType: initialData?.productType || 'standard',
    isActive: initialData?.isActive ?? true,
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    metaKeywords: initialData?.metaKeywords || '',
  });

  const [variants, setVariants] = useState<ProductVariantInput[]>(
    initialData?.variants?.length > 0
      ? initialData.variants.map((v: any) => ({
          id: v.id, sku: v.sku, name: v.name || '', price: v.price,
          originalPrice: v.originalPrice || null, stockQuantity: v.stockQuantity,
          images: Array.isArray(v.images) ? v.images : [], attributes: v.attributes || {},
        }))
      : [{ ...DEFAULT_VARIANT, sku: '' }]
  );

  const [customOptions, setCustomOptions] = useState<CustomOption[]>(
    Array.isArray(initialData?.customOptions) ? initialData.customOptions : []
  );

  // Media picker state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'product' | number>('product'); 

  // Dynamic Tabs Logic
  const isStandard = form.productType === 'standard';
  const isCustomBuild = form.productType === 'custom-build';

  const [hasVariants, setHasVariants] = useState<boolean>(
    isStandard && (variants.length > 1 || (variants.length === 1 && Object.keys(variants[0].attributes || {}).length > 0))
  );

  const TABS = [
    { id: 'info', label: 'Thông tin', icon: Package },
    { id: 'images', label: 'Hình ảnh', icon: ImageIcon },
    ...(isStandard && hasVariants ? [{ id: 'variants', label: 'Biến thể', icon: Tag }] : []),
    ...(isCustomBuild ? [{ id: 'addons', label: 'Tùy chọn (Add-ons)', icon: Settings2 }] : []),
    { id: 'seo', label: 'SEO', icon: Globe },
  ];

  // Auto-switch tab if current tab is hidden
  useEffect(() => {
    if (!TABS.find(t => t.id === tab)) {
      setTab('info');
    }
  }, [form.productType, tab]);

  // Handle Type Switch: Ensure at least 1 variant exists for non-standard or simple product
  useEffect(() => {
    if (!isStandard || (isStandard && !hasVariants)) {
      if (variants.length > 1) {
        setVariants([variants[0]]); // truncate extra variants
      }
    }
  }, [form.productType, hasVariants]);

  // Auto slug
  useEffect(() => {
    if (autoSlug && form.name) {
      setForm((prev) => ({ ...prev, slug: generateSlug(form.name) }));
    }
  }, [form.name, autoSlug]);

  // Auto-generate first variant SKU when name changes
  useEffect(() => {
    if (!isEditing && form.name && variants.length === 1 && !variants[0].sku) {
      setVariants((prev) => [{ ...prev[0], sku: generateSku(form.name, 0) }]);
    }
  }, [form.name]);

  // Handlers
  const openPicker = (target: 'product' | number) => {
    setPickerTarget(target);
    setPickerOpen(true);
  };

  const handlePickerSelect = (url: string) => {
    if (pickerTarget === 'product') {
      setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
    } else {
      setVariants((prev) => prev.map((v, i) => i === pickerTarget ? { ...v, images: [...v.images, url] } : v));
    }
    setPickerOpen(false);
  };

  const removeProductImage = (idx: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const removeVariantImage = (vIdx: number, imgIdx: number) => {
    setVariants((prev) => prev.map((v, i) => i === vIdx ? { ...v, images: v.images.filter((_, j) => j !== imgIdx) } : v));
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, { ...DEFAULT_VARIANT, sku: generateSku(form.name, variants.length) }]);
  };

  const removeVariant = (idx: number) => {
    if (variants.length <= 1) { toast.error("Phải có ít nhất 1 biến thể."); return; }
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateVariant = (idx: number, patch: Partial<ProductVariantInput>) => {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  };

  const addAddon = () => {
    setCustomOptions((prev) => [...prev, { id: crypto.randomUUID(), name: '', price: 0 }]);
  };

  const updateAddon = (idx: number, patch: Partial<CustomOption>) => {
    setCustomOptions((prev) => prev.map((a, i) => i === idx ? { ...a, ...patch } : a));
  };

  const removeAddon = (idx: number) => {
    setCustomOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("Vui lòng nhập tên."); setTab('info'); return; }
    if (!form.slug.trim()) { toast.error("Vui lòng nhập slug."); setTab('info'); return; }
    if (!form.categoryId) { toast.error("Vui lòng chọn danh mục."); setTab('info'); return; }
    
    for (const [i, v] of variants.entries()) {
      if (!v.sku.trim()) { toast.error(`Biến thể #${i + 1} chưa có SKU.`); setTab(isStandard ? 'variants' : 'info'); return; }
      if (v.price <= 0) { toast.error(`Biến thể #${i + 1} phải có giá bán > 0.`); setTab(isStandard ? 'variants' : 'info'); return; }
    }

    if (isCustomBuild) {
      for (const [i, a] of customOptions.entries()) {
        if (!a.name.trim()) { toast.error(`Tùy chọn #${i + 1} chưa có tên.`); setTab('addons'); return; }
      }
    }

    setLoading(true);
    const input: ProductInput = { 
      ...form, 
      variants,
      customOptions: isCustomBuild ? customOptions : undefined
    };

    const res = isEditing ? await updateProduct(initialData.id, input) : await createProduct(input);
    setLoading(false);

    if (res.error) toast.error(res.error);
    else {
      toast.success(isEditing ? "Cập nhật thành công!" : "Tạo thành công!");
      router.push("/admin/products");
    }
  };

  return (
    <>
      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePickerSelect}
        title={pickerTarget === 'product' ? 'Chọn ảnh sản phẩm' : 'Chọn ảnh biến thể'}
      />

      <div className="space-y-5 pb-20">
        {/* ── Page Header ── */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/products" className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {isEditing ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}
              </h1>
              {isEditing && <p className="text-sm text-gray-400 mt-0.5">ID: {initialData.id} · Slug: {initialData.slug}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0", form.isActive ? "bg-primary" : "bg-gray-300 dark:bg-gray-600")}
              >
                <span className={cn("inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform", form.isActive ? "translate-x-4" : "translate-x-0.5")} />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap hidden sm:block">
                {form.isActive ? "Đang bán" : "Tạm ẩn"}
              </span>
            </div>
            <button type="button" onClick={() => router.push("/admin/products")} className="px-3 py-2 rounded-lg border border-gray-300 dark:gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors hidden sm:block">
              Hủy
            </button>
            <button type="button" onClick={handleSubmit} disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50">
              <Save className="h-4 w-4" /> {loading ? "Đang lưu..." : "Lưu sản phẩm"}
            </button>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-1 -mb-px overflow-x-auto no-scrollbar">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  tab === id ? "border-primary text-primary" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300"
                )}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Tab: Thông tin ── */}
        {tab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-100 dark:border-gray-700">Thông tin cơ bản</h2>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Tên sản phẩm <span className="text-red-500">*</span></label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Máy in HP LaserJet Pro" className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug <span className="text-red-500">*</span></label>
                    <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                      <input type="checkbox" checked={autoSlug} onChange={(e) => setAutoSlug(e.target.checked)} className="rounded h-3 w-3 border-gray-300 text-primary" /> Tự động tạo
                    </label>
                  </div>
                  <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} disabled={autoSlug} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-800 shadow-sm font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Mô tả sản phẩm</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={8} placeholder="Mô tả chi tiết tính năng..." className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm resize-none" />
                </div>
              </div>

              {/* Inline Sales Info block (only for non-standard or simple products) */}
              {(!isStandard || (isStandard && !hasVariants)) && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] p-5 shadow-sm space-y-4">
                  <div className="pb-2 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Thông tin bán hàng (Gói cơ bản)</h2>
                    {isCustomBuild && <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded font-medium">Giá Base</span>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">SKU <span className="text-red-500">*</span></label>
                      <input type="text" value={variants[0].sku} onChange={(e) => updateVariant(0, { sku: e.target.value.toUpperCase() })} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Tồn kho</label>
                      <input type="number" min={0} value={variants[0].stockQuantity} onChange={(e) => updateVariant(0, { stockQuantity: parseInt(e.target.value) || 0 })} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Giá bán (đ) <span className="text-red-500">*</span></label>
                      <input type="number" min={0} value={variants[0].price || ''} onChange={(e) => updateVariant(0, { price: parseFloat(e.target.value) || 0 })} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Giá gốc (đ)</label>
                      <input type="number" min={0} value={variants[0].originalPrice || ''} onChange={(e) => updateVariant(0, { originalPrice: parseFloat(e.target.value) || null })} placeholder="Nếu có khuyến mãi" className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-100 dark:border-gray-700">Phân loại</h2>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Danh mục <span className="text-red-500">*</span></label>
                  <CategoryFilterDropdown categories={categories} value={form.categoryId || undefined} onChange={(id) => setForm({ ...form, categoryId: id ?? 0 })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Thương hiệu</label>
                  <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="HP, Canon..." className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Loại sản phẩm</label>
                  <select value={form.productType} onChange={(e) => {
                    const type = e.target.value;
                    setForm({ ...form, productType: type });
                    if (type !== 'standard') setHasVariants(false);
                  }} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a303d] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm">
                    {PRODUCT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  {isStandard && (
                    <label className="flex items-center gap-2 mt-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input type="checkbox" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
                      Sản phẩm có nhiều biến thể (màu sắc, dung lượng...)
                    </label>
                  )}
                  <p className="text-xs text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    {form.productType === 'standard' && 'Hiển thị tab Biến thể để thêm nhiều tùy chọn màu/kích cỡ.'}
                    {form.productType === 'pre-packaged' && 'Bán theo gói 1 giá duy nhất. Không có tab biến thể.'}
                    {form.productType === 'custom-build' && 'Giá Base hiển thị ở đây. Hiển thị tab Tùy chọn để add thêm linh kiện.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Hình ảnh ── */}
        {tab === 'images' && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Ảnh sản phẩm</h2>
                <p className="text-xs text-gray-400 mt-0.5">Ảnh đầu tiên sẽ là ảnh đại diện.</p>
              </div>
              <button type="button" onClick={() => openPicker('product')} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 shadow-sm"><Plus className="h-4 w-4" /> Thêm ảnh</button>
            </div>
            {form.images.length === 0 ? (
              <div onClick={() => openPicker('product')} className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 h-48 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary">
                <ImageIcon className="h-10 w-10 text-gray-400" />
                <p className="text-sm text-gray-500">Click để chọn ảnh từ thư viện</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {form.images.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {idx === 0 && <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary text-white text-[9px] font-bold rounded shadow-sm">Đại diện</div>}
                    <button type="button" onClick={() => removeProductImage(idx)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 shadow"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
                <div onClick={() => openPicker('product')} className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary text-gray-400"><Plus className="h-6 w-6" /></div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Biến thể (Chỉ Tiêu Chuẩn) ── */}
        {tab === 'variants' && isStandard && hasVariants && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Biến thể cố định</h2>
                <p className="text-xs text-gray-400 mt-0.5">Khách hàng chọn 1 trong các biến thể dưới đây.</p>
              </div>
              <button type="button" onClick={addVariant} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 shadow-sm"><Plus className="h-4 w-4" /> Thêm biến thể</button>
            </div>
            {variants.map((v, idx) => (
              <VariantCard
                key={idx}
                variant={v}
                index={idx}
                isOnly={variants.length === 1}
                onUpdate={(patch) => updateVariant(idx, patch)}
                onRemove={() => removeVariant(idx)}
                onPickImage={() => openPicker(idx)}
                onRemoveImage={(imgIdx) => removeVariantImage(idx, imgIdx)}
              />
            ))}
          </div>
        )}

        {/* ── Tab: Tùy chọn Add-ons (Chỉ Tùy Chỉnh) ── */}
        {tab === 'addons' && isCustomBuild && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Linh kiện / Dịch vụ độ thêm</h2>
                <p className="text-xs text-gray-400 mt-0.5">Khách hàng có thể chọn nhiều linh kiện cùng lúc để cộng thêm vào giá Base.</p>
              </div>
              <button type="button" onClick={addAddon} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 shadow-sm"><Plus className="h-4 w-4" /> Thêm Tùy chọn</button>
            </div>
            
            {customOptions.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 py-12 flex flex-col items-center justify-center text-gray-500">
                <Settings2 className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Chưa có tùy chọn nào được cấu hình</p>
              </div>
            ) : (
              <div className="space-y-3">
                {customOptions.map((addon, idx) => (
                  <div key={addon.id} className="flex flex-col sm:flex-row gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] shadow-sm items-center">
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Tên linh kiện/Tùy chọn <span className="text-red-500">*</span></label>
                      <input type="text" value={addon.name} onChange={(e) => updateAddon(idx, { name: e.target.value })} placeholder="VD: Khay giấy phụ 500 tờ" className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="w-full sm:w-48 shrink-0">
                      <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Giá cộng thêm (đ) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">+</span>
                        <input type="number" min={0} value={addon.price || ''} onChange={(e) => updateAddon(idx, { price: parseFloat(e.target.value) || 0 })} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent pl-7 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                    </div>
                    <button type="button" onClick={() => removeAddon(idx)} className="mt-5 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 shrink-0"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: SEO ── */}
        {tab === 'seo' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 pb-2 border-b border-gray-100 dark:border-gray-700">Cài đặt SEO</h2>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">SEO Title</label>
                <input type="text" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} maxLength={60} placeholder={form.name || "Tiêu đề trang"} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Meta Description</label>
                <textarea value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} maxLength={160} rows={4} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm resize-none" />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ── Variant Card ───────────────────────────────────────────────────────────────

function VariantCard({
  variant,
  index,
  isOnly,
  onUpdate,
  onRemove,
  onPickImage,
  onRemoveImage,
}: {
  variant: ProductVariantInput;
  index: number;
  isOnly: boolean;
  onUpdate: (patch: Partial<ProductVariantInput>) => void;
  onRemove: () => void;
  onPickImage: () => void;
  onRemoveImage: (imgIdx: number) => void;
}) {
  const [attrKey, setAttrKey] = useState('');
  const [attrVal, setAttrVal] = useState('');

  const addAttr = () => {
    if (!attrKey.trim()) return;
    onUpdate({ attributes: { ...variant.attributes, [attrKey.trim()]: attrVal.trim() } });
    setAttrKey(''); setAttrVal('');
  };

  const removeAttr = (key: string) => {
    const { [key]: _, ...rest } = variant.attributes;
    onUpdate({ attributes: rest });
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Biến thể #{index + 1}</span>
        </div>
        {!isOnly && (
          <button type="button" onClick={onRemove} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">SKU *</label><input type="text" value={variant.sku} onChange={(e) => onUpdate({ sku: e.target.value.toUpperCase() })} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono" /></div>
          <div><label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Tên phân loại</label><input type="text" value={variant.name} onChange={(e) => onUpdate({ name: e.target.value })} placeholder="VD: Màu Đen" className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Giá bán (đ) *</label><input type="number" min={0} value={variant.price || ''} onChange={(e) => onUpdate({ price: parseFloat(e.target.value) || 0 })} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Giá gốc (đ)</label><input type="number" min={0} value={variant.originalPrice || ''} onChange={(e) => onUpdate({ originalPrice: parseFloat(e.target.value) || null })} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Tồn kho</label>
            <input type="number" min={0} value={variant.stockQuantity} onChange={(e) => onUpdate({ stockQuantity: parseInt(e.target.value) || 0 })} className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        {/* Attributes */}
        <div>
          <label className="block text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">Thuộc tính mở rộng</label>
          <div className="space-y-2">
            {Object.entries(variant.attributes || {}).map(([k, val]) => (
              <div key={k} className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium text-gray-600 dark:text-gray-300">{k}</span>
                <span className="text-gray-400 text-xs">:</span>
                <span className="text-xs text-gray-700 dark:text-gray-200">{val as string}</span>
                <button type="button" onClick={() => removeAttr(k)} className="ml-auto p-1 text-gray-400 hover:text-red-500"><X className="h-3 w-3" /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <input value={attrKey} onChange={(e) => setAttrKey(e.target.value)} placeholder="Thuộc tính (VD: Màu)" className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary" />
              <input value={attrVal} onChange={(e) => setAttrVal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAttr())} placeholder="Giá trị (VD: Đen)" className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary" />
              <button type="button" onClick={addAttr} className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><Plus className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>

        {/* Variant Images */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Ảnh riêng của biến thể (tuỳ chọn)</label>
            <button type="button" onClick={onPickImage} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Thêm ảnh</button>
          </div>
          {variant.images && variant.images.length > 0 ? (
            <div className="flex gap-2 flex-wrap">
              {variant.images.map((url, i) => (
                <div key={i} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => onRemoveImage(i)} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-2.5 w-2.5" /></button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Không có ảnh riêng — sẽ dùng ảnh sản phẩm chính.</p>
          )}
        </div>
      </div>
    </div>
  );
}
