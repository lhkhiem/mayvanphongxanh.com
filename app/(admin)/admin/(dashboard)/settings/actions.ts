"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { sendTestEmail } from "@/lib/mailer"
import { logAuditAction } from "@/lib/audit-logger"

export async function updateSettings(data: FormData) {
  try {
    const updatedKeys: string[] = []
    for (const [key, value] of data.entries()) {
      if (typeof value === "string") {
        await prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        })
        updatedKeys.push(key)

        if (key === 'company_logo') {
          await prisma.setting.upsert({ where: { key: 'site_logo' }, update: { value }, create: { key: 'site_logo', value } })
        } else if (key === 'site_logo') {
          await prisma.setting.upsert({ where: { key: 'company_logo' }, update: { value }, create: { key: 'company_logo', value } })
        } else if (key === 'company_favicon') {
          await prisma.setting.upsert({ where: { key: 'site_favicon' }, update: { value }, create: { key: 'site_favicon', value } })
        } else if (key === 'site_favicon') {
          await prisma.setting.upsert({ where: { key: 'company_favicon' }, update: { value }, create: { key: 'company_favicon', value } })
        }
      }
    }

    await logAuditAction({
      action: "CONFIG_CHANGE",
      entity: "SETTING",
      details: `Cập nhật cấu hình website (${updatedKeys.length} cài đặt)`,
      metadata: { updatedKeys }
    })

    revalidatePath("/", "layout")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi hệ thống. Không thể lưu cài đặt." }
  }
}

export async function sendTestEmailAction(toEmail: string) {
  if (!toEmail || !toEmail.includes("@")) {
    return { error: "Địa chỉ email không hợp lệ." }
  }
  const result = await sendTestEmail(toEmail)
  if (result.success) {
    await logAuditAction({
      action: "UPDATE",
      entity: "SETTING",
      details: `Gửi email thử nghiệm hệ thống tới: ${toEmail}`
    })
  }
  return result
}
