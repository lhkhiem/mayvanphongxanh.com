import { NextResponse } from "next/server";
import { generateCaptchaChallenge } from "@/lib/captcha";

export async function GET() {
  try {
    const challenge = generateCaptchaChallenge();
    return NextResponse.json(challenge);
  } catch (error) {
    console.error("[Captcha Route Error]:", error);
    return NextResponse.json({ error: "Lỗi tạo mã CAPTCHA." }, { status: 500 });
  }
}
