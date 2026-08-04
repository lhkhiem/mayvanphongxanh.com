"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type PublicTestimonialSubmitInput = {
  name: string;
  role?: string;
  content: string;
  rating: number;
  image?: string;
  num1: number;
  num2: number;
  captchaAnswer: string;
  honeypot?: string;
};

export async function submitPublicTestimonial(input: PublicTestimonialSubmitInput) {
  try {
    // 1. Honeypot check (bẫy bot tự động)
    if (input.honeypot && input.honeypot.trim() !== "") {
      // Trả về giả lập thành công để bot tưởng thành công mà không lưu DB
      return { success: true, message: "Cảm ơn bạn đã gửi đánh giá! Nhận xét của bạn đang được kiểm duyệt." };
    }

    // 2. Kiểm tra CAPTCHA Phép tính
    const expectedAnswer = Number(input.num1) + Number(input.num2);
    const userAnswer = Number(input.captchaAnswer?.trim());

    if (isNaN(userAnswer) || userAnswer !== expectedAnswer) {
      return { error: "Phép tính xác minh CAPTCHA không đúng. Vui lòng thử lại!" };
    }

    // 3. Validation dữ liệu đầu vào
    const name = input.name?.trim();
    if (!name || name.length < 2) {
      return { error: "Vui lòng nhập Họ và tên (tối thiểu 2 ký tự)." };
    }

    const content = input.content?.trim();
    if (!content || content.length < 10) {
      return { error: "Nội dung nhận xét quá ngắn (tối thiểu 10 ký tự)." };
    }

    const rating = Math.min(5, Math.max(1, Number(input.rating) || 5));
    const role = input.role?.trim() || null;
    const image = input.image?.trim() || null;

    // 4. Lưu vào cơ sở dữ liệu với isActive = false (Chờ Admin duyệt)
    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        role,
        content,
        rating,
        image,
        isActive: false, // Luôn để false cho tới khi Admin duyệt
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/testimonials");

    return {
      success: true,
      data: testimonial,
      message: "Cảm ơn bạn đã gửi đánh giá! Nhận xét của bạn đã được gửi thành công và sẽ hiển thị sau khi được Admin phê duyệt.",
    };
  } catch (error: any) {
    console.error("Error submitting public testimonial:", error);
    return { error: error.message || "Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau." };
  }
}
