import { prisma } from "@/lib/db"
import { RolesTable } from "./roles-table"

export default async function RolesPage() {
  const roles = await prisma.role.findMany({
    include: { 
      _count: {
        select: { users: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Phân quyền</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý các nhóm quyền (Roles) và giới hạn truy cập chức năng.</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border">
        <RolesTable data={roles} />
      </div>
    </div>
  )
}
