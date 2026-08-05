import crypto from "crypto";

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || "mvpx-security-captcha-secret-key-2026";

export interface CaptchaChallenge {
  num1: number;
  num2: number;
  token: string;
}

export function generateCaptchaChallenge(): CaptchaChallenge {
  const num1 = Math.floor(Math.random() * 9) + 1; // 1-9
  const num2 = Math.floor(Math.random() * 9) + 1; // 1-9
  const timestamp = Date.now();

  const dataToSign = `${num1}:${num2}:${timestamp}`;
  const hmac = crypto.createHmac("sha256", CAPTCHA_SECRET).update(dataToSign).digest("hex");
  const token = `${dataToSign}:${hmac}`;

  return { num1, num2, token };
}

export function verifyCaptchaToken(
  captchaToken: string | undefined | null,
  captchaAnswer: string | undefined | null
): { valid: boolean; error?: string } {
  if (!captchaToken || !captchaAnswer) {
    return { valid: false, error: "Vui lòng nhập kết quả xác minh CAPTCHA." };
  }

  const parts = captchaToken.split(":");
  if (parts.length !== 4) {
    return { valid: false, error: "Mã xác minh CAPTCHA không hợp lệ." };
  }

  const [num1Str, num2Str, timestampStr, signature] = parts;
  const num1 = parseInt(num1Str, 10);
  const num2 = parseInt(num2Str, 10);
  const timestamp = parseInt(timestampStr, 10);

  // 1. Check HMAC signature
  const expectedData = `${num1Str}:${num2Str}:${timestampStr}`;
  const expectedHmac = crypto.createHmac("sha256", CAPTCHA_SECRET).update(expectedData).digest("hex");

  if (signature !== expectedHmac) {
    return { valid: false, error: "Mã xác minh CAPTCHA không hợp lệ hoặc đã bị can thiệp." };
  }

  // 2. Check expiration (10 minutes)
  if (isNaN(timestamp) || Date.now() - timestamp > 10 * 60 * 1000) {
    return { valid: false, error: "Mã CAPTCHA đã hết hạn. Vui lòng thử lại với phép tính mới!" };
  }

  // 3. Check math answer
  const userAnswer = parseInt(captchaAnswer.trim(), 10);
  if (isNaN(userAnswer) || userAnswer !== num1 + num2) {
    return { valid: false, error: "Kết quả phép tính CAPTCHA không chính xác." };
  }

  return { valid: true };
}
