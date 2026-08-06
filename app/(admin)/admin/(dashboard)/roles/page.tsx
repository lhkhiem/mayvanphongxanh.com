import { prisma } from "@/lib/db"
import { RolesTable } from "./roles-table"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function RolesPage() {
  const session = await auth()
  if (session?.user?.role !== "Admin") {
    redirect("/admin")
  }

  const roles = await prisma.role.findMany({
    include: { 
      permissions: {
        include: { permission: true }
      },
      _count: {
        select: { users: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  const permissions = await prisma.permission.findMany({
    orderBy: { code: 'asc' }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Phân quyền</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý các nhóm quyền (Roles) và ma trận tùy chỉnh tính năng truy cập.</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border">
        <RolesTable data={roles} permissions={permissions} />
      </div>
    </div>
  )
}
