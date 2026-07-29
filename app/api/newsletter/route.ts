import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendRegisterNotification } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email không hợp lệ" },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email },
    });

    if (existing) {
      if (!existing.isActive) {
        // Re-activate
        await prisma.newsletterSubscription.update({
          where: { email },
          data: { isActive: true },
        });

        sendRegisterNotification({ email, name: "Đăng ký nhận tin tức" }).catch(() => {});

        return NextResponse.json({ message: "Đăng ký nhận tin thành công!" });
      }
      return NextResponse.json(
        { error: "Email này đã được đăng ký nhận tin." },
        { status: 400 }
      );
    }

    // Create new
    await prisma.newsletterSubscription.create({
      data: { email },
    });

    sendRegisterNotification({ email, name: "Đăng ký nhận tin tức" }).catch(() => {});

    return NextResponse.json(
      { message: "Đăng ký nhận tin thành công!" },
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

