"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Upload, Search, Grid3x3, List, Check, ImageIcon, Copy, Folder, Link as LinkIcon, ChevronRight, ChevronDown, FolderOpen, FolderPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createFolder } from "@/app/(admin)/admin/(dashboard)/media/actions";

interface Asset {
  id: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

interface MediaFolder {
  id: string;
  name: string;
  parentId: string | null;
}

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

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (url: string) => void;
  onSelectMultiple?: (urls: string[]) => void;
  title?: string;
  multiple?: boolean;
}

export function MediaPickerModal({ isOpen, onClose, onSelect, onSelectMultiple, title = "Chọn ảnh từ thư viện", multiple = false }: MediaPickerModalProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [allFolders, setAllFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Folder states
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{id: string, name: string}[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  
  // URL Upload states
  const [isUploadUrlOpen, setIsUploadUrlOpen] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');

  // Create Folder states
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
      setSelectedIds([]);
    }
  }, [isOpen, currentFolderId]);

  useEffect(() => {
    if (isOpen && searchQuery) {
      const timer = setTimeout(fetchAssets, 300);
      return () => clearTimeout(timer);
    } else if (isOpen && !searchQuery) {
      fetchAssets();
    }
  }, [searchQuery]);

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
      const data = await res.json();
      if (!res.ok || data.error) toast.error(data.error || "Upload thất bại");
      else {
        toast.success(`Đã upload ${data.data.length} file`);
        await fetchAssets();
        if (data.data.length === 1 && !multiple) setSelectedIds([data.data[0].id]);
      }
    } catch { toast.error("Lỗi kết nối"); } finally { setUploading(false); }
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
      if (data.error) {
        toast.error(data.error || 'Upload thất bại');
      } else {
        toast.success('Đã upload ảnh thành công');
        setIsUploadUrlOpen(false);
        setUploadUrl('');
        fetchAssets();
      }
    } catch {
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
      fetchAssets();
    }
  };

  const navigateToFolder = (folder: MediaFolder | null) => {
    if (folder === null) {
      setCurrentFolderId(null);
      setFolderPath([]);
    } else {
      setCurrentFolderId(folder.id);
      
      const newPath: {id: string, name: string}[] = [];
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

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white dark:bg-[#1e2332] rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Explorer Layout */}
        <div className="flex flex-1 min-h-0 bg-gray-50/30 dark:bg-[#1e2332]">
          
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0 bg-white dark:bg-[#2a303d] border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden hidden md:flex">
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

              <div className="flex items-center gap-2 shrink-0">
                <div className="relative w-40 sm:w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm file..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-gray-100"
                  />
                </div>

                <button
                  onClick={() => setIsCreateFolderOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
                  title="Tạo thư mục"
                >
                  <FolderPlus className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setIsUploadUrlOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
                  title="Upload từ Link"
                >
                  <LinkIcon className="h-4 w-4" />
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-60"
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">{uploading ? "Đang upload..." : "Upload ảnh"}</span>
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

              {/* Create Folder Dialog */}
              {isCreateFolderOpen && (
                <div className="absolute inset-0 z-20 bg-white/95 dark:bg-gray-900/95 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Tạo thư mục mới
                    </h3>
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={e => setNewFolderName(e.target.value)}
                      placeholder="Tên thư mục..."
                      autoFocus
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white mb-4 focus:ring-2 focus:ring-primary outline-none"
                      onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setIsCreateFolderOpen(false)}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleCreateFolder}
                        disabled={!newFolderName.trim()}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                      >
                        Tạo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload URL Dialog overlay within modal */}
              {isUploadUrlOpen && (
                <div className="absolute inset-0 z-20 bg-white/95 dark:bg-gray-900/95 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Upload ảnh từ đường dẫn (URL)
                    </h3>
                    <input
                      type="url"
                      value={uploadUrl}
                      onChange={e => setUploadUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      autoFocus
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-900 dark:text-white mb-4 focus:ring-2 focus:ring-primary outline-none"
                      onKeyDown={e => e.key === 'Enter' && handleUrlUpload()}
                    />
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

              {loading ? (
                <div className={cn(
                  viewMode === 'grid'
                    ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
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
                  className="h-full min-h-[200px] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary transition-colors bg-gray-50/50 dark:bg-gray-800/30"
                >
                  <ImageIcon className="h-10 w-10 text-gray-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Thư mục trống. Click để upload.</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {/* Folders */}
                  {folders.map(folder => (
                    <div
                      key={folder.id}
                      onClick={() => navigateToFolder(folder)}
                      className="group relative rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 cursor-pointer hover:border-primary hover:bg-white transition-all flex flex-col items-center justify-center gap-2 aspect-square"
                    >
                      <Folder className="h-10 w-10 text-primary/70 group-hover:text-primary transition-colors" />
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-200 text-center line-clamp-2 w-full">{folder.name}</p>
                    </div>
                  ))}
                  
                  {/* Assets */}
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => {
                        if (multiple) {
                          setSelectedIds(prev => prev.includes(asset.id) ? prev.filter(id => id !== asset.id) : [...prev, asset.id])
                        } else {
                          setSelectedIds(prev => prev[0] === asset.id ? [] : [asset.id])
                        }
                      }}
                      className={cn(
                        "group relative rounded-lg overflow-hidden border-2 bg-gray-100 dark:bg-gray-800 cursor-pointer transition-all",
                        selectedIds.includes(asset.id)
                          ? "border-primary ring-2 ring-primary/30 shadow-md"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                      )}
                    >
                      <div className="aspect-square bg-white dark:bg-gray-900 flex items-center justify-center p-1">
                        <img src={asset.url} alt={asset.fileName} className="max-w-full max-h-full object-contain" loading="lazy" />
                      </div>
                      {selectedIds.includes(asset.id) && (
                        <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white truncate drop-shadow">{asset.fileName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Folders List */}
                  {folders.map(folder => (
                    <div
                      key={folder.id}
                      onClick={() => navigateToFolder(folder)}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="w-5 h-5 rounded border-2 border-transparent" />
                      <div className="w-10 h-10 flex items-center justify-center shrink-0">
                        <Folder className="h-5 w-5 text-primary/70" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{folder.name}</p>
                      </div>
                    </div>
                  ))}

                  {/* Assets List */}
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => {
                        if (multiple) {
                          setSelectedIds(prev => prev.includes(asset.id) ? prev.filter(id => id !== asset.id) : [...prev, asset.id])
                        } else {
                          setSelectedIds(prev => prev[0] === asset.id ? [] : [asset.id])
                        }
                      }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                        selectedIds.includes(asset.id) && "bg-blue-50 dark:bg-blue-900/10"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                        selectedIds.includes(asset.id) ? "bg-primary border-primary" : "border-gray-300 dark:border-gray-600"
                      )}>
                        {selectedIds.includes(asset.id) && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0 bg-white dark:bg-gray-900 flex items-center justify-center p-1">
                        <img src={asset.url} alt={asset.fileName} className="max-w-full max-h-full object-contain" loading="lazy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{asset.fileName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{asset.url}</p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0 hidden sm:inline-block">{formatBytes(asset.sizeBytes)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50 dark:bg-gray-800/30">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedIds.length > 0
              ? <span className="text-primary font-medium">Đã chọn {selectedIds.length} ảnh</span>
              : `${assets.length} ảnh trong thư mục`}
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
              disabled={selectedIds.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4" />
              {multiple && selectedIds.length > 1 ? `Chọn ${selectedIds.length} ảnh này` : 'Chọn ảnh này'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
