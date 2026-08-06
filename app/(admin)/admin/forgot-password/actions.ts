"use server"

import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { sendPasswordResetEmail } from "@/lib/mailer"
import { logAuditAction } from "@/lib/audit-logger"

export async function requestPasswordReset(email: string) {
  if (!email || !email.includes("@")) {
    return { error: "Vui lòng nhập địa chỉ email hợp lệ." }
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    
    // Always return success to prevent email enumeration attacks
    if (!user) {
      return { success: true, message: "Nếu địa chỉ email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn khôi phục mật khẩu." }
    }

    // Generate random 64-char token
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 giờ

    // Delete existing reset tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { email, type: "PASSWORD_RESET" }
    })

    await prisma.verificationToken.create({
      data: {
        email,
        code: token.slice(0, 8),
        token,
        type: "PASSWORD_RESET",
        expiresAt
      }
    })

    const baseUrl = process.env.NEXTAUTH_URL || "https://mayvanphongxanh.com"
    const resetUrl = `${baseUrl}/admin/reset-password?token=${token}`

    const mailRes = await sendPasswordResetEmail({
      email,
      resetUrl,
      name: user.name
    })

    if (!mailRes.success) {
      return { error: mailRes.error || "Không thể gửi email. Vui lòng kiểm tra lại cấu hình SMTP." }
    }

    await logAuditAction({
      action: "UPDATE",
      entity: "USER",
      entityId: user.id,
      details: `Yêu cầu khôi phục mật khẩu cho tài khoản: ${email}`,
      userEmail: email
    })

    return { success: true, message: "Đã gửi email hướng dẫn khôi phục mật khẩu. Vui lòng kiểm tra hộp thư (inbox và spam)." }
  } catch (error: any) {
    return { error: "Lỗi hệ thống: " + (error.message || "Không thể thực hiện.") }
  }
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
  if (!token) {
    return { error: "Mã xác nhận không hợp lệ." }
  }

  if (!newPassword || newPassword.length < 6) {
    return { error: "Mật khẩu mới phải có ít nhất 6 ký tự." }
  }

  try {
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: "PASSWORD_RESET",
        expiresAt: { gt: new Date() }
      }
    })

    if (!tokenRecord) {
      return { error: "Đường dẫn khôi phục không đúng hoặc đã hết hạn. Vui lòng yêu cầu lại." }
    }

    const user = await prisma.user.findUnique({
      where: { email: tokenRecord.email }
    })

    if (!user) {
      return { error: "Tài khoản người dùng không tồn tại." }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    // Delete used token
    await prisma.verificationToken.delete({
      where: { id: tokenRecord.id }
    })

    await logAuditAction({
      action: "UPDATE",
      entity: "USER",
      entityId: user.id,
      details: `Đặt lại mật khẩu thành công qua email cho tài khoản: ${user.email}`,
      userId: user.id,
      userEmail: user.email || undefined
    })

    return { success: true, message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bằng mật khẩu mới." }
  } catch (error: any) {
    return { error: "Lỗi hệ thống. Không thể đặt lại mật khẩu." }
  }
}
