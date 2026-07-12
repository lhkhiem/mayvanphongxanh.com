"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { MediaPickerInput } from "@/components/admin/media-picker-input";
import {
  getAboutSettings,
  saveAboutHero,
  saveAboutStats,
  saveAboutProcess,
  saveAboutBrands,
  saveAboutValues,
  saveAboutCta,
} from "./actions";
import {
  DEFAULT_ABOUT_HERO,
  DEFAULT_ABOUT_STATS,
  DEFAULT_ABOUT_PROCESS,
  DEFAULT_ABOUT_BRANDS,
  DEFAULT_ABOUT_VALUES,
  DEFAULT_ABOUT_CTA,
} from "./constants";
import {
  LayoutTemplate,
  BarChart3,
  GitBranch,
  Building2,
  Trophy,
  Megaphone,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";

// ── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "hero", label: "Hero", icon: LayoutTemplate },
  { id: "stats", label: "Thống kê", icon: BarChart3 },
  { id: "process", label: "Quy trình", icon: GitBranch },
  { id: "brands", label: "Thương hiệu", icon: Building2 },
  { id: "values", label: "Năng lực", icon: Trophy },
  { id: "cta", label: "CTA", icon: Megaphone },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── Helper: input/textarea class ─────────────────────────────────────────────

const inputCls =
  "w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e2330] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors";

const labelCls = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1";

const sectionTitle = (text: string) => (
  <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-200 dark:border-gray-700">
    <span className="text-base font-bold text-gray-900 dark:text-gray-100">{text}</span>
  </div>
);

// ── Save button component ─────────────────────────────────────────────────────

function SaveButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-60 transition-colors"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {loading ? "Đang lưu..." : "Lưu thay đổi"}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Hero Tab
// ══════════════════════════════════════════════════════════════════════════════

function HeroTab({ initial }: { initial: typeof DEFAULT_ABOUT_HERO }) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof DEFAULT_ABOUT_HERO, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setLoading(true);
    const res = await saveAboutHero(form);
    setLoading(false);
    res.error ? toast.error(res.error) : toast.success("Đã lưu Hero Section");
  };

  return (
    <div className="space-y-6">
      {sectionTitle("Hero Section")}

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Badge / Nhãn nhỏ</label>
          <input className={inputCls} value={form.badge} onChange={(e) => set("badge", e.target.value)} placeholder="Về Máy Văn Phòng Xanh" />
        </div>
        <div>
          <label className={labelCls}>Tiêu đề chính</label>
          <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Đối tác công nghệ" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Phần chữ highlight (màu xanh)</label>
        <input className={inputCls} value={form.titleHighlight} onChange={(e) => set("titleHighlight", e.target.value)} placeholder="cho doanh nghiệp hiện đại" />
      </div>

      <div>
        <label className={labelCls}>Mô tả</label>
        <textarea rows={3} className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Button 1 (Primary)</p>
          <div>
            <label className={labelCls}>Label</label>
            <input className={inputCls} value={form.btn1Label} onChange={(e) => set("btn1Label", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>URL</label>
            <input className={inputCls} value={form.btn1Url} onChange={(e) => set("btn1Url", e.target.value)} />
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Button 2 (Secondary)</p>
          <div>
            <label className={labelCls}>Label</label>
            <input className={inputCls} value={form.btn2Label} onChange={(e) => set("btn2Label", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>URL</label>
            <input className={inputCls} value={form.btn2Url} onChange={(e) => set("btn2Url", e.target.value)} />
          </div>
        </div>
      </div>

      <MediaPickerInput
        label="Ảnh nền Hero"
        value={form.bgImage}
        onChange={(url) => set("bgImage", url)}
      />

      <div className="flex justify-end pt-2">
        <SaveButton onClick={handleSave} loading={loading} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Stats Tab
// ══════════════════════════════════════════════════════════════════════════════

const STAT_ICONS = ["CalendarDays", "Users", "Award", "MapPin", "Star", "Briefcase", "Globe2", "Zap"];

function StatsTab({ initial }: { initial: typeof DEFAULT_ABOUT_STATS }) {
  const [items, setItems] = useState(initial);
  const [loading, setLoading] = useState(false);

  const update = (idx: number, key: "value" | "label", val: string) =>
    setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));

  const handleSave = async () => {
    setLoading(true);
    const res = await saveAboutStats(items);
    setLoading(false);
    res.error ? toast.error(res.error) : toast.success("Đã lưu số liệu thống kê");
  };

  return (
    <div className="space-y-6">
      {sectionTitle("Số liệu thống kê (4 ô)")}
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3 bg-gray-50 dark:bg-[#1e2330]">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ô số {idx + 1} · Icon: {item.icon}</p>
            <div>
              <label className={labelCls}>Giá trị (vd: 10+, 5000+)</label>
              <input className={inputCls} value={item.value} onChange={(e) => update(idx, "value", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Nhãn</label>
              <input className={inputCls} value={item.label} onChange={(e) => update(idx, "label", e.target.value)} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-2">
        <SaveButton onClick={handleSave} loading={loading} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Process Tab
// ══════════════════════════════════════════════════════════════════════════════

function ProcessTab({ initial }: { initial: typeof DEFAULT_ABOUT_PROCESS }) {
  const [items, setItems] = useState(initial);
  const [loading, setLoading] = useState(false);

  const update = (idx: number, key: "title" | "desc", val: string) =>
    setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));

  const handleSave = async () => {
    setLoading(true);
    const res = await saveAboutProcess(items);
    setLoading(false);
    res.error ? toast.error(res.error) : toast.success("Đã lưu quy trình triển khai");
  };

  return (
    <div className="space-y-6">
      {sectionTitle("Quy trình triển khai (6 bước)")}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3 bg-gray-50 dark:bg-[#1e2330]">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bước {idx + 1} · Icon: {item.icon}</p>
            <div>
              <label className={labelCls}>Tên bước</label>
              <input className={inputCls} value={item.title} onChange={(e) => update(idx, "title", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Mô tả ngắn</label>
              <input className={inputCls} value={item.desc} onChange={(e) => update(idx, "desc", e.target.value)} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-2">
        <SaveButton onClick={handleSave} loading={loading} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Brands Tab
// ══════════════════════════════════════════════════════════════════════════════

function BrandsTab({ initial }: { initial: string[] }) {
  const [brands, setBrands] = useState(initial);
  const [newBrand, setNewBrand] = useState("");
  const [loading, setLoading] = useState(false);

  const addBrand = () => {
    const trimmed = newBrand.trim();
    if (!trimmed) return;
    if (brands.includes(trimmed)) { toast.error("Thương hiệu đã tồn tại"); return; }
    setBrands((arr) => [...arr, trimmed]);
    setNewBrand("");
  };

  const removeBrand = (idx: number) => setBrands((arr) => arr.filter((_, i) => i !== idx));

  const updateBrand = (idx: number, val: string) =>
    setBrands((arr) => arr.map((b, i) => (i === idx ? val : b)));

  const handleSave = async () => {
    setLoading(true);
    const res = await saveAboutBrands(brands.filter(Boolean));
    setLoading(false);
    res.error ? toast.error(res.error) : toast.success("Đã lưu danh sách thương hiệu");
  };

  return (
    <div className="space-y-6">
      {sectionTitle("Đối tác & Thương hiệu")}

      {/* Add new */}
      <div className="flex gap-2">
        <input
          className={inputCls + " flex-1"}
          placeholder="Tên thương hiệu mới (vd: Samsung)"
          value={newBrand}
          onChange={(e) => setNewBrand(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBrand())}
        />
        <button
          onClick={addBrand}
          className="inline-flex items-center gap-1.5 rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
        >
          <Plus className="h-4 w-4" /> Thêm
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {brands.map((brand, idx) => (
          <div key={idx} className="flex items-center gap-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1e2330] px-3 py-2">
            <span className="w-6 text-xs text-gray-400 text-center font-bold">{idx + 1}</span>
            <input
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 outline-none"
              value={brand}
              onChange={(e) => updateBrand(idx, e.target.value)}
            />
            <button
              onClick={() => removeBrand(idx)}
              className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <SaveButton onClick={handleSave} loading={loading} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Values Tab
// ══════════════════════════════════════════════════════════════════════════════

function ValuesTab({ initial }: { initial: typeof DEFAULT_ABOUT_VALUES }) {
  const [items, setItems] = useState(initial);
  const [loading, setLoading] = useState(false);

  const update = (idx: number, key: "title" | "desc", val: string) =>
    setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));

  const handleSave = async () => {
    setLoading(true);
    const res = await saveAboutValues(items);
    setLoading(false);
    res.error ? toast.error(res.error) : toast.success("Đã lưu năng lực cạnh tranh");
  };

  return (
    <div className="space-y-6">
      {sectionTitle("Năng lực cạnh tranh (4 ô)")}
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3 bg-gray-50 dark:bg-[#1e2330]">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ô {idx + 1} · Icon: {item.icon}</p>
            <div>
              <label className={labelCls}>Tiêu đề</label>
              <input className={inputCls} value={item.title} onChange={(e) => update(idx, "title", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Mô tả</label>
              <textarea rows={2} className={inputCls} value={item.desc} onChange={(e) => update(idx, "desc", e.target.value)} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-2">
        <SaveButton onClick={handleSave} loading={loading} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CTA Tab
// ══════════════════════════════════════════════════════════════════════════════

function CtaTab({ initial }: { initial: typeof DEFAULT_ABOUT_CTA }) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof DEFAULT_ABOUT_CTA, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setLoading(true);
    const res = await saveAboutCta(form);
    setLoading(false);
    res.error ? toast.error(res.error) : toast.success("Đã lưu CTA Section");
  };

  return (
    <div className="space-y-6">
      {sectionTitle("CTA (Call to Action)")}

      <div>
        <label className={labelCls}>Tiêu đề CTA</label>
        <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Mô tả</label>
        <textarea rows={2} className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Label nút bấm</label>
          <input className={inputCls} value={form.btnLabel} onChange={(e) => set("btnLabel", e.target.value)} placeholder="Gọi ngay: 1900 1234" />
        </div>
        <div>
          <label className={labelCls}>URL nút bấm</label>
          <input className={inputCls} value={form.btnUrl} onChange={(e) => set("btnUrl", e.target.value)} placeholder="/lien-he" />
        </div>
      </div>

      <MediaPickerInput
        label="Ảnh nền CTA"
        value={form.bgImage}
        onChange={(url) => set("bgImage", url)}
      />

      <div className="flex justify-end pt-2">
        <SaveButton onClick={handleSave} loading={loading} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Page
// ══════════════════════════════════════════════════════════════════════════════

export default function AboutAdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>("hero");
  const [settings, setSettings] = useState<Awaited<ReturnType<typeof getAboutSettings>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAboutSettings().then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Trang Giới Thiệu
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Quản lý toàn bộ nội dung hiển thị trên trang <span className="font-mono text-primary">/gioi-thieu</span>
          </p>
        </div>
        <a
          href="/gioi-thieu"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Xem trang
        </a>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-1 overflow-x-auto pb-px">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] p-6 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Đang tải dữ liệu...</p>
          </div>
        ) : settings ? (
          <>
            {activeTab === "hero" && <HeroTab initial={settings.hero} />}
            {activeTab === "stats" && <StatsTab initial={settings.stats} />}
            {activeTab === "process" && <ProcessTab initial={settings.process} />}
            {activeTab === "brands" && <BrandsTab initial={settings.brands} />}
            {activeTab === "values" && <ValuesTab initial={settings.values} />}
            {activeTab === "cta" && <CtaTab initial={settings.cta} />}
          </>
        ) : (
          <p className="text-center text-sm text-red-500 py-8">Lỗi tải dữ liệu. Vui lòng thử lại.</p>
        )}
      </div>
    </div>
  );
}
