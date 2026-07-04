"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  Upload, Search, Grid3x3, List, Trash2, Eye, Copy,
  X, Image as ImageIcon, Check, File, CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAssets, deleteAsset, deleteMultipleAssets } from "./actions";

interface Asset {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
}

type ViewMode = 'grid' | 'list';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAssets();
  }, [searchQuery]);

  const fetchAssets = async () => {
    setLoading(true);
    const res = await getAssets(searchQuery || undefined);
    if (res.error) {
      toast.error(res.error);
    } else if (res.data) {
      setAssets(res.data as Asset[]);
    }
    setLoading(false);
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      fileArray.forEach((file) => formData.append('files', file));

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error || 'Upload thất bại');
      } else {
        toast.success(`Đã upload ${data.data.length} file thành công`);
        fetchAssets();
      }
    } catch (err) {
      toast.error('Lỗi kết nối. Không thể upload file.');
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragActive(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragActive(false);
  }, []);
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragActive(false);
    if (e.dataTransfer.files?.length > 0) handleFileUpload(e.dataTransfer.files);
  }, []);

  const handleSelectToggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleCopyUrl = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Đã copy URL!');
  };

  const handleDeleteOne = async (asset: Asset) => {
    if (!confirm(`Xóa ảnh "${asset.fileName}"?`)) return;
    const res = await deleteAsset(asset.id, asset.url);
    if (res.error) toast.error(res.error);
    else { toast.success('Đã xóa ảnh'); fetchAssets(); }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Xóa ${selectedIds.size} ảnh đã chọn?`)) return;
    const ids = Array.from(selectedIds);
    const urls = assets.filter(a => ids.includes(a.id)).map(a => a.url);
    const res = await deleteMultipleAssets(ids, urls);
    if (res.error) toast.error(res.error);
    else {
      toast.success(`Đã xóa ${ids.length} ảnh`);
      setSelectedIds(new Set());
      fetchAssets();
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === assets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(assets.map(a => a.id)));
    }
  };

  return (
    <div
      className="space-y-5"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Thư viện Media
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {assets.length} file • Quản lý ảnh cho bài viết và sản phẩm
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Xóa {selectedIds.size} ảnh
            </button>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Đang upload...' : 'Upload ảnh'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên file..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100 shadow-sm"
          />
        </div>

        <button
          onClick={handleSelectAll}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          title={selectedIds.size === assets.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
        >
          <CheckSquare className="h-4 w-4" />
          {selectedIds.size === assets.length && assets.length > 0 ? 'Bỏ chọn' : 'Chọn tất cả'}
        </button>

        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={cn("p-2 transition-colors", viewMode === 'grid' ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800")}
            title="Lưới"
          ><Grid3x3 className="h-4 w-4" /></button>
          <button
            onClick={() => setViewMode('list')}
            className={cn("p-2 transition-colors", viewMode === 'list' ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800")}
            title="Danh sách"
          ><List className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Drop zone overlay */}
      {isDragActive && (
        <div className="fixed inset-0 z-50 bg-primary/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-2xl border-2 border-dashed border-primary flex flex-col items-center gap-4">
            <Upload className="h-16 w-16 text-primary" />
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">Thả ảnh để upload</p>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className={cn(
          viewMode === 'grid'
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            : "space-y-2"
        )}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={cn(
              "bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse",
              viewMode === 'grid' ? "aspect-square" : "h-16"
            )} />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a303d] p-16 text-center cursor-pointer hover:border-primary dark:hover:border-primary transition-colors shadow-sm"
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Chưa có ảnh nào</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Click để upload hoặc kéo-thả ảnh vào đây</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className={cn(
                "group relative rounded-lg overflow-hidden border-2 bg-gray-100 dark:bg-gray-800 cursor-pointer transition-all",
                selectedIds.has(asset.id)
                  ? "border-primary shadow-md"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
              )}
              onClick={() => handleSelectToggle(asset.id)}
            >
              <div className="aspect-square">
                <img
                  src={asset.url}
                  alt={asset.fileName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Selected check */}
              {selectedIds.has(asset.id) && (
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow">
                  <Check className="h-3 w-3" />
                </div>
              )}

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setPreviewAsset(asset); }}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                  title="Xem"
                ><Eye className="h-4 w-4" /></button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopyUrl(asset.url); }}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                  title="Copy URL"
                ><Copy className="h-4 w-4" /></button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteOne(asset); }}
                  className="p-1.5 rounded-lg bg-red-500/70 hover:bg-red-500 text-white transition-colors"
                  title="Xóa"
                ><Trash2 className="h-4 w-4" /></button>
              </div>

              {/* File name tooltip */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-white truncate">{asset.fileName}</p>
                <p className="text-[9px] text-white/70">{formatBytes(asset.sizeBytes)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List view
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a303d] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="w-10 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === assets.length && assets.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">File</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 hidden md:table-cell">Kích thước</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 hidden lg:table-cell">Ngày upload</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {assets.map((asset) => (
                <tr
                  key={asset.id}
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                    selectedIds.has(asset.id) && "bg-blue-50 dark:bg-blue-900/10"
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(asset.id)}
                      onChange={() => handleSelectToggle(asset.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                        <img src={asset.url} alt={asset.fileName} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{asset.fileName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{asset.url}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell">
                    {formatBytes(asset.sizeBytes)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                    {new Date(asset.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setPreviewAsset(asset)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                        title="Xem"
                      ><Eye className="h-4 w-4" /></button>
                      <button
                        onClick={() => handleCopyUrl(asset.url)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                        title="Copy URL"
                      ><Copy className="h-4 w-4" /></button>
                      <button
                        onClick={() => handleDeleteOne(asset)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                        title="Xóa"
                      ><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      {previewAsset && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewAsset(null)}
        >
          <div
            className="bg-white dark:bg-[#2a303d] rounded-xl shadow-2xl overflow-hidden max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{previewAsset.fileName}</h3>
              <button
                onClick={() => setPreviewAsset(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              ><X className="h-5 w-5" /></button>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-4">
              <img
                src={previewAsset.url}
                alt={previewAsset.fileName}
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            </div>
            <div className="p-4 flex items-center justify-between gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <p>Kích thước: <span className="font-medium text-gray-700 dark:text-gray-200">{formatBytes(previewAsset.sizeBytes)}</span></p>
                <p className="font-mono text-xs break-all text-gray-600 dark:text-gray-300">{previewAsset.url}</p>
              </div>
              <button
                onClick={() => { handleCopyUrl(previewAsset.url); }}
                className="inline-flex items-center gap-2 flex-shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Copy className="h-4 w-4" />
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
