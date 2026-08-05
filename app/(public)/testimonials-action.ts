"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { generateCaptchaChallenge, verifyCaptchaToken } from "@/lib/captcha";

const COOLDOWN_SECONDS = 120; // 2 phút server-side rate limit

// 1. Tạo CAPTCHA Challenge ký bằng Server HMAC (Không thể fake từ Client)
export async function getCaptchaChallenge() {
  return generateCaptchaChallenge();
}

export type PublicTestimonialSubmitInput = {
  name: string;
  role?: string;
  content: string;
  rating: number;
  image?: string;
  captchaToken: string;
  captchaAnswer: string;
  honeypot?: string;
};

// Hàm làm sạch chuỗi loại bỏ thẻ HTML nguy hiểm (Chống XSS)
function sanitizeText(str: string): string {
  if (!str) return "";
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export async function submitPublicTestimonial(input: PublicTestimonialSubmitInput) {
  try {
    // ----------------------------------------------------
    // A. BẪY BOT (Honeypot Trap)
    // ----------------------------------------------------
    if (input.honeypot && input.honeypot.trim() !== "") {
      // Giả lập gửi thành công để Bot dừng lại không thử lại
      return { success: true, message: "Cảm ơn bạn đã gửi đánh giá! Nhận xét của bạn đang được duyệt." };
    }

    // ----------------------------------------------------
    // B. CHỐNG SPAM: Server-side Rate Limiting (Cookie & IP)
    // ----------------------------------------------------
    const cookieStore = await cookies();
    const lastSubmitCookie = cookieStore.get("mvpx_last_testimonial_submit");
    const now = Date.now();

    if (lastSubmitCookie) {
      const lastTime = parseInt(lastSubmitCookie.value, 10);
      if (!isNaN(lastTime) && now - lastTime < COOLDOWN_SECONDS * 1000) {
        const remainingSec = Math.ceil((COOLDOWN_SECONDS * 1000 - (now - lastTime)) / 1000);
        return { error: `Bạn thao tác quá nhanh! Vui lòng đợi ${remainingSec} giây trước khi gửi tiếp.` };
      }
    }

    // ----------------------------------------------------
    // C. CHỐNG FAKE CAPTCHA: Kiểm tra Chữ ký Server (HMAC Verification)
    // ----------------------------------------------------
    const captchaCheck = verifyCaptchaToken(input.captchaToken, input.captchaAnswer);
    if (!captchaCheck.valid) {
      return { error: captchaCheck.error || "Xác minh CAPTCHA thất bại. Vui lòng thử lại!" };
    }

    // ----------------------------------------------------
    // D. CHỐNG XSS & GIỚI HẠN ĐỘ DÀI (Input Sanitization & Bounds)
    // ----------------------------------------------------
    const rawName = input.name?.trim() || "";
    if (!rawName || rawName.length < 2) {
      return { error: "Họ và tên phải có tối thiểu 2 ký tự." };
    }
    if (rawName.length > 100) {
      return { error: "Họ và tên không được vượt quá 100 ký tự." };
    }

    const rawContent = input.content?.trim() || "";
    if (!rawContent || rawContent.length < 10) {
      return { error: "Nội dung nhận xét quá ngắn (tối thiểu 10 ký tự)." };
    }
    if (rawContent.length > 2000) {
      return { error: "Nội dung nhận xét quá dài (tối đa 2000 ký tự)." };
    }

    const rawRole = input.role?.trim() || "";
    if (rawRole.length > 100) {
      return { error: "Chức danh / Công ty không được vượt quá 100 ký tự." };
    }

    // URL validation cho ảnh đại diện (Chống javascript: XSS vector)
    let safeImage: string | null = null;
    if (input.image?.trim()) {
      const imgUrl = input.image.trim();
      if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://") || imgUrl.startsWith("/")) {
        safeImage = imgUrl;
      } else {
        return { error: "Link ảnh đại diện không hợp lệ (phải bắt đầu bằng http:// hoặc https://)." };
      }
    }

    const safeRating = Math.min(5, Math.max(1, Math.floor(Number(input.rating) || 5)));
    const cleanName = sanitizeText(rawName);
    const cleanRole = rawRole ? sanitizeText(rawRole) : null;
    const cleanContent = sanitizeText(rawContent);

    // ----------------------------------------------------
    // E. LƯU AN TOÀN VÀO DB BẰNG PRISMA (Chống SQL Injection)
    // ----------------------------------------------------
    const testimonial = await prisma.testimonial.create({
      data: {
        name: cleanName,
        role: cleanRole,
        content: cleanContent,
        rating: safeRating,
        image: safeImage,
        isActive: false, // Luôn mặc định false - Chờ Admin duyệt
      },
    });

    // Cài đặt cookie rate-limiting cho trình duyệt
    cookieStore.set("mvpx_last_testimonial_submit", now.toString(), {
      maxAge: COOLDOWN_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    revalidatePath("/");
    revalidatePath("/admin/testimonials");

    return {
      success: true,
      data: testimonial,
      message: "Cảm ơn bạn đã gửi đánh giá! Nhận xét của bạn đã được gửi thành công và sẽ hiển thị sau khi Admin duyệt.",
    };
  } catch (error: any) {
    console.error("Error submitting public testimonial:", error);
    return { error: "Đã có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại sau." };
  }
}
