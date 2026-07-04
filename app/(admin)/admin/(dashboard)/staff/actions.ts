"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function createStaff(data: FormData) {
  const name = data.get("name") as string
  const email = data.get("email") as string
  const password = data.get("password") as string
  const roleId = data.get("roleId") as string

  if (!email || !password || !roleId) {
    return { error: "Vui lòng điền đầy đủ thông tin bắt buộc." }
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return { error: "Email này đã tồn tại trong hệ thống." }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId,
      }
    })

    revalidatePath("/admin/staff")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi hệ thống. Không thể tạo tài khoản." }
  }
}

export async function updateStaff(id: string, data: FormData) {
  const name = data.get("name") as string
  const email = data.get("email") as string
  const roleId = data.get("roleId") as string
  const password = data.get("password") as string

  if (!email || !roleId) {
    return { error: "Email và Phân quyền là bắt buộc." }
  }

  try {
    const updateData: any = { name, email, roleId }
    
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10)
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    })

    revalidatePath("/admin/staff")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi hệ thống. Không thể cập nhật." }
  }
}

export async function deleteStaff(id: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id }, include: { role: true } })
    
    if (user?.role?.isSystem && user?.email === 'admin@mvpx.vn') {
      return { error: "Không thể xóa tài khoản Admin hệ thống gốc." }
    }

    await prisma.user.delete({ where: { id } })
    revalidatePath("/admin/staff")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi hệ thống. Không thể xóa." }
  }
}
