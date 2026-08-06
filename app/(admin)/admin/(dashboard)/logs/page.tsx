import { Metadata } from "next";
import { AuditLogsView } from "@/components/admin/audit-logs-view";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Nhật Ký Hoạt Động | MVPX Admin",
  description: "Quản lý và truy vết nhật ký thao tác người dùng & hệ thống",
};

export default async function AuditLogsPage() {
  const session = await auth();
  if (session?.user?.role !== "Admin") {
    redirect("/admin");
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <AuditLogsView />
    </div>
  );
}
