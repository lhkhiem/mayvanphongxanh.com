"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

export async function getProjects(filter?: 'all' | 'published' | 'drafts') {
  try {
    let whereClause = {}
    if (filter === 'published') {
      whereClause = { isActive: true }
    } else if (filter === 'drafts') {
      whereClause = { isActive: false }
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      orderBy: { id: 'desc' },
    })
    return { data: projects }
  } catch (error) {
    console.error("Error fetching projects:", error)
    return { error: "Không thể tải danh sách dự án." }
  }
}

export async function getProject(id: number) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
    })
    return { data: project }
  } catch (error) {
    console.error("Error fetching project:", error)
    return { error: "Không thể tải dự án." }
  }
}

export async function createProject(data: any) {
  try {
    const project = await prisma.project.create({
      data: {
        title: data.title,
        client: data.client,
        description: data.description,
        image: data.image,
        category: data.category,
        isActive: data.isActive,
      }
    })
    revalidatePath("/admin/projects")
    return { success: true, data: project }
  } catch (error) {
    console.error("Error creating project:", error)
    return { error: "Lỗi hệ thống. Không thể tạo dự án." }
  }
}

export async function updateProject(id: number, data: any) {
  try {
    const updateData: any = {
      title: data.title,
      client: data.client,
      description: data.description,
      image: data.image,
      category: data.category,
      isActive: data.isActive,
    }

    const project = await prisma.project.update({
      where: { id },
      data: updateData
    })
    revalidatePath("/admin/projects")
    return { success: true, data: project }
  } catch (error) {
    console.error("Error updating project:", error)
    return { error: "Lỗi hệ thống. Không thể cập nhật dự án." }
  }
}

export async function toggleProjectActive(id: number, currentActiveStatus: boolean) {
  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        isActive: !currentActiveStatus
      }
    })
    revalidatePath("/admin/projects")
    return { success: true, data: project }
  } catch (error) {
    console.error("Error toggling project status:", error)
    return { error: "Lỗi hệ thống. Không thể thay đổi trạng thái." }
  }
}

export async function deleteProject(id: number) {
  try {
    await prisma.project.delete({
      where: { id }
    })
    revalidatePath("/admin/projects")
    return { success: true }
  } catch (error) {
    console.error("Error deleting project:", error)
    return { error: "Lỗi hệ thống. Không thể xóa dự án." }
  }
}
