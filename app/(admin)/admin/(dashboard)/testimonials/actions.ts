"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type TestimonialFormData = {
  name: string;
  role?: string | null;
  content: string;
  rating: number;
  image?: string | null;
  isActive: boolean;
};

export async function getTestimonials() {
  try {
    const data = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { data };
  } catch (error: any) {
    console.error("Error fetching testimonials:", error);
    return { error: error.message || "Không thể lấy danh sách đánh giá" };
  }
}

export async function createTestimonial(data: TestimonialFormData) {
  try {
    if (!data.name.trim()) return { error: "Vui lòng nhập tên khách hàng" };
    if (!data.content.trim()) return { error: "Vui lòng nhập nội dung đánh giá" };

    const testimonial = await prisma.testimonial.create({
      data: {
        name: data.name.trim(),
        role: data.role?.trim() || null,
        content: data.content.trim(),
        rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
        image: data.image?.trim() || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/testimonials");
    return { data: testimonial };
  } catch (error: any) {
    console.error("Error creating testimonial:", error);
    return { error: error.message || "Không thể tạo đánh giá" };
  }
}

export async function updateTestimonial(id: number, data: TestimonialFormData) {
  try {
    if (!data.name.trim()) return { error: "Vui lòng nhập tên khách hàng" };
    if (!data.content.trim()) return { error: "Vui lòng nhập nội dung đánh giá" };

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        name: data.name.trim(),
        role: data.role?.trim() || null,
        content: data.content.trim(),
        rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
        image: data.image?.trim() || null,
        isActive: data.isActive,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/testimonials");
    return { data: testimonial };
  } catch (error: any) {
    console.error("Error updating testimonial:", error);
    return { error: error.message || "Không thể cập nhật đánh giá" };
  }
}

export async function deleteTestimonial(id: number) {
  try {
    await prisma.testimonial.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/testimonials");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting testimonial:", error);
    return { error: error.message || "Không thể xóa đánh giá" };
  }
}

export async function toggleTestimonialActive(id: number, currentStatus: boolean) {
  try {
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: { isActive: !currentStatus },
    });
    revalidatePath("/");
    revalidatePath("/admin/testimonials");
    return { success: true, data: testimonial };
  } catch (error: any) {
    console.error("Error toggling testimonial status:", error);
    return { error: error.message || "Không thể thay đổi trạng thái" };
  }
}
