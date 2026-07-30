"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { unlink, copyFile, mkdir } from "fs/promises"
import path from "path"
import fs from "fs"

export async function getAssets(search?: string, folderId?: string | null) {
  try {
    const assets = await prisma.asset.findMany({
      where: search ? {
        OR: [
          { fileName: { contains: search, mode: 'insensitive' } },
          { url: { contains: search, mode: 'insensitive' } },
        ]
      } : {
        folderId: folderId === 'root' ? null : (folderId || null)
      },
      orderBy: { createdAt: 'desc' },
    })
    return { data: assets }
  } catch (error) {
    console.error("Error fetching assets:", error)
    return { error: "Không thể tải danh sách ảnh." }
  }
}

export async function getFolders(parentId?: string | null) {
  try {
    const folders = await prisma.mediaFolder.findMany({
      where: {
        parentId: parentId === 'root' ? null : (parentId || null)
      },
      orderBy: { createdAt: 'desc' },
    })
    return { data: folders }
  } catch (error) {
    console.error("Error fetching folders:", error)
    return { error: "Không thể tải danh sách thư mục." }
  }
}

export async function getAllFolders() {
  try {
    const folders = await prisma.mediaFolder.findMany({
      orderBy: { name: 'asc' },
    })
    return { data: folders }
  } catch (error) {
    console.error("Error fetching all folders:", error)
    return { error: "Không thể tải danh sách thư mục." }
  }
}

export async function createFolder(name: string, parentId?: string | null) {
  try {
    const folder = await prisma.mediaFolder.create({
      data: {
        name,
        parentId: parentId === 'root' ? null : (parentId || null)
      }
    })
    revalidatePath("/admin/media")
    return { data: folder }
  } catch (error) {
    console.error("Error creating folder:", error)
    return { error: "Không thể tạo thư mục." }
  }
}

export async function deleteFolder(id: string) {
  try {
    await prisma.mediaFolder.delete({ where: { id } })
    revalidatePath("/admin/media")
    return { success: true }
  } catch (error) {
    console.error("Error deleting folder:", error)
    return { error: "Lỗi hệ thống. Không thể xóa thư mục." }
  }
}

export async function renameFolder(id: string, name: string) {
  try {
    await prisma.mediaFolder.update({
      where: { id },
      data: { name }
    })
    revalidatePath("/admin/media")
    return { success: true }
  } catch (error) {
    console.error("Error renaming folder:", error)
    return { error: "Lỗi hệ thống. Không thể đổi tên thư mục." }
  }
}

export async function deleteAsset(id: string, url: string) {
  try {
    // Delete from DB
    await prisma.asset.delete({ where: { id } })

    // Delete file from disk
    try {
      let rootDir = process.cwd()
      if (rootDir.includes('.next/standalone') || rootDir.includes('.next\\standalone')) {
        rootDir = path.join(rootDir, '../../')
      }
      const cleanUrl = url.split('?')[0]
      const relativePath = cleanUrl.startsWith('/') ? cleanUrl.slice(1) : cleanUrl
      const filePath = path.join(rootDir, 'public', relativePath)
      if (fs.existsSync(filePath)) {
        await unlink(filePath)
      }
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

    let rootDir = process.cwd()
    if (rootDir.includes('.next/standalone') || rootDir.includes('.next\\standalone')) {
      rootDir = path.join(rootDir, '../../')
    }

    // Delete files from disk
    await Promise.allSettled(
      urls.map(async (url) => {
        const cleanUrl = url.split('?')[0]
        const relativePath = cleanUrl.startsWith('/') ? cleanUrl.slice(1) : cleanUrl
        const filePath = path.join(rootDir, 'public', relativePath)
        if (fs.existsSync(filePath)) {
          await unlink(filePath)
        }
      })
    )

    revalidatePath("/admin/media")
    return { success: true }
  } catch (error) {
    console.error("Error deleting assets:", error)
    return { error: "Lỗi hệ thống. Không thể xóa ảnh." }
  }
}

export async function renameAsset(id: string, newFileName: string) {
  try {
    if (!newFileName.trim()) return { error: "Tên file không được để trống" }
    const updated = await prisma.asset.update({
      where: { id },
      data: { fileName: newFileName.trim() }
    })
    revalidatePath("/admin/media")
    return { data: updated }
  } catch (error) {
    console.error("Error renaming asset:", error)
    return { error: "Không thể đổi tên file." }
  }
}

export async function moveAssets(ids: string[], targetFolderId: string | null) {
  try {
    if (!ids || ids.length === 0) return { error: "Không có file nào được chọn" }
    
    const folderId = (targetFolderId === 'root' || targetFolderId === 'null' || !targetFolderId) ? null : targetFolderId

    await prisma.asset.updateMany({
      where: { id: { in: ids } },
      data: { folderId }
    })
    revalidatePath("/admin/media")
    return { success: true }
  } catch (error) {
    console.error("Error moving assets:", error)
    return { error: "Không thể di chuyển file." }
  }
}
