"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { logAuditAction } from "@/lib/audit-logger"
import { auth } from "@/auth"
import { sendRootVerificationOtpEmail } from "@/lib/mailer"

export async function checkRootEmail(email: string) {
  if (!email || !email.includes("@")) {
    return { error: "Email không hợp lệ." }
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    include: { role: true }
  })

  return {
    exists: !!existing,
    user: existing ? { name: existing.name, email: existing.email, roleName: existing.role?.name } : null
  }
}

export async function sendRootOtp(email: string) {
  const session = await auth()
  if (session?.user?.role !== "Admin") {
    return { error: "Bạn không có quyền thực hiện thao tác này." }
  }

  if (!email || !email.includes("@")) {
    return { error: "Email không hợp lệ." }
  }

  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 phút

    // Delete existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { email, type: "ROOT_VERIFY" }
    })

    await prisma.verificationToken.create({
      data: {
        email,
        code,
        type: "ROOT_VERIFY",
        expiresAt
      }
    })

    const mailRes = await sendRootVerificationOtpEmail({ email, code })
    if (!mailRes.success) {
      return { error: mailRes.error || "Không thể gửi email OTP. Vui lòng kiểm tra cấu hình SMTP." }
    }

    await logAuditAction({
      action: "UPDATE",
      entity: "USER",
      details: `Gửi mã OTP xác thực thiết lập Tài Khoản Root tới email: ${email}`
    })

    return { success: true }
  } catch (error: any) {
    return { error: "Lỗi gửi mã OTP: " + (error.message || "Không thể xử lý.") }
  }
}

export async function confirmAndSetRoot({
  email,
  code,
  name,
  password
}: {
  email: string;
  code: string;
  name?: string;
  password?: string;
}) {
  const session = await auth()
  if (session?.user?.role !== "Admin") {
    return { error: "Bạn không có quyền thực hiện thao tác này." }
  }

  try {
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        email,
        code,
        type: "ROOT_VERIFY",
        expiresAt: { gt: new Date() }
      }
    })

    if (!tokenRecord) {
      return { error: "Mã OTP không đúng hoặc đã hết hạn (sau 15 phút)." }
    }

    // Delete used token
    await prisma.verificationToken.delete({
      where: { id: tokenRecord.id }
    })

    // Get or create Admin Role
    let adminRole = await prisma.role.findFirst({ where: { name: "Admin" } })
    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: { name: "Admin", description: "Quản trị viên cấp cao", isSystem: true }
      })
    }

    // Clear previous isRoot status if any
    await prisma.user.updateMany({
      where: { isRoot: true },
      data: { isRoot: false }
    })

    const existingUser = await prisma.user.findUnique({ where: { email } })

    let rootUser
    if (existingUser) {
      // Upgrade existing user to Root
      rootUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          isRoot: true,
          roleId: adminRole.id,
          ...(name ? { name } : {}),
          ...(password && password.trim() !== "" ? { password: await bcrypt.hash(password, 10) } : {})
        }
      })
    } else {
      // Create new user as Root
      if (!password || password.length < 6) {
        return { error: "Mật khẩu cho tài khoản Root mới phải ít nhất 6 ký tự." }
      }
      const hashedPassword = await bcrypt.hash(password, 10)
      rootUser = await prisma.user.create({
        data: {
          name: name || "Root Super Admin",
          email,
          password: hashedPassword,
          roleId: adminRole.id,
          isRoot: true
        }
      })
    }

    await logAuditAction({
      action: "UPDATE",
      entity: "USER",
      entityId: rootUser.id,
      details: `Kích hoạt thành công Tài Khoản Root Tối Cao: ${email}`
    })

    revalidatePath("/admin/staff")
    return { success: true }
  } catch (error: any) {
    return { error: "Lỗi hệ thống. Không thể thiết lập Root User." }
  }
}

export async function createStaff(data: FormData) {
  const session = await auth()
  if (session?.user?.role !== "Admin") {
    return { error: "Bạn không có quyền quản lý tài khoản nhân sự." }
  }

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

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId,
      }
    })

    await logAuditAction({
      action: "CREATE",
      entity: "USER",
      entityId: newUser.id,
      details: `Tạo tài khoản quản trị viên mới: ${email} (${name})`,
      metadata: { email, name, roleId }
    })

    revalidatePath("/admin/staff")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi hệ thống. Không thể tạo tài khoản." }
  }
}

export async function updateStaff(id: string, data: FormData) {
  const session = await auth()
  if (session?.user?.role !== "Admin") {
    return { error: "Bạn không có quyền quản lý tài khoản nhân sự." }
  }

  const name = data.get("name") as string
  const email = data.get("email") as string
  const roleId = data.get("roleId") as string
  const password = data.get("password") as string

  if (!email || !roleId) {
    return { error: "Email và Phân quyền là bắt buộc." }
  }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id }, include: { role: true } })
    if (!targetUser) {
      return { error: "Không tìm thấy người dùng." }
    }

    // Protection for Root User
    if (targetUser.isRoot) {
      if (email !== targetUser.email) {
        return { error: "Email của Tài khoản Root không thể thay đổi sau khi tạo." }
      }
      if (roleId !== targetUser.roleId) {
        return { error: "Tài khoản Root luôn phải duy trì nhóm quyền Admin tối cao." }
      }
    }

    const updateData: any = { name, email, roleId }
    
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10)
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    })

    await logAuditAction({
      action: "UPDATE",
      entity: "USER",
      entityId: id,
      details: `Cập nhật thông tin quản trị viên: ${email}`,
      metadata: { email, name, roleId }
    })

    revalidatePath("/admin/staff")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi hệ thống. Không thể cập nhật." }
  }
}

export async function deleteStaff(id: string) {
  const session = await auth()
  if (session?.user?.role !== "Admin") {
    return { error: "Bạn không có quyền quản lý tài khoản nhân sự." }
  }

  try {
    const user = await prisma.user.findUnique({ where: { id }, include: { role: true } })
    
    if (user?.isRoot || (user?.role?.isSystem && user?.email === 'admin@mvpx.vn')) {
      return { error: "Không thể xóa Tài khoản Root tối cao của hệ thống." }
    }

    await prisma.user.delete({ where: { id } })

    await logAuditAction({
      action: "DELETE",
      entity: "USER",
      entityId: id,
      details: `Xóa tài khoản quản trị viên: ${user?.email || id}`
    })

    revalidatePath("/admin/staff")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi hệ thống. Không thể xóa." }
  }
}

