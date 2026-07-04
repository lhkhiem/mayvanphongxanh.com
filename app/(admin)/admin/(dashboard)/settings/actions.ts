"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateSettings(data: FormData) {
  try {
    for (const [key, value] of data.entries()) {
      if (typeof value === "string") {
        await prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        })
      }
    }
    
    revalidatePath("/admin/settings")
    return { success: true }
  } catch (error) {
    return { error: "Lỗi hệ thống. Không thể lưu cài đặt." }
  }
}
