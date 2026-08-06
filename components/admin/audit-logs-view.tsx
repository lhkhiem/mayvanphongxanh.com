"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  Shield, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  X,
  FileSpreadsheet,
  LogIn,
  LogOut,
  Plus,
  Edit,
  Sliders,
  Database
} from "lucide-react";
import { toast } from "sonner";
import { getAuditLogs, getAuditLogStats, clearOldAuditLogs } from "@/app/(admin)/admin/(dashboard)/logs/actions";

interface AuditLogItem {
  id: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userRole: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  metadata: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date | string;
}

interface LogStats {
  totalLogs: number;
  todayLogs: number;
  todayLogins: number;
  todayModifications: number;
  todayFailures: number;
}

const ACTION_OPTIONS = [
  { value: "all", label: "Tất cả hành động" },
  { value: "CREATE", label: "Tạo mới (CREATE)" },
  { value: "UPDATE", label: "Cập nhật (UPDATE)" },
  { value: "DELETE", label: "Xóa (DELETE)" },
  { value: "LOGIN", label: "Đăng nhập (LOGIN)" },
  { value: "LOGIN_FAILED", label: "Đăng nhập thất bại" },
  { value: "STATUS_CHANGE", label: "Đổi trạng thái" },
  { value: "CONFIG_CHANGE", label: "Thay đổi cài đặt" },
];

const ENTITY_OPTIONS = [
  { value: "all", label: "Tất cả đối tượng" },
  { value: "AUTH", label: "Xác thực (AUTH)" },
  { value: "PRODUCT", label: "Sản phẩm (PRODUCT)" },
  { value: "CATEGORY", label: "Danh mục (CATEGORY)" },
  { value: "ORDER", label: "Đơn hàng (ORDER)" },
  { value: "USER", label: "Người dùng (USER)" },
  { value: "ROLE", label: "Vai trò (ROLE)" },
  { value: "INVENTORY", label: "Kho hàng (INVENTORY)" },
  { value: "SETTING", label: "Cài đặt (SETTING)" },
  { value: "POST", label: "Bài viết (POST)" },
  { value: "RENTAL", label: "Thuê máy (RENTAL)" },
  { value: "WARRANTY", label: "Bảo hành (WARRANTY)" },
];

export function AuditLogsView() {
  const [isPending, startTransition] = useTransition();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [stats, setStats] = useState<LogStats>({
    totalLogs: 0,
    todayLogs: 0,
    todayLogins: 0,
    todayModifications: 0,
    todayFailures: 0,
  });

  // Filters state
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const [entity, setEntity] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearDays, setClearDays] = useState(30);

  const fetchLogs = () => {
    startTransition(async () => {
      const res = await getAuditLogs({
        search,
        action,
        entity,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        pageSize,
      });

      if (res.error) {
        toast.error(res.error);
      } else if (res.data) {
        setLogs(res.data as any);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }

      const statsRes = await getAuditLogStats();
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    });
  };

  useEffect(() => {
    fetchLogs();
  }, [page, pageSize, action, entity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleResetFilters = () => {
    setSearch("");
    setAction("all");
    setEntity("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
    startTransition(async () => {
      const res = await getAuditLogs({ page: 1, pageSize });
      if (res.data) {
        setLogs(res.data as any);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    });
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }

    const headers = ["ID", "Thời gian", "Người thực hiện", "Email", "Vai trò", "Hành động", "Đối tượng", "Mã đối tượng", "Chi tiết"];
    const rows = logs.map(log => [
      log.id,
      new Date(log.createdAt).toLocaleString("vi-VN"),
      log.userName || "N/A",
      log.userEmail || "N/A",
      log.userRole || "N/A",
      log.action,
      log.entity,
      log.entityId || "",
      `"${(log.details || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã xuất CSV thành công!");
  };

  const handleClearLogs = async () => {
    startTransition(async () => {
      const res = await clearOldAuditLogs(clearDays);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Đã xóa ${res.count} bản ghi log cũ hơn ${clearDays} ngày.`);
        setShowClearModal(false);
        fetchLogs();
      }
    });
  };

  const getActionBadge = (actionStr: string) => {
    switch (actionStr) {
      case "CREATE":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"><Plus className="w-3 h-3" /> TẠO MỚI</span>;
      case "UPDATE":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"><Edit className="w-3 h-3" /> CẬP NHẬT</span>;
      case "DELETE":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"><Trash2 className="w-3 h-3" /> XÓA</span>;
      case "LOGIN":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"><LogIn className="w-3 h-3" /> ĐĂNG NHẬP</span>;
      case "LOGOUT":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"><LogOut className="w-3 h-3" /> ĐĂNG XUẤT</span>;
      case "LOGIN_FAILED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"><AlertCircle className="w-3 h-3" /> THẤT BẠI</span>;
      case "STATUS_CHANGE":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"><Sliders className="w-3 h-3" /> TRẠNG THÁI</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20">{actionStr}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-blue-500" />
            Nhật Ký Hoạt Động Admin
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ghi lại toàn bộ lịch sử thao tác, đăng nhập và thay đổi dữ liệu của người dùng & quản trị viên.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchLogs}
            disabled={isPending}
            className="px-3.5 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin text-blue-500" : ""}`} />
            Làm mới
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            Xuất CSV
          </button>
          <button
            onClick={() => setShowClearModal(true)}
            className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Dọn dẹp log
          </button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLogs.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Tổng số bản ghi log</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayLogs.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Hoạt động trong hôm nay</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
            <LogIn className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayLogins.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Lượt đăng nhập thành công</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
            <Edit className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayModifications.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">Thao tác tạo / sửa / xóa</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo user, email, chi tiết..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Select */}
          <div>
            <select
              value={action}
              onChange={(e) => { setAction(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Entity Select */}
          <div>
            <select
              value={entity}
              onChange={(e) => { setEntity(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ENTITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Từ ngày"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Filter className="w-3.5 h-3.5" />
              Lọc
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
              title="Đặt lại bộ lọc"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3.5">Thời gian</th>
                <th className="px-4 py-3.5">Người thực hiện</th>
                <th className="px-4 py-3.5">Hành động</th>
                <th className="px-4 py-3.5">Đối tượng</th>
                <th className="px-4 py-3.5">Chi tiết thao tác</th>
                <th className="px-4 py-3.5 text-right">Xem thêm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
              {isPending && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Đang tải dữ liệu nhật ký...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Không tìm thấy bản ghi log nào phù hợp.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition-colors">
                    {/* Timestamp */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {new Date(log.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </div>
                      <div>
                        {new Date(log.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </div>
                    </td>

                    {/* User Info */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-xs shrink-0 border border-gray-200 dark:border-gray-600">
                          {(log.userName || log.userEmail || "G").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 dark:text-white text-xs truncate">
                            {log.userName || "Hệ thống / Khách"}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate">
                            {log.userEmail || "N/A"}
                          </div>
                          {log.userRole && (
                            <span className="inline-block text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.2 rounded font-medium">
                              {log.userRole}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Action Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    {/* Entity */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                      <span className="font-mono bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 font-semibold">
                        {log.entity}
                      </span>
                      {log.entityId && (
                        <div className="text-[11px] font-mono text-gray-400 mt-0.5 truncate max-w-[120px]">
                          ID: #{log.entityId.slice(0, 10)}
                        </div>
                      )}
                    </td>

                    {/* Details */}
                    <td className="px-4 py-3.5 text-xs text-gray-800 dark:text-gray-200 max-w-md">
                      <div className="line-clamp-2 leading-relaxed font-medium">
                        {log.details || "Không có chi tiết mô tả"}
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            Hiển thị <span className="font-semibold text-gray-900 dark:text-white">{logs.length}</span> / <span className="font-semibold text-gray-900 dark:text-white">{total}</span> bản ghi
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400">Trang {page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isPending}
              className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isPending}
              className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Chi Tiết Bản Ghi Nhật Ký
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/60 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <div className="text-xs text-gray-400">Thời gian:</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                    {new Date(selectedLog.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Hành động:</div>
                  <div className="mt-0.5">{getActionBadge(selectedLog.action)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Người thực hiện:</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                    {selectedLog.userName || "N/A"} ({selectedLog.userEmail || "Guest"})
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Vai trò:</div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    {selectedLog.userRole || "Guest"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Đối tượng:</div>
                  <div className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                    {selectedLog.entity} {selectedLog.entityId ? `(#${selectedLog.entityId})` : ""}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">IP Address:</div>
                  <div className="font-mono text-gray-700 dark:text-gray-300">
                    {selectedLog.ipAddress || "Local / Middleware"}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                  Mô tả chi tiết:
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium">
                  {selectedLog.details || "Không có mô tả chi tiết."}
                </div>
              </div>

              {selectedLog.metadata && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                    Metadata / Dữ liệu kỹ thuật (JSON):
                  </label>
                  <pre className="p-3 bg-gray-900 text-emerald-400 rounded-lg text-xs font-mono overflow-x-auto max-h-60 border border-gray-700 custom-scrollbar">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium text-sm transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Logs Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              Dọn Dẹp Nhật Ký Hoạt Động Cũ
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Thao tác này sẽ xóa vĩnh viễn các bản ghi nhật ký hoạt động cũ để giải phóng dung lượng cơ sở dữ liệu.
            </p>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                Chọn khoảng thời gian giữ lại log:
              </label>
              <select
                value={clearDays}
                onChange={(e) => setClearDays(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value={30}>Xóa log cũ hơn 30 ngày</option>
                <option value={60}>Xóa log cũ hơn 60 ngày</option>
                <option value={90}>Xóa log cũ hơn 90 ngày</option>
                <option value={180}>Xóa log cũ hơn 180 ngày</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleClearLogs}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
