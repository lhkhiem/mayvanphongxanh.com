"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

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

    await prisma.role.create({
      data: {
        name,
        description,
        isSystem: false
      }
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
      // Cho phép sửa mô tả nhưng không cho sửa tên của quyền hệ thống
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
    revalidatePath("/admin/roles")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi hệ thống. Không thể xóa." }
  }
}
