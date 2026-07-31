"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X, Upload, Search, Grid3x3, List, Check, ImageIcon, Copy, Folder,
  Link as LinkIcon, ChevronRight, ChevronDown, FolderOpen, FolderPlus,
  Camera, Clipboard, Trash2, Eye, Edit2, FolderInput, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  getAssets, deleteAsset, deleteMultipleAssets, getFolders, getAllFolders,
  createFolder, deleteFolder, renameFolder, renameAsset, moveAssets
} from "@/app/(admin)/admin/(dashboard)/media/actions";

interface Asset {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date | string;
}

interface MediaFolder {
  id: string;
  name: string;
  parentId: string | null;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Helper to build tree
const buildTree = (folders: MediaFolder[], parentId: string | null = null): any[] => {
  return folders
    .filter(f => f.parentId === parentId)
    .map(f => ({ ...f, children: buildTree(folders, f.id) }));
};

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (url: string) => void;
  onSelectMultiple?: (urls: string[]) => void;
  title?: string;
  multiple?: boolean;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  onSelectMultiple,
  title = "Chọn ảnh từ thư viện",
  multiple = false
}: MediaPickerModalProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [allFolders, setAllFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Folder states
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string, name: string }[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Modal / Dialog states for Media actions
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [renameFileName, setRenameFileName] = useState('');
  const [isMoveFolderOpen, setIsMoveFolderOpen] = useState(false);

  // Folder dialog states
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<MediaFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');

  // Upload URL state
  const [isUploadUrlOpen, setIsUploadUrlOpen] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
      setSelectedIds([]);
    }
  }, [isOpen, currentFolderId]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(fetchAssets, searchQuery ? 300 : 0);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Tự động lắng nghe Dán ảnh (Ctrl+V / Cmd+V) khi modal đang mở
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            const fileName = `screenshot-${Date.now()}.png`;
            const file = new File([blob], fileName, { type: blob.type || 'image/png' });
            files.push(file);
          }
        }
      }

      if (files.length > 0) {
        e.preventDefault();
        toast.info(`Đang upload ${files.length} ảnh dán từ bộ nhớ tạm (Ctrl+V)...`);
        handleFileUpload(files);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [isOpen, currentFolderId]);

  const handlePasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard?.read) {
        toast.error("Trình duyệt chưa cấp quyền đọc tự động. Hãy bấm Ctrl+V để dán!");
        return;
      }
      const items = await navigator.clipboard.read();
      const files: File[] = [];
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type);
            const file = new File([blob], `clipboard-${Date.now()}.png`, { type });
            files.push(file);
          }
        }
      }
      if (files.length > 0) {
        toast.info(`Đã lấy ${files.length} ảnh từ bộ nhớ tạm!`);
        handleFileUpload(files);
      } else {
        toast.warning("Bộ nhớ tạm chưa có ảnh. Hãy chụp màn hình (PrintScreen / Win+Shift+S) trước!");
      }
    } catch {
      toast.error("Hãy bấm Ctrl + V để dán ảnh màn hình trực tiếp!");
    }
  };

  const handleScreenCapture = async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        toast.error("Trình duyệt không hỗ trợ chụp màn hình!");
        return;
      }
      toast.info("Vui lòng chọn màn hình / cửa sổ cần chụp...");
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "monitor" } as any,
        audio: false,
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      stream.getTracks().forEach((track) => track.stop());

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.png`, { type: "image/png" });
          toast.success("Đã chụp màn hình! Đang tải ảnh lên...");
          handleFileUpload([file]);
        }
      }, "image/png");
    } catch (err: any) {
      if (err.name !== "NotAllowedError") {
        toast.error("Không thể chụp màn hình: " + (err.message || String(err)));
      }
    }
  };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      if (searchQuery) searchParams.append("search", searchQuery);
      if (currentFolderId && !searchQuery) searchParams.append("folderId", currentFolderId);

      const res = await fetch(`/api/media?${searchParams.toString()}`);
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else {
        setAssets(data.data || []);
        setFolders(data.folders || []);
        if (data.allFolders) setAllFolders(data.allFolders || []);
      }
    } catch {
      toast.error("Không thể tải danh sách ảnh");
    } finally {
      setLoading(false);
    }
  };

  const folderTree = useMemo(() => buildTree(allFolders, null), [allFolders]);

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      fileArray.forEach((f) => formData.append("files", f));
      if (currentFolderId) {
        formData.append('folderId', currentFolderId);
      }
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        data = { error: text || `HTTP ${res.status}: Upload thất bại` };
      }
      if (!res.ok || data.error) toast.error(data.error || data.details || "Upload thất bại");
      else {
        toast.success(`Đã upload ${data.data?.length || 1} file`);
        await fetchAssets();
        if (data.data?.length === 1 && !multiple) setSelectedIds([data.data[0].id]);
      }
    } catch (err: any) { toast.error(err?.message || "Lỗi kết nối"); } finally { setUploading(false); }
  };

  const handleUrlUpload = async () => {
    if (!uploadUrl) return;
    setUploading(true);
    try {
      const res = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: uploadUrl, folderId: currentFolderId })
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        data = { error: text || `HTTP ${res.status}: Upload thất bại` };
      }
      if (!res.ok || data.error) {
        toast.error(data.error || data.details || 'Upload thất bại');
      } else {
        toast.success('Đã upload ảnh thành công');
        setIsUploadUrlOpen(false);
        setUploadUrl('');
        fetchAssets();
      }
    } catch (err: any) { toast.error(err?.message || "Lỗi kết nối"); } finally { setUploading(false); }
  };

  // Folder Actions
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const res = await createFolder(newFolderName, currentFolderId);
    if (res.error) toast.error(res.error);
    else {
      toast.success('Đã tạo thư mục');
      setIsCreateFolderOpen(false);
      setNewFolderName('');
      fetchAssets();
    }
  };

  const handleRenameFolder = async () => {
    if (!editingFolder || !newFolderName.trim()) return;
    const res = await renameFolder(editingFolder.id, newFolderName.trim());
    if (res.error) toast.error(res.error);
    else {
      toast.success('Đã đổi tên thư mục');
      setEditingFolder(null);
      setNewFolderName('');
      fetchAssets();
    }
  };

  const handleDeleteFolder = async (folder: MediaFolder) => {
    if (!confirm(`Xóa thư mục "${folder.name}"? Ảnh bên trong sẽ bị đưa ra ngoài.`)) return;
    const res = await deleteFolder(folder.id);
    if (res.error) toast.error(res.error);
    else {
      toast.success('Đã xóa thư mục');
      if (currentFolderId === folder.id) navigateToFolder(null);
      fetchAssets();
    }
  };

  // Asset Actions
  const handleRenameAsset = async () => {
    if (!editingAsset || !renameFileName.trim()) return;
    const res = await renameAsset(editingAsset.id, renameFileName.trim());
    if (res.error) toast.error(res.error);
    else {
      toast.success('Đã đổi tên file thành công');
      if (previewAsset && previewAsset.id === editingAsset.id) {
        setPreviewAsset({ ...previewAsset, fileName: renameFileName.trim() });
      }
      setEditingAsset(null);
      setRenameFileName('');
      fetchAssets();
    }
  };

  const handleDeleteOne = async (asset: Asset) => {
    if (!confirm(`Xóa ảnh "${asset.fileName}"?`)) return;
    const res = await deleteAsset(asset.id, asset.url);
    if (res.error) toast.error(res.error);
    else {
      toast.success('Đã xóa ảnh');
      if (previewAsset?.id === asset.id) setPreviewAsset(null);
      setSelectedIds(prev => prev.filter(id => id !== asset.id));
      fetchAssets();
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Xóa ${selectedIds.length} ảnh đã chọn?`)) return;
    const urls = assets.filter(a => selectedIds.includes(a.id)).map(a => a.url);
    const res = await deleteMultipleAssets(selectedIds, urls);
    if (res.error) toast.error(res.error);
    else {
      toast.success(`Đã xóa ${selectedIds.length} ảnh`);
      setSelectedIds([]);
      fetchAssets();
    }
  };

  const handleMoveAssets = async (targetFolderId: string | null) => {
    const ids = [...selectedIds];
    if (ids.length === 0 && previewAsset) {
      ids.push(previewAsset.id);
    }
    if (ids.length === 0) return;

    const res = await moveAssets(ids, targetFolderId);
    if (res.error) toast.error(res.error);
    else {
      toast.success(`Đã di chuyển ${ids.length} file thành công`);
      setIsMoveFolderOpen(false);
      setSelectedIds([]);
      fetchAssets();
    }
  };

  const handleCompressSingle = async (assetId: string) => {
    setCompressing(true);
    try {
      const res = await fetch('/api/media/compress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || 'Nén ảnh thất bại');
      } else {
        const item = data.data?.results?.[0];
        if (item && item.status === 'success') {
          const oldMb = (item.originalSize / (1024 * 1024)).toFixed(2);
          const newMb = (item.compressedSize / (1024 * 1024)).toFixed(2);
          toast.success(`Đã nén ảnh thành công! Giảm từ ${oldMb} MB xuống ${newMb} MB (-${item.percentSaved}%)`);

          if (previewAsset && previewAsset.id === assetId) {
            setPreviewAsset({
              ...previewAsset,
              url: item.newUrl,
              fileName: item.fileName,
              mimeType: 'image/webp',
              sizeBytes: item.compressedSize,
            });
          }
          fetchAssets();
        } else if (item && item.status === 'skipped') {
          toast.info(item.reason || 'Ảnh đã được tối ưu hóa ở mức tối đa');
        } else {
          toast.error(item?.reason || 'Không thể nén ảnh này');
        }
      }
    } catch (err: any) {
      toast.error('Lỗi khi nén ảnh: ' + (err?.message || String(err)));
    } finally {
      setCompressing(false);
    }
  };

  const handleCompressAll = async () => {
    if (!confirm('Bạn có chắc chắn muốn nén và tối ưu tất cả ảnh trong hệ thống sang chuẩn WebP?')) return;
    setCompressing(true);
    toast.info('Đang tối ưu & nén tất cả ảnh...');
    try {
      const res = await fetch('/api/media/compress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || 'Nén ảnh thất bại');
      } else {
        const summary = data.data?.summary;
        if (summary) {
          const savedMb = (summary.totalSavedBytes / (1024 * 1024)).toFixed(2);
          toast.success(`Đã nén ${summary.processedCount} ảnh! Tiết kiệm ${savedMb} MB (-${summary.totalPercentSaved}%) dung lượng lưu trữ.`);
          fetchAssets();
        }
      }
    } catch (err: any) {
      toast.error('Lỗi khi nén tất cả ảnh: ' + (err?.message || String(err)));
    } finally {
      setCompressing(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Đã copy URL!');
  };

  const navigateToFolder = (folder: MediaFolder | null) => {
    if (folder === null) {
      setCurrentFolderId(null);
      setFolderPath([]);
    } else {
      setCurrentFolderId(folder.id);

      const newPath: { id: string, name: string }[] = [];
      let current: MediaFolder | undefined = folder;
      while (current) {
        newPath.unshift({ id: current.id, name: current.name });
        current = allFolders.find(f => f.id === current?.parentId);
      }
      setFolderPath(newPath);

      setExpandedFolders(prev => {
        const next = new Set(prev);
        next.add(folder.id);
        newPath.forEach(p => next.add(p.id));
        return next;
      });
    }
    setSearchQuery('');
  };

  const toggleFolderExpand = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragActive(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragActive(false); }, []);
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragActive(false);
    if (e.dataTransfer.files?.length > 0) handleFileUpload(e.dataTransfer.files);
  }, [currentFolderId]);

  const handleConfirm = () => {
    if (multiple) {
      const selectedAssets = assets.filter(a => selectedIds.includes(a.id));
      if (onSelectMultiple) {
        onSelectMultiple(selectedAssets.map(a => a.url));
      }
    } else {
      const asset = assets.find((a) => a.id === selectedIds[0]);
      if (asset && onSelect) {
        onSelect(asset.url);
      }
    }
    onClose();
  };

  const handleSelectToggle = (id: string) => {
    if (multiple) {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else {
      setSelectedIds(prev => prev.includes(id) ? [] : [id]);
    }
  };

  const renderTree = (nodes: any[], level: number) => {
    return nodes.map(node => (
      <div key={node.id}>
        <div
          onClick={() => navigateToFolder(node)}
          className={cn(
            "flex items-center gap-1.5 py-1.5 px-2 rounded-md cursor-pointer text-sm transition-colors",
            currentFolderId === node.id ? "bg-primary/10 text-primary font-medium" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {node.children && node.children.length > 0 ? (
            <button onClick={(e) => toggleFolderExpand(node.id, e)} className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500">
              {expandedFolders.has(node.id) ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          ) : (
            <div className="w-4.5" />
          )}
          {currentFolderId === node.id ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
          <span className="truncate">{node.name}</span>
        </div>
        {expandedFolders.has(node.id) && node.children && node.children.length > 0 && (
          <div>{renderTree(node.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div
        className="bg-white dark:bg-[#1e2332] rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{title}</h2>
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setIsMoveFolderOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-md hover:bg-blue-100 transition-colors"
                  title="Di chuyển ảnh đã chọn"
                >
                  <FolderInput className="h-3.5 w-3.5" />
                  <span>Di chuyển ({selectedIds.length})</span>
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="inline-flex items-center gap-1 text-xs font-medium border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-md hover:bg-red-100 transition-colors"
                  title="Xóa ảnh đã chọn"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Xóa ({selectedIds.length})</span>
                </button>
              </div>
            )}
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Explorer Layout */}
        <div className="flex flex-1 min-h-0 bg-gray-50/30 dark:bg-[#1e2332]">

          {/* Sidebar Folder Tree */}
          <div className="w-60 flex-shrink-0 bg-white dark:bg-[#2a303d] border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden hidden md:flex">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50/50 dark:bg-gray-800/30">
              <h3 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Thư mục</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <div
                onClick={() => navigateToFolder(null)}
                className={cn(
                  "flex items-center gap-1.5 py-1.5 px-2 rounded-md cursor-pointer text-sm transition-colors mb-1",
                  currentFolderId === null ? "bg-primary/10 text-primary font-medium" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <div className="w-4.5" />
                {currentFolderId === null ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
                <span>Tất cả ảnh</span>
              </div>
              {renderTree(folderTree, 0)}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#2a303d]">

            {/* Toolbar */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-2.5 justify-between items-center bg-gray-50/50 dark:bg-gray-800/30 shrink-0">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 flex-1 overflow-x-auto whitespace-nowrap hide-scrollbar">
                <button onClick={() => navigateToFolder(null)} className="hover:text-primary transition-colors font-medium">
                  Tất cả ảnh
                </button>
                {folderPath.map((folder, index) => (
                  <div key={folder.id} className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                    <button
                      onClick={() => navigateToFolder(folder as MediaFolder)}
                      className={cn("hover:text-primary transition-colors", index === folderPath.length - 1 ? "font-semibold text-gray-900 dark:text-gray-100" : "")}
                    >
                      {folder.name}
                    </button>
                  </div>
                ))}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                <div className="relative w-36 sm:w-44">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm file..."
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100"
                  />
                </div>

                <button
                  onClick={handleScreenCapture}
                  disabled={uploading}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm inline-flex items-center gap-1.5"
                  title="Chụp màn hình và upload"
                >
                  <Camera className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="hidden lg:inline">Chụp M.Hình</span>
                </button>

                <button
                  onClick={handlePasteFromClipboard}
                  disabled={uploading}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm inline-flex items-center gap-1.5"
                  title="Dán từ bộ nhớ tạm (PrintScreen/Ctrl+V)"
                >
                  <Clipboard className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="hidden lg:inline">Dán Ctrl+V</span>
                </button>

                <button
                  onClick={() => { setIsCreateFolderOpen(true); setNewFolderName(''); }}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm inline-flex items-center gap-1.5"
                  title="Tạo thư mục mới"
                >
                  <FolderPlus className="h-4 w-4 shrink-0" />
                  <span className="hidden xl:inline">Tạo thư mục</span>
                </button>

                <button
                  onClick={() => setIsUploadUrlOpen(true)}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm inline-flex items-center gap-1.5"
                  title="Upload từ Link URL"
                >
                  <LinkIcon className="h-4 w-4 shrink-0" />
                  <span className="hidden xl:inline">Link URL</span>
                </button>

                <button
                  onClick={handleCompressAll}
                  disabled={compressing}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-xs font-medium transition-colors shadow-sm inline-flex items-center gap-1.5 disabled:opacity-50"
                  title="Nén tất cả ảnh WebP"
                >
                  <Zap className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
                  <span className="hidden xl:inline">{compressing ? "Đang nén..." : "Nén tất cả"}</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs sm:text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60"
                >
                  <Upload className="h-4 w-4" />
                  <span>{uploading ? "Đang tải..." : "Upload"}</span>
                </button>
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)} />

                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-900 ml-1">
                  <button onClick={() => setViewMode('grid')} className={cn("p-1.5 transition-colors", viewMode === 'grid' ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800")}><Grid3x3 className="h-4 w-4" /></button>
                  <button onClick={() => setViewMode('list')} className={cn("p-1.5 transition-colors", viewMode === 'list' ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800")}><List className="h-4 w-4" /></button>
                </div>
              </div>
            </div>

            {/* Files Area */}
            <div className="flex-1 overflow-y-auto p-4 relative">
              {isDragActive && (
                <div className="absolute inset-0 z-10 bg-primary/20 backdrop-blur-sm flex items-center justify-center rounded-b-lg pointer-events-none">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-dashed border-primary flex flex-col items-center gap-3">
                    <Upload className="h-12 w-12 text-primary" />
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Thả ảnh vào thư mục này</p>
                  </div>
                </div>
              )}

              {loading ? (
                <div className={cn(
                  viewMode === 'grid'
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
                    : "space-y-2"
                )}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className={cn(
                      "bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse",
                      viewMode === 'grid' ? "aspect-square" : "h-12"
                    )} />
                  ))}
                </div>
              ) : (folders.length === 0 && assets.length === 0) ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="h-full min-h-[220px] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary transition-colors bg-gray-50/50 dark:bg-gray-800/30"
                >
                  <ImageIcon className="h-10 w-10 text-gray-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Thư mục trống. Click để upload hoặc kéo thả ảnh vào đây.</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {/* Folders in Grid */}
                  {folders.map(folder => (
                    <div
                      key={folder.id}
                      onClick={() => navigateToFolder(folder)}
                      className="group relative rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-3 cursor-pointer hover:border-primary hover:bg-white dark:hover:bg-gray-800 transition-all flex flex-col items-center justify-center gap-2 aspect-square shadow-sm"
                    >
                      <Folder className="h-10 w-10 text-primary/80 group-hover:text-primary transition-colors" />
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-200 text-center line-clamp-2 w-full px-1">{folder.name}</p>

                      {/* Hover Folder Actions */}
                      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingFolder(folder); setNewFolderName(folder.name); }}
                          className="p-1 bg-white dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 shadow border border-gray-200 dark:border-gray-600"
                          title="Đổi tên thư mục"
                        ><Edit2 className="h-3 w-3" /></button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); }}
                          className="p-1 bg-white dark:bg-red-900/30 rounded hover:bg-red-50 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 shadow border border-gray-200 dark:border-gray-600"
                          title="Xóa thư mục"
                        ><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}

                  {/* Assets in Grid */}
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => handleSelectToggle(asset.id)}
                      className={cn(
                        "group relative rounded-lg overflow-hidden border-2 bg-gray-100 dark:bg-gray-800 cursor-pointer transition-all aspect-square",
                        selectedIds.includes(asset.id)
                          ? "border-primary ring-2 ring-primary/30 shadow-md"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                      )}
                    >
                      <div className="w-full h-full bg-white dark:bg-gray-900 flex items-center justify-center p-1.5">
                        <img src={asset.url} alt={asset.fileName} className="max-w-full max-h-full object-contain" loading="lazy" />
                      </div>

                      {/* Check badge when selected */}
                      {selectedIds.includes(asset.id) && (
                        <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow z-10">
                          <Check className="h-3 w-3" />
                        </div>
                      )}

                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 z-10 p-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); setPreviewAsset(asset); }}
                          className="p-1.5 rounded-md bg-white/20 hover:bg-white/40 text-white transition-colors"
                          title="Xem chi tiết"
                        ><Eye className="h-3.5 w-3.5" /></button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingAsset(asset); setRenameFileName(asset.fileName); }}
                          className="p-1.5 rounded-md bg-white/20 hover:bg-white/40 text-white transition-colors"
                          title="Đổi tên file"
                        ><Edit2 className="h-3.5 w-3.5" /></button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCopyUrl(asset.url); }}
                          className="p-1.5 rounded-md bg-white/20 hover:bg-white/40 text-white transition-colors"
                          title="Copy URL"
                        ><Copy className="h-3.5 w-3.5" /></button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteOne(asset); }}
                          className="p-1.5 rounded-md bg-red-500/80 hover:bg-red-600 text-white transition-colors"
                          title="Xóa ảnh"
                        ><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>

                      {/* File name footer */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0">
                        <p className="text-[10px] font-medium text-white truncate drop-shadow">{asset.fileName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80">
                        <th className="w-10 px-3 py-2 text-left">
                          {multiple && (
                            <input
                              type="checkbox"
                              checked={selectedIds.length === assets.length && assets.length > 0}
                              onChange={() => {
                                if (selectedIds.length === assets.length) setSelectedIds([]);
                                else setSelectedIds(assets.map(a => a.id));
                              }}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          )}
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Tên</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300 hidden md:table-cell">Kích thước</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-700 dark:text-gray-300">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {/* Folders List */}
                      {folders.map(folder => (
                        <tr key={folder.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer" onClick={() => navigateToFolder(folder)}>
                          <td className="px-3 py-2"></td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2.5">
                              <Folder className="h-5 w-5 text-primary/70 shrink-0" />
                              <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{folder.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-gray-500 hidden md:table-cell">-</td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingFolder(folder); setNewFolderName(folder.name); }}
                                className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                                title="Đổi tên thư mục"
                              ><Edit2 className="h-3.5 w-3.5" /></button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); }}
                                className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                                title="Xóa thư mục"
                              ><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Assets List */}
                      {assets.map((asset) => (
                        <tr
                          key={asset.id}
                          className={cn(
                            "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer",
                            selectedIds.includes(asset.id) && "bg-blue-50 dark:bg-blue-900/10"
                          )}
                          onClick={() => handleSelectToggle(asset.id)}
                        >
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(asset.id)}
                              onChange={() => handleSelectToggle(asset.id)}
                              onClick={e => e.stopPropagation()}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0 bg-white dark:bg-gray-900 flex items-center justify-center p-0.5">
                                <img src={asset.url} alt={asset.fileName} className="max-w-full max-h-full object-contain" loading="lazy" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px] sm:max-w-[300px]">{asset.fileName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px] sm:max-w-[300px]">{asset.url}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-gray-500 dark:text-gray-400 hidden md:table-cell text-xs">
                            {formatBytes(asset.sizeBytes)}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); setPreviewAsset(asset); }}
                                className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                                title="Xem chi tiết"
                              ><Eye className="h-3.5 w-3.5" /></button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingAsset(asset); setRenameFileName(asset.fileName); }}
                                className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                                title="Đổi tên file"
                              ><Edit2 className="h-3.5 w-3.5" /></button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleCopyUrl(asset.url); }}
                                className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                                title="Copy URL"
                              ><Copy className="h-3.5 w-3.5" /></button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteOne(asset); }}
                                className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                                title="Xóa"
                              ><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50 dark:bg-gray-800/30">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {selectedIds.length > 0
              ? <span className="text-primary font-medium">Đã chọn {selectedIds.length} ảnh</span>
              : `${assets.length} ảnh trong thư mục`}
          </p>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs sm:text-sm font-medium transition-colors dark:text-gray-200"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-white text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4" />
              {multiple && selectedIds.length > 1 ? `Chọn ${selectedIds.length} ảnh này` : 'Chọn ảnh này'}
            </button>
          </div>
        </div>

        {/* ── Sub-Modals & Dialogs ── */}

        {/* Preview Asset Modal */}
        {previewAsset && (
          <div
            className="fixed inset-0 z-[130] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setPreviewAsset(null)}
          >
            <div
              className="bg-white dark:bg-[#2a303d] rounded-xl shadow-2xl overflow-hidden max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 truncate">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base">{previewAsset.fileName}</h3>
                  <button
                    onClick={() => { setEditingAsset(previewAsset); setRenameFileName(previewAsset.fileName); }}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-primary transition-colors"
                    title="Đổi tên file"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => setPreviewAsset(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                ><X className="h-5 w-5" /></button>
              </div>

              <div className="bg-gray-100/50 dark:bg-gray-900 flex items-center justify-center p-6 relative group">
                <img
                  src={previewAsset.url}
                  alt={previewAsset.fileName}
                  className="max-w-full max-h-[55vh] object-contain drop-shadow-xl"
                />
              </div>

              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 dark:bg-gray-800/50">
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                  <p>Kích thước: <span className="font-medium text-gray-700 dark:text-gray-200">{formatBytes(previewAsset.sizeBytes)}</span></p>
                  <p className="font-mono text-[11px] break-all text-gray-600 dark:text-gray-300">{previewAsset.url}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {!previewAsset.mimeType?.includes('svg') && (
                    <button
                      onClick={() => handleCompressSingle(previewAsset.id)}
                      disabled={compressing}
                      className="inline-flex items-center gap-1 rounded-lg bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 px-3 py-1.5 text-xs font-medium text-white transition-colors shadow-sm disabled:opacity-50"
                      title="Nén WebP"
                    >
                      <Zap className="h-3.5 w-3.5 fill-white" />
                      {compressing ? "Đang nén..." : "Nén WebP"}
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedIds([previewAsset.id]); setIsMoveFolderOpen(true); }}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    <FolderInput className="h-3.5 w-3.5" />
                    Di chuyển
                  </button>
                  <button
                    onClick={() => handleCopyUrl(previewAsset.url)}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create / Edit Folder Dialog */}
        {(isCreateFolderOpen || editingFolder) && (
          <div className="fixed inset-0 z-[140] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                {editingFolder ? 'Đổi tên thư mục' : 'Tạo thư mục mới'}
              </h3>
              <input
                type="text"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                placeholder="Tên thư mục..."
                autoFocus
                className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-sm text-gray-900 dark:text-white mb-4 focus:ring-2 focus:ring-primary outline-none"
                onKeyDown={e => e.key === 'Enter' && (editingFolder ? handleRenameFolder() : handleCreateFolder())}
              />
              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => { setIsCreateFolderOpen(false); setEditingFolder(null); }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  onClick={editingFolder ? handleRenameFolder : handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {editingFolder ? 'Lưu' : 'Tạo mới'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload URL Dialog */}
        {isUploadUrlOpen && (
          <div className="fixed inset-0 z-[140] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                Upload ảnh từ đường dẫn (URL)
              </h3>
              <input
                type="url"
                value={uploadUrl}
                onChange={e => setUploadUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                autoFocus
                className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-sm text-gray-900 dark:text-white mb-2 focus:ring-2 focus:ring-primary outline-none"
                onKeyDown={e => e.key === 'Enter' && handleUrlUpload()}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Nhập đường dẫn trực tiếp tới hình ảnh hợp lệ.</p>
              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => setIsUploadUrlOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUrlUpload}
                  disabled={uploading || !uploadUrl}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {uploading ? 'Đang tải...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rename Asset Dialog */}
        {editingAsset && (
          <div className="fixed inset-0 z-[140] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-5 border border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                Đổi tên file
              </h3>
              <input
                type="text"
                value={renameFileName}
                onChange={e => setRenameFileName(e.target.value)}
                placeholder="Tên file mới..."
                autoFocus
                className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-sm text-gray-900 dark:text-white mb-4 focus:ring-2 focus:ring-primary outline-none"
                onKeyDown={e => e.key === 'Enter' && handleRenameAsset()}
              />
              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => setEditingAsset(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  onClick={handleRenameAsset}
                  disabled={!renameFileName.trim()}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Move Assets Dialog */}
        {isMoveFolderOpen && (
          <div className="fixed inset-0 z-[140] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-5 border border-gray-200 dark:border-gray-700 flex flex-col max-h-[75vh]">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                Di chuyển file vào thư mục
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Chọn thư mục đích cho {selectedIds.length || 1} file:
              </p>
              <div className="flex-1 overflow-y-auto space-y-1 mb-4 border border-gray-200 dark:border-gray-700 rounded-lg p-2 max-h-56">
                <div
                  onClick={() => handleMoveAssets(null)}
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-xs text-gray-800 dark:text-gray-200 transition-colors"
                >
                  <FolderOpen className="h-4 w-4 text-primary" />
                  <span className="font-medium">— Thư mục gốc (Tất cả ảnh) —</span>
                </div>
                {allFolders.map(f => (
                  <div
                    key={f.id}
                    onClick={() => handleMoveAssets(f.id)}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-xs text-gray-800 dark:text-gray-200 transition-colors border-t border-gray-100 dark:border-gray-700/50"
                  >
                    <Folder className="h-4 w-4 text-primary/80" />
                    <span className="truncate">{f.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2.5 shrink-0">
                <button
                  onClick={() => setIsMoveFolderOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
