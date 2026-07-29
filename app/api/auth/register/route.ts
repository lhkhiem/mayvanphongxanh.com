import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendRegisterNotification } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ Họ tên, Email và Mật khẩu." },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Địa chỉ email không hợp lệ." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự." },
        { status: 400 }
      );
    }

    // 1. Kiểm tra xem Email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email này đã được đăng ký tài khoản. Vui lòng đăng nhập hoặc dùng email khác." },
        { status: 400 }
      );
    }

    // 2. Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Tạo tài khoản User mới
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // 4. Đồng bộ tạo Customer profile (nếu có SĐT)
    if (phone) {
      const existingCustomer = await prisma.customer.findFirst({
        where: { OR: [{ phone }, { email }] },
      });

      if (!existingCustomer) {
        await prisma.customer.create({
          data: {
            name,
            email,
            phone,
            userId: newUser.id,
          },
        });
      } else if (!existingCustomer.userId) {
        await prisma.customer.update({
          where: { id: existingCustomer.id },
          data: { userId: newUser.id },
        });
      }
    }

    // 5. Gửi email thông báo chào mừng & thông báo Admin
    sendRegisterNotification({
      name,
      email,
      phone,
    }).catch((err) => {
      console.error("[Register API] Lỗi gửi email chào mừng đăng ký:", err);
    });

    return NextResponse.json(
      { message: "Đăng ký tài khoản thành công!", userId: newUser.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Register API] Lỗi xử lý đăng ký:", error);
    return NextResponse.json(
      { error: "Đã có lỗi hệ thống xảy ra. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
