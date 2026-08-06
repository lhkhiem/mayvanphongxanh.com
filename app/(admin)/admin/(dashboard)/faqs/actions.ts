"use server";

import { prisma as db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logAuditAction } from "@/lib/audit-logger";

export type FaqFormData = {
  question: string;
  answer: string;
  category?: string;
  order: number;
  isActive: boolean;
};

export async function getFaqs() {
  try {
    const data = await db.faq.findMany({
      orderBy: [
        { category: "asc" },
        { order: "asc" },
      ],
    });
    return { data };
  } catch (error: any) {
    return { error: error.message || "Failed to get FAQs" };
  }
}

export async function createFaq(data: FaqFormData) {
  try {
    const faq = await db.faq.create({
      data: {
        question: data.question,
        answer: data.answer,
        category: data.category?.trim() || null,
        order: data.order,
        isActive: data.isActive,
      },
    });

    await logAuditAction({
      action: "CREATE",
      entity: "FAQ",
      entityId: faq.id,
      details: `Tạo câu hỏi thường gặp mới: "${data.question.slice(0, 50)}..."`,
      metadata: { question: data.question, category: data.category }
    });

    revalidatePath("/");
    revalidatePath("/hoi-dap");
    return { data: faq };
  } catch (error: any) {
    return { error: error.message || "Failed to create FAQ" };
  }
}

export async function updateFaq(id: number, data: FaqFormData) {
  try {
    const faq = await db.faq.update({
      where: { id },
      data: {
        question: data.question,
        answer: data.answer,
        category: data.category?.trim() || null,
        order: data.order,
        isActive: data.isActive,
      },
    });

    await logAuditAction({
      action: "UPDATE",
      entity: "FAQ",
      entityId: id,
      details: `Cập nhật câu hỏi FAQ ID #${id}: "${data.question.slice(0, 50)}..."`,
      metadata: { question: data.question, category: data.category }
    });

    revalidatePath("/");
    revalidatePath("/hoi-dap");
    return { data: faq };
  } catch (error: any) {
    return { error: error.message || "Failed to update FAQ" };
  }
}

export async function deleteFaq(id: number) {
  try {
    await db.faq.delete({ where: { id } });

    await logAuditAction({
      action: "DELETE",
      entity: "FAQ",
      entityId: id,
      details: `Xóa câu hỏi FAQ ID #${id}`,
    });

    revalidatePath("/");
    revalidatePath("/hoi-dap");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete FAQ" };
  }
}

export async function toggleFaqActive(id: number, currentStatus: boolean) {
  try {
    await db.faq.update({
      where: { id },
      data: { isActive: !currentStatus },
    });

    await logAuditAction({
      action: "STATUS_CHANGE",
      entity: "FAQ",
      entityId: id,
      details: `Thay đổi trạng thái FAQ ID #${id} thành ${!currentStatus ? 'Hiển thị' : 'Ẩn'}`,
    });

    revalidatePath("/");
    revalidatePath("/hoi-dap");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to toggle FAQ status" };
  }
}

export async function renameFaqCategory(oldCategory: string, newCategory: string) {
  try {
    const trimmedNew = newCategory.trim();
    if (!trimmedNew) {
      return { error: "Tên danh mục mới không được để trống" };
    }
    await db.faq.updateMany({
      where: { category: oldCategory },
      data: { category: trimmedNew },
    });

    await logAuditAction({
      action: "UPDATE",
      entity: "FAQ",
      details: `Đổi tên danh mục FAQ từ "${oldCategory}" sang "${trimmedNew}"`,
    });

    revalidatePath("/");
    revalidatePath("/hoi-dap");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Lỗi khi đổi tên danh mục" };
  }
}

export async function deleteFaqCategory(categoryName: string) {
  try {
    await db.faq.updateMany({
      where: { category: categoryName },
      data: { category: null },
    });

    await logAuditAction({
      action: "DELETE",
      entity: "FAQ",
      details: `Xóa danh mục FAQ "${categoryName}"`,
    });

    revalidatePath("/");
    revalidatePath("/hoi-dap");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Lỗi khi xóa danh mục" };
  }
}
