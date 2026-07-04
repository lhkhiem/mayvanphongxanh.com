"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { unlink } from "fs/promises"
import path from "path"

export async function getAssets(search?: string) {
  try {
    const assets = await prisma.asset.findMany({
      where: search ? {
        OR: [
          { fileName: { contains: search, mode: 'insensitive' } },
          { url: { contains: search, mode: 'insensitive' } },
        ]
      } : undefined,
      orderBy: { createdAt: 'desc' },
    })
    return { data: assets }
  } catch (error) {
    console.error("Error fetching assets:", error)
    return { error: "Không thể tải danh sách ảnh." }
  }
}

export async function deleteAsset(id: string, url: string) {
  try {
    // Delete from DB
    await prisma.asset.delete({ where: { id } })

    // Delete file from disk
    try {
      const filePath = path.join(process.cwd(), 'public', url)
      await unlink(filePath)
    } catch (fileErr) {
      console.warn("Could not delete file from disk (may already be gone):", fileErr)
    }

    revalidatePath("/admin/media")
    return { success: true }
  } catch (error) {
    console.error("Error deleting asset:", error)
    return { error: "Lỗi hệ thống. Không thể xóa ảnh." }
  }
}

export async function deleteMultipleAssets(ids: string[], urls: string[]) {
  try {
    await prisma.asset.deleteMany({ where: { id: { in: ids } } })

    // Delete files from disk
    await Promise.allSettled(
      urls.map(async (url) => {
        const filePath = path.join(process.cwd(), 'public', url)
        await unlink(filePath)
      })
    )

    revalidatePath("/admin/media")
    return { success: true }
  } catch (error) {
    console.error("Error deleting assets:", error)
    return { error: "Lỗi hệ thống. Không thể xóa ảnh." }
  }
}
