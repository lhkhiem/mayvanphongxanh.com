"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Upload, Search, Grid3x3, List, Check, ImageIcon, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Asset {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
}

export function MediaPickerModal({ isOpen, onClose, onSelect, title = "Chọn ảnh từ thư viện" }: MediaPickerModalProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
      setSelectedId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(fetchAssets, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : "";
      const res = await fetch(`/api/media${params}`);
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else setAssets(data.data || []);
    } catch {
      toast.error("Không thể tải danh sách ảnh");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      fileArray.forEach((f) => formData.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || data.error) toast.error(data.error || "Upload thất bại");
      else {
        toast.success(`Đã upload ${data.data.length} file`);
        await fetchAssets();
        // Auto-select the first uploaded file
        if (data.data.length === 1) setSelectedId(data.data[0].id);
      }
    } catch { toast.error("Lỗi kết nối"); } finally { setUploading(false); }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragActive(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragActive(false); }, []);
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragActive(false);
    if (e.dataTransfer.files?.length > 0) handleFileUpload(e.dataTransfer.files);
  }, []);

  const handleConfirm = () => {
    const asset = assets.find((a) => a.id === selectedId);
    if (asset) { onSelect(asset.url); onClose(); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white dark:bg-[#1e2332] rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-gray-700/50 shrink-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên file..."
              className="w-full pl-9 pr-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100"
            />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Đang upload..." : "Upload ảnh"}
          </button>
          <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)} />
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={cn("p-1.5 transition-colors", viewMode === 'grid' ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800")}><Grid3x3 className="h-4 w-4" /></button>
            <button onClick={() => setViewMode('list')} className={cn("p-1.5 transition-colors", viewMode === 'list' ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800")}><List className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {isDragActive && (
            <div className="absolute inset-0 z-10 bg-primary/20 flex items-center justify-center rounded-xl pointer-events-none">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border-2 border-dashed border-primary flex flex-col items-center gap-3">
                <Upload className="h-12 w-12 text-primary" />
                <p className="font-semibold text-gray-900 dark:text-gray-100">Thả ảnh để upload</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : assets.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-full min-h-[200px] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary transition-colors"
            >
              <ImageIcon className="h-10 w-10 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có ảnh nào. Click để upload.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedId(prev => prev === asset.id ? null : asset.id)}
                  className={cn(
                    "group relative rounded-lg overflow-hidden border-2 bg-gray-100 dark:bg-gray-800 cursor-pointer transition-all",
                    selectedId === asset.id
                      ? "border-primary ring-2 ring-primary/30 shadow-md"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                  )}
                >
                  <div className="aspect-square">
                    <img src={asset.url} alt={asset.fileName} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  {selectedId === asset.id && (
                    <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white truncate">{asset.fileName}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedId(prev => prev === asset.id ? null : asset.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                    selectedId === asset.id && "bg-blue-50 dark:bg-blue-900/10"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                    selectedId === asset.id ? "bg-primary border-primary" : "border-gray-300 dark:border-gray-600"
                  )}>
                    {selectedId === asset.id && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0 bg-gray-100 dark:bg-gray-800">
                    <img src={asset.url} alt={asset.fileName} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{asset.fileName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{asset.url}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{formatBytes(asset.sizeBytes)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50 dark:bg-gray-800/30">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedId
              ? <span className="text-primary font-medium">Đã chọn 1 ảnh</span>
              : `${assets.length} ảnh trong thư viện`}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition-colors dark:text-gray-200"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedId}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4" />
              Chọn ảnh này
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
