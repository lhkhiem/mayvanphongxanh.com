import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendContactNotification } from "@/lib/mailer";
import { cookies } from "next/headers";
import { verifyCaptchaToken } from "@/lib/captcha";

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
    const { name, phone, service, message, email, honeypot, captchaToken, captchaAnswer } = data;

    // 1. Honeypot check
    if (honeypot && honeypot.trim() !== "") {
      return NextResponse.json({ message: "Gửi yêu cầu thành công!" }, { status: 200 });
    }

    // 2. Captcha verification
    const captchaResult = verifyCaptchaToken(captchaToken, captchaAnswer);
    if (!captchaResult.valid) {
      return NextResponse.json(
        { error: captchaResult.error || "Xác minh CAPTCHA không hợp lệ." },
        { status: 400 }
      );
    }

    // 3. Required fields validation
    if (!name || !String(name).trim() || !phone || !String(phone).trim() || !message || !String(message).trim()) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ Họ tên, Số điện thoại và Nội dung." },
        { status: 400 }
      );
    }

    const rawName = String(name).trim();
    if (rawName.length < 2) {
      return NextResponse.json(
        { error: "Họ và tên phải chứa tối thiểu 2 ký tự." },
        { status: 400 }
      );
    }

    // 4. Phone validation (Vietnamese phone standard: 10 digits starting with 0, e.g. 03x, 05x, 07x, 08x, 09x)
    const cleanPhoneDigits = String(phone).replace(/\s+|-|\./g, "");
    const phoneRegex = /^(0[35789])\d{8}$|^0\d{9}$/;
    if (!phoneRegex.test(cleanPhoneDigits)) {
      return NextResponse.json(
        { error: "Số điện thoại không đúng định dạng (phải có 10 chữ số và bắt đầu bằng số 0, ví dụ: 0987654321)." },
        { status: 400 }
      );
    }

    // 5. Email validation (if provided)
    let cleanEmail: string | undefined = undefined;
    if (email && String(email).trim() !== "") {
      const rawEmail = String(email).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(rawEmail)) {
        return NextResponse.json(
          { error: "Email không đúng định dạng. Ví dụ hợp lệ: name@example.com" },
          { status: 400 }
        );
      }
      cleanEmail = sanitizeText(rawEmail).slice(0, 100);
    }

    const cleanName = sanitizeText(rawName).slice(0, 100);
    const cleanPhone = sanitizeText(cleanPhoneDigits).slice(0, 20);
    const cleanService = sanitizeText(String(service || "Báo giá sản phẩm").trim()).slice(0, 100);
    const cleanMessage = sanitizeText(String(message).trim()).slice(0, 2000);

    if (cleanMessage.length < 10) {
      return NextResponse.json(
        { error: "Nội dung yêu cầu quá ngắn (tối thiểu 10 ký tự)." },
        { status: 400 }
      );
    }

    // 6. Save record to DB via Prisma
    const contactRequest = await prisma.contactRequest.create({
      data: {
        name: cleanName,
        phone: cleanPhone,
        service: cleanService,
        message: cleanMessage,
      },
    });

    // 7. Set rate limit cookie
    cookieStore.set("mvpx_last_contact_submit", now.toString(), {
      maxAge: 60,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    // 8. Send notification email
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
      { message: "Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.", data: contactRequest },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact Request Error:", error);
    return NextResponse.json(
      { error: "Đã có lỗi hệ thống xảy ra. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
