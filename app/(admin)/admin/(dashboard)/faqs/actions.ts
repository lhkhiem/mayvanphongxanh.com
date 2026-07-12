"use server";

import { prisma as db } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
        category: data.category || null,
        order: data.order,
        isActive: data.isActive,
      },
    });
    revalidatePath("/");
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
        category: data.category || null,
        order: data.order,
        isActive: data.isActive,
      },
    });
    revalidatePath("/");
    return { data: faq };
  } catch (error: any) {
    return { error: error.message || "Failed to update FAQ" };
  }
}

export async function deleteFaq(id: number) {
  try {
    await db.faq.delete({ where: { id } });
    revalidatePath("/");
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
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to toggle FAQ status" };
  }
}
