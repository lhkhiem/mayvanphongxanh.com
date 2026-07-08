"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  Upload, Search, Grid3x3, List, Trash2, Eye, Copy,
  X, Image as ImageIcon, Check, File, CheckSquare,
  Folder, FolderPlus, Link as LinkIcon, ChevronRight, ChevronDown, Edit2, FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAssets, deleteAsset, deleteMultipleAssets, getFolders, getAllFolders, createFolder, deleteFolder, renameFolder } from "./actions";

interface Asset {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
}

interface MediaFolder {
  id: string;
  name: string;
  parentId: string | null;
}

type ViewMode = 'grid' | 'list';

function formatBytes(bytes: number): string {
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

export default function MediaPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [allFolders, setAllFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Folder states
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{id: string, name: string}[]>([]);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isUploadUrlOpen, setIsUploadUrlOpen] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [editingFolder, setEditingFolder] = useState<MediaFolder | null>(null);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, [searchQuery, currentFolderId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsRes, foldersRes, allFoldersRes] = await Promise.all([
        getAssets(searchQuery || undefined, currentFolderId),
        !searchQuery ? getFolders(currentFolderId) : Promise.resolve({ data: [] }),
        getAllFolders()
      ]);
      
      if (assetsRes.error) toast.error(assetsRes.error);
      else setAssets(assetsRes.data as Asset[]);

      if (foldersRes.error) toast.error(foldersRes.error);
      else setFolders((foldersRes.data || []) as MediaFolder[]);

      if (allFoldersRes.error) toast.error(allFoldersRes.error);
      else setAllFolders((allFoldersRes.data || []) as MediaFolder[]);
    } catch (e) {
      toast.error('Lỗi khi tải dữ liệu');
    }
    setLoading(false);
  };

  const folderTree = useMemo(() => buildTree(allFolders, null), [allFolders]);

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      fileArray.forEach((file) => formData.append('files', file));
      if (currentFolderId) {
        formData.append('folderId', currentFolderId);
      }

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok || data.error) {
        toast.error(data.error || 'Upload thất bại');
      } else {
        toast.success(`Đã upload ${data.data.length} file thành công`);
        fetchData();
      }
    } catch (err) {
      toast.error('Lỗi kết nối. Không thể upload file.');
    } finally {
      setUploading(false);
    }
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
      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || 'Upload thất bại');
      } else {
        toast.success('Đã tải ảnh từ URL thành công');
        setIsUploadUrlOpen(false);
        setUploadUrl('');
        fetchData();
      }
    } catch (err) {
      toast.error('Lỗi kết nối. Không thể upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const res = await createFolder(newFolderName, currentFolderId);
    if (res.error) toast.error(res.error);
    else {
      toast.success('Đã tạo thư mục');
      setIsCreateFolderOpen(false);
      setNewFolderName('');
      fetchData();
    }
  };

  const handleRenameFolder = async () => {
    if (!editingFolder || !newFolderName.trim()) return;
    const res = await renameFolder(editingFolder.id, newFolderName);
    if (res.error) toast.error(res.error);
    else {
      toast.success('Đã đổi tên thư mục');
      setEditingFolder(null);
      setNewFolderName('');
      fetchData();
    }
  };

  const handleDeleteFolder = async (folder: MediaFolder) => {
    if (!confirm(`Xóa thư mục "${folder.name}"? Ảnh bên trong sẽ bị đưa ra ngoài.`)) return;
    const res = await deleteFolder(folder.id);
    if (res.error) toast.error(res.error);
    else {
      toast.success('Đã xóa thư mục');
      if (currentFolderId === folder.id) navigateToFolder(null);
      fetchData();
    }
  };

  const navigateToFolder = (folder: MediaFolder | null) => {
    if (folder === null) {
      setCurrentFolderId(null);
      setFolderPath([]);
    } else {
      setCurrentFolderId(folder.id);
      
      // Build folder path from allFolders
      const newPath = [];
      let current: MediaFolder | undefined = folder;
      while (current) {
        newPath.unshift({ id: current.id, name: current.name });
        current = allFolders.find(f => f.id === current?.parentId);
      }
      setFolderPath(newPath);

      // Auto expand when navigated
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
  }, [currentFolderId]);

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
    else { toast.success('Đã xóa ảnh'); fetchData(); }
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
      fetchData();
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === assets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(assets.map(a => a.id)));
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
            <div className="w-4.5" /> // spacing
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

  return (
    <div
      className="space-y-4 h-[calc(100vh-6rem)] flex flex-col"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Thư viện Media
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {assets.length} file {folders.length > 0 && `• ${folders.length} thư mục`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
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
            onClick={() => setIsUploadUrlOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium bg-white dark:bg-[#2a303d] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            <LinkIcon className="h-4 w-4" />
            Upload từ Link
          </button>

          <button
            onClick={() => { setIsCreateFolderOpen(true); setNewFolderName(''); }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium bg-white dark:bg-[#2a303d] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            <FolderPlus className="h-4 w-4" />
            Tạo thư mục
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Đang tải...' : 'Upload ảnh'}
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

      {/* Explorer Layout */}
      <div className="flex gap-4 flex-1 min-h-0">
        
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 bg-white dark:bg-[#2a303d] border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col overflow-hidden shadow-sm hidden md:flex">
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
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#2a303d] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          
          {/* Toolbar */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-50/50 dark:bg-gray-800/30 shrink-0">
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

            <div className="flex items-center gap-3 shrink-0">
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm file..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100"
                />
              </div>

              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-900">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn("p-1.5 transition-colors", viewMode === 'grid' ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800")}
                ><Grid3x3 className="h-4 w-4" /></button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn("p-1.5 transition-colors", viewMode === 'list' ? "bg-primary text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800")}
                ><List className="h-4 w-4" /></button>
              </div>
            </div>
          </div>

          {/* Files Area */}
          <div className="flex-1 overflow-y-auto p-4 relative">
            {isDragActive && (
              <div className="absolute inset-0 z-10 bg-primary/20 backdrop-blur-sm flex items-center justify-center rounded-b-lg pointer-events-none">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 shadow-2xl border-2 border-dashed border-primary flex flex-col items-center gap-3">
                  <Upload className="h-12 w-12 text-primary" />
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Thả ảnh vào thư mục này</p>
                </div>
              </div>
            )}

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
            ) : (folders.length === 0 && assets.length === 0) ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-full min-h-[300px] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary dark:hover:border-primary transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Thư mục trống</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Click để upload hoặc kéo-thả ảnh vào đây</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Folders in main pane */}
                {folders.map(folder => (
                  <div
                    key={folder.id}
                    onClick={() => navigateToFolder(folder)}
                    className="group relative rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 cursor-pointer hover:border-primary dark:hover:border-primary hover:bg-white dark:hover:bg-gray-800 transition-all flex flex-col items-center justify-center gap-2 aspect-square shadow-sm"
                  >
                    <Folder className="h-12 w-12 text-primary/80 group-hover:text-primary transition-colors" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 text-center line-clamp-2 w-full px-2">{folder.name}</p>
                    
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingFolder(folder); setNewFolderName(folder.name); }}
                        className="p-1.5 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-600"
                        title="Đổi tên"
                      ><Edit2 className="h-3.5 w-3.5" /></button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); }}
                        className="p-1.5 bg-white dark:bg-red-900/30 rounded-md hover:bg-red-50 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 shadow-sm border border-gray-200 dark:border-gray-600"
                        title="Xóa"
                      ><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}

                {/* Assets in main pane */}
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
                    <div className="aspect-square bg-white dark:bg-gray-900 flex items-center justify-center p-2">
                      <img
                        src={asset.url}
                        alt={asset.fileName}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                      />
                    </div>

                    {/* Selected check */}
                    {selectedIds.has(asset.id) && (
                      <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow z-10">
                        <Check className="h-3 w-3" />
                      </div>
                    )}

                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
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
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[11px] font-medium text-white truncate drop-shadow-md">{asset.fileName}</p>
                      <p className="text-[10px] text-gray-300 drop-shadow-md">{formatBytes(asset.sizeBytes)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List view
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80">
                      <th className="w-10 px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === assets.length && assets.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Tên</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 hidden md:table-cell">Kích thước</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 hidden lg:table-cell">Ngày</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700 dark:text-gray-300">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {/* Folders in list view */}
                    {folders.map(folder => (
                      <tr key={folder.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer" onClick={() => navigateToFolder(folder)}>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Folder className="h-5 w-5 text-primary/70" />
                            <span className="font-medium text-gray-900 dark:text-gray-100">{folder.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell">-</td>
                        <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">-</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingFolder(folder); setNewFolderName(folder.name); }}
                              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                            ><Edit2 className="h-4 w-4" /></button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); }}
                              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                            ><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Assets in list view */}
                    {assets.map((asset) => (
                      <tr
                        key={asset.id}
                        className={cn(
                          "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer",
                          selectedIds.has(asset.id) && "bg-blue-50 dark:bg-blue-900/10"
                        )}
                        onClick={() => handleSelectToggle(asset.id)}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(asset.id)}
                            onChange={() => handleSelectToggle(asset.id)}
                            onClick={e => e.stopPropagation()}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-900 flex items-center justify-center p-1">
                              <img src={asset.url} alt={asset.fileName} className="max-w-full max-h-full object-contain" loading="lazy" />
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
                              onClick={(e) => { e.stopPropagation(); setPreviewAsset(asset); }}
                              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                              title="Xem"
                            ><Eye className="h-4 w-4" /></button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCopyUrl(asset.url); }}
                              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                              title="Copy URL"
                            ><Copy className="h-4 w-4" /></button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteOne(asset); }}
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
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewAsset && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewAsset(null)}
        >
          <div
            className="bg-white dark:bg-[#2a303d] rounded-xl shadow-2xl overflow-hidden max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{previewAsset.fileName}</h3>
              <button
                onClick={() => setPreviewAsset(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              ><X className="h-5 w-5" /></button>
            </div>
            <div className="bg-gray-100/50 dark:bg-gray-900 flex items-center justify-center p-6 relative group">
              <img
                src={previewAsset.url}
                alt={previewAsset.fileName}
                className="max-w-full max-h-[65vh] object-contain drop-shadow-xl"
              />
            </div>
            <div className="p-4 flex items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/50">
              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <p>Kích thước: <span className="font-medium text-gray-700 dark:text-gray-200">{formatBytes(previewAsset.sizeBytes)}</span></p>
                <p className="font-mono text-xs break-all text-gray-600 dark:text-gray-300">{previewAsset.url}</p>
              </div>
              <button
                onClick={() => { handleCopyUrl(previewAsset.url); }}
                className="inline-flex items-center gap-2 flex-shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Copy className="h-4 w-4" />
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Folder Dialog */}
      {(isCreateFolderOpen || editingFolder) && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingFolder ? 'Đổi tên thư mục' : 'Tạo thư mục mới'}
            </h3>
            <input
              type="text"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              placeholder="Tên thư mục..."
              autoFocus
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white mb-6 focus:ring-2 focus:ring-primary outline-none"
              onKeyDown={e => e.key === 'Enter' && (editingFolder ? handleRenameFolder() : handleCreateFolder())}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setIsCreateFolderOpen(false); setEditingFolder(null); }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={editingFolder ? handleRenameFolder : handleCreateFolder}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90"
              >
                {editingFolder ? 'Lưu' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload URL Dialog */}
      {isUploadUrlOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Upload ảnh từ đường dẫn (URL)
            </h3>
            <input
              type="url"
              value={uploadUrl}
              onChange={e => setUploadUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              autoFocus
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white mb-2 focus:ring-2 focus:ring-primary outline-none"
              onKeyDown={e => e.key === 'Enter' && handleUrlUpload()}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Đảm bảo đường dẫn hợp lệ và là một hình ảnh.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsUploadUrlOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={handleUrlUpload}
                disabled={uploading || !uploadUrl}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {uploading ? 'Đang tải...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
