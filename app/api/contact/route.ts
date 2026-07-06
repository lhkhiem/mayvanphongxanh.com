import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, phone, service, message } = data;

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ họ tên, số điện thoại và nội dung." },
        { status: 400 }
      );
    }

    // Create new contact request
    const contactRequest = await prisma.contactRequest.create({
      data: {
        name,
        phone,
        service: service || "Khác",
        message,
      },
    });

    return NextResponse.json(
      { message: "Gửi yêu cầu thành công!", data: contactRequest },
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
