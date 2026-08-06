"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { logAuditAction } from "@/lib/audit-logger"
import { auth } from "@/auth"

export async function createRole(data: FormData) {
  const session = await auth()
  if (session?.user?.role !== "Admin") {
    return { error: "Bạn không có quyền thực hiện thao tác này." }
  }

  const name = data.get("name") as string
  const description = data.get("description") as string
  const permissionIds = data.getAll("permissionIds") as string[]

  if (!name) {
    return { error: "Tên nhóm quyền không được để trống." }
  }

  try {
    const existing = await prisma.role.findUnique({ where: { name } })
    if (existing) {
      return { error: "Tên nhóm quyền này đã tồn tại." }
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        isSystem: false,
        permissions: {
          create: permissionIds.map(permissionId => ({ permissionId }))
        }
      }
    })

    await logAuditAction({
      action: "CREATE",
      entity: "ROLE",
      entityId: role.id,
      details: `Tạo nhóm quyền mới: ${name} với ${permissionIds.length} quyền hạn`,
      metadata: { name, description, permissionCount: permissionIds.length }
    })

    revalidatePath("/admin/roles")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi hệ thống. Không thể tạo." }
  }
}

export async function updateRole(id: string, data: FormData) {
  const session = await auth()
  if (session?.user?.role !== "Admin") {
    return { error: "Bạn không có quyền thực hiện thao tác này." }
  }

  const name = data.get("name") as string
  const description = data.get("description") as string
  const permissionIds = data.getAll("permissionIds") as string[]

  if (!name) {
    return { error: "Tên nhóm quyền không được để trống." }
  }

  try {
    const role = await prisma.role.findUnique({ where: { id } })
    if (role?.isSystem) {
      await prisma.role.update({
        where: { id },
        data: { description }
      })
    } else {
      await prisma.role.update({
        where: { id },
        data: { name, description }
      })
    }

    // Sync role permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: id }
    })

    if (permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map(permissionId => ({
          roleId: id,
          permissionId
        }))
      })
    }

    await logAuditAction({
      action: "UPDATE",
      entity: "ROLE",
      entityId: id,
      details: `Cập nhật nhóm quyền: ${role?.name || name} (${permissionIds.length} quyền hạn)`,
      metadata: { name, description, permissionCount: permissionIds.length }
    })

    revalidatePath("/admin/roles")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi hệ thống. Không thể cập nhật." }
  }
}

export async function deleteRole(id: string) {
  const session = await auth()
  if (session?.user?.role !== "Admin") {
    return { error: "Bạn không có quyền thực hiện thao tác này." }
  }

  try {
    const role = await prisma.role.findUnique({ where: { id }, include: { users: true } })
    
    if (role?.isSystem) {
      return { error: "Không thể xóa nhóm quyền mặc định của hệ thống." }
    }
    
    if (role && role.users.length > 0) {
      return { error: "Không thể xóa vì đang có người dùng thuộc nhóm quyền này." }
    }

    await prisma.role.delete({ where: { id } })

    await logAuditAction({
      action: "DELETE",
      entity: "ROLE",
      entityId: id,
      details: `Xóa nhóm quyền: ${role?.name || id}`
    })

    revalidatePath("/admin/roles")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi hệ thống. Không thể xóa." }
  }
}
