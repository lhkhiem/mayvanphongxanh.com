import { getSalesDashboardData, getContentDashboardData, getSeoDashboardData } from "./actions";
import { DashboardClient } from "@/components/admin/dashboard/dashboard-client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [salesData, contentData, seoData] = await Promise.all([
    getSalesDashboardData(),
    getContentDashboardData(),
    getSeoDashboardData(),
  ]);

  return (
    <DashboardClient
      salesData={salesData}
      contentData={contentData}
      seoData={seoData}
    />
  );
}
