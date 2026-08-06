import { Metadata } from "next";
import { AuditLogsView } from "@/components/admin/audit-logs-view";

export const metadata: Metadata = {
  title: "Nhật Ký Hoạt Động | MVPX Admin",
  description: "Quản lý và truy vết nhật ký thao tác người dùng & hệ thống",
};

export default function AuditLogsPage() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <AuditLogsView />
    </div>
  );
}
