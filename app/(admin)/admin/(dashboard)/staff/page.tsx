import { prisma } from "@/lib/db"
import { StaffTable } from "./staff-table"

export default async function StaffPage() {
  const staff = await prisma.user.findMany({
    where: { roleId: { not: null } },
    include: { role: true },
    orderBy: { createdAt: 'desc' }
  })
  
  const roles = await prisma.role.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Quản trị viên</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý danh sách nhân sự và phân quyền truy cập hệ thống.</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border">
        <StaffTable data={staff} roles={roles} />
      </div>
    </div>
  )
}
