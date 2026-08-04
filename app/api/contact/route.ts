import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendContactNotification } from "@/lib/mailer";
import { cookies } from "next/headers";

function sanitizeText(str: string): string {
  if (!str) return "";
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export async function POST(request: Request) {
  try {
    // Rate limit (60s cooldown per browser)
    const cookieStore = await cookies();
    const lastSubmit = cookieStore.get("mvpx_last_contact_submit");
    const now = Date.now();

    if (lastSubmit) {
      const lastTime = parseInt(lastSubmit.value, 10);
      if (!isNaN(lastTime) && now - lastTime < 60 * 1000) {
        return NextResponse.json(
          { error: "Bạn gửi quá nhanh. Vui lòng thử lại sau 1 phút." },
          { status: 429 }
        );
      }
    }

    const data = await request.json();
    const { name, phone, service, message, email, honeypot } = data;

    // Honeypot check
    if (honeypot && honeypot.trim() !== "") {
      return NextResponse.json({ message: "Gửi yêu cầu thành công!" }, { status: 200 });
    }

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ Họ tên, Số điện thoại và Nội dung." },
        { status: 400 }
      );
    }

    const cleanName = sanitizeText(String(name).trim()).slice(0, 100);
    const cleanPhone = sanitizeText(String(phone).trim()).slice(0, 20);
    const cleanService = sanitizeText(String(service || "Khác").trim()).slice(0, 100);
    const cleanMessage = sanitizeText(String(message).trim()).slice(0, 2000);
    const cleanEmail = email ? sanitizeText(String(email).trim()).slice(0, 100) : undefined;

    // Create contact record in database via Prisma (Safe against SQL Injection)
    const contactRequest = await prisma.contactRequest.create({
      data: {
        name: cleanName,
        phone: cleanPhone,
        service: cleanService,
        message: cleanMessage,
      },
    });

    // Set rate limit cookie
    cookieStore.set("mvpx_last_contact_submit", now.toString(), {
      maxAge: 60,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    // Trigger email notification
    sendContactNotification({
      name: cleanName,
      phone: cleanPhone,
      service: cleanService,
      message: cleanMessage,
      email: cleanEmail,
    }).catch((err) => {
      console.error("[Contact Route] Lỗi gửi email thông báo:", err);
    });

    return NextResponse.json(
      { message: "Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ sớm nhất có thể.", data: contactRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact Request Error:", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
