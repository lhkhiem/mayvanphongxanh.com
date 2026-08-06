"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { logAuditAction } from "@/lib/audit-logger"

export async function createRole(data: FormData) {
  const name = data.get("name") as string
  const description = data.get("description") as string

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
        isSystem: false
      }
    })

    await logAuditAction({
      action: "CREATE",
      entity: "ROLE",
      entityId: role.id,
      details: `Tạo nhóm quyền (vai trò) mới: ${name}`,
      metadata: { name, description }
    })

    revalidatePath("/admin/roles")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi hệ thống. Không thể tạo." }
  }
}

export async function updateRole(id: string, data: FormData) {
  const name = data.get("name") as string
  const description = data.get("description") as string

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

    await logAuditAction({
      action: "UPDATE",
      entity: "ROLE",
      entityId: id,
      details: `Cập nhật nhóm quyền: ${role?.name || name}`,
      metadata: { name, description }
    })

    revalidatePath("/admin/roles")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi hệ thống. Không thể cập nhật." }
  }
}

export async function deleteRole(id: string) {
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
