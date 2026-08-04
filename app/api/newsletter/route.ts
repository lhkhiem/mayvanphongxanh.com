import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendRegisterNotification } from "@/lib/mailer";
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
    // Rate limit check (60s cooldown)
    const cookieStore = await cookies();
    const lastSubmit = cookieStore.get("mvpx_last_newsletter_submit");
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

    const { email, honeypot } = await request.json();

    // Honeypot check (Bẫy Bot)
    if (honeypot && honeypot.trim() !== "") {
      return NextResponse.json({ message: "Đăng ký nhận tin thành công!" }, { status: 200 });
    }

    const emailStr = String(email || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailStr || !emailRegex.test(emailStr) || emailStr.length > 150) {
      return NextResponse.json(
        { error: "Địa chỉ email không hợp lệ hoặc quá dài." },
        { status: 400 }
      );
    }

    const cleanEmail = sanitizeText(emailStr);

    // Check if already subscribed in DB via Prisma (Safe against SQL Injection)
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      if (!existing.isActive) {
        await prisma.newsletterSubscription.update({
          where: { email: cleanEmail },
          data: { isActive: true },
        });

        sendRegisterNotification({ email: cleanEmail, name: "Đăng ký nhận tin tức" }).catch(() => {});
        return NextResponse.json({ message: "Đăng ký nhận tin thành công!" });
      }

      return NextResponse.json(
        { error: "Email này đã được đăng ký nhận tin từ trước." },
        { status: 400 }
      );
    }

    // Create new subscription record
    await prisma.newsletterSubscription.create({
      data: { email: cleanEmail },
    });

    // Set rate limit cookie
    cookieStore.set("mvpx_last_newsletter_submit", now.toString(), {
      maxAge: 60,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    sendRegisterNotification({ email: cleanEmail, name: "Đăng ký nhận tin tức" }).catch(() => {});

    return NextResponse.json(
      { message: "Đăng ký nhận tin thành công! Cảm ơn bạn đã quan tâm." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Newsletter Subscription Error:", error);
    return NextResponse.json(
      { error: "Đã có lỗi xảy ra. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
