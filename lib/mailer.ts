import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";

export interface SmtpConfig {
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_pass: string;
  smtp_secure: string; // 'tls' | 'ssl' | 'none'
  smtp_from_name: string;
  smtp_from_email: string;
  admin_receive_email: string;
  email_notify_contact: string; // 'true' | 'false'
  email_notify_register: string; // 'true' | 'false'
}

export async function getSmtpConfig(): Promise<SmtpConfig> {
  const keys = [
    "smtp_host",
    "smtp_port",
    "smtp_user",
    "smtp_pass",
    "smtp_secure",
    "smtp_from_name",
    "smtp_from_email",
    "admin_receive_email",
    "email_notify_contact",
    "email_notify_register",
  ];

  const settings = await prisma.setting.findMany({
    where: { key: { in: keys } },
  });

  const map: Record<string, string> = {};
  settings.forEach((s) => {
    map[s.key] = s.value;
  });

  return {
    smtp_host: map["smtp_host"] || process.env.SMTP_HOST || "smtp.gmail.com",
    smtp_port: map["smtp_port"] || process.env.SMTP_PORT || "587",
    smtp_user: map["smtp_user"] || process.env.SMTP_USER || "",
    smtp_pass: map["smtp_pass"] || process.env.SMTP_PASS || "",
    smtp_secure: map["smtp_secure"] || "tls",
    smtp_from_name: map["smtp_from_name"] || map["company_name"] || "Máy Văn Phòng Xanh",
    smtp_from_email: map["smtp_from_email"] || map["smtp_user"] || process.env.SMTP_FROM || "",
    admin_receive_email: map["admin_receive_email"] || map["contact_email"] || map["smtp_user"] || "",
    email_notify_contact: map["email_notify_contact"] ?? "true",
    email_notify_register: map["email_notify_register"] ?? "true",
  };
}

export async function createTransporter(config?: SmtpConfig) {
  const smtp = config || (await getSmtpConfig());

  if (!smtp.smtp_user || !smtp.smtp_pass) {
    return null;
  }

  const port = parseInt(smtp.smtp_port, 10) || 587;
  const isSecure = smtp.smtp_secure === "ssl" || port === 465;

  return nodemailer.createTransport({
    host: smtp.smtp_host,
    port: port,
    secure: isSecure,
    auth: {
      user: smtp.smtp_user,
      pass: smtp.smtp_pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  try {
    const config = await getSmtpConfig();
    const transporter = await createTransporter(config);

    if (!transporter) {
      console.warn("[Mailer] SMTP chưa được cấu hình (thiếu User hoặc Password).");
      return { success: false, error: "SMTP chưa được cấu hình tài khoản gửi email." };
    }

    const fromAddress = config.smtp_from_email || config.smtp_user;
    const fromHeader = `"${config.smtp_from_name}" <${fromAddress}>`;

    const info = await transporter.sendMail({
      from: fromHeader,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ""),
      html,
    });

    console.log("[Mailer] Email đã gửi thành công ID:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("[Mailer] Lỗi khi gửi mail:", error);
    return { success: false, error: error.message || "Không thể gửi email." };
  }
}

export async function sendTestEmail(toEmail: string) {
  const subject = "🧪 [Máy Văn Phòng Xanh] Email kiểm tra kết nối SMTP";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; rounded: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="background-color: #16a34a; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 20px;">Máy Văn Phòng Xanh - Kiểm Tra SMTP</h2>
      </div>
      <div style="padding: 24px; color: #334155; line-height: 1.6;">
        <p>Xin chào,</p>
        <p>Đây là email tự động được gửi từ hệ thống <strong>Máy Văn Phòng Xanh</strong> để kiểm tra cấu hình SMTP dịch vụ gửi mail.</p>
        <div style="background-color: #f8fafc; border-left: 4px solid #16a34a; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-weight: bold; color: #16a34a;">✅ Kết nối SMTP thành công!</p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Thời gian gửi: ${new Date().toLocaleString("vi-VN")}</p>
        </div>
        <p>Nếu bạn nhận được email này, tính năng gửi email tự động trên website đã hoạt động chính xác.</p>
      </div>
      <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
        © ${new Date().getFullYear()} Máy Văn Phòng Xanh. All rights reserved.
      </div>
    </div>
  `;

  return await sendEmail({ to: toEmail, subject, html });
}

export async function sendContactNotification(contactData: {
  name: string;
  phone: string;
  service: string;
  message: string;
  email?: string;
}) {
  const config = await getSmtpConfig();

  if (config.email_notify_contact === "false") {
    console.log("[Mailer] Thông báo email cho Form Liên hệ đang tắt trong Cài đặt.");
    return { success: false, reason: "disabled" };
  }

  const adminEmail = config.admin_receive_email;
  let adminResult = { success: false };

  // 1. Email thông báo gửi cho Admin
  if (adminEmail) {
    const adminSubject = `📩 [Liên Hệ Mới] Từ khách hàng ${contactData.name} - ${contactData.phone}`;
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #0f172a; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px; text-transform: uppercase;">Yêu Cầu Liên Hệ Mới</h2>
        </div>
        <div style="padding: 24px; color: #334155; font-size: 14px; line-height: 1.6;">
          <p style="font-size: 15px;">Hệ thống vừa nhận được thông tin liên hệ mới từ khách hàng:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 30%;">Họ và tên:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${contactData.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Số điện thoại:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;"><a href="tel:${contactData.phone}" style="color: #16a34a; font-weight: bold; text-decoration: none;">${contactData.phone}</a></td>
            </tr>
            ${
              contactData.email
                ? `
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0;"><a href="mailto:${contactData.email}" style="color: #2563eb;">${contactData.email}</a></td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Nhu cầu / Dịch vụ:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #d97706; font-weight: bold;">${contactData.service}</td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; vertical-align: top;">Nội dung lời nhắn:</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; white-space: pre-line;">${contactData.message}</td>
            </tr>
          </table>
          <p style="margin-top: 20px; font-size: 12px; color: #64748b;">Vui lòng kiểm tra và liên hệ phản hồi cho khách hàng sớm nhất có thể.</p>
        </div>
      </div>
    `;

    adminResult = await sendEmail({ to: adminEmail, subject: adminSubject, html: adminHtml });
  }

  // 2. Email cảm ơn gửi cho Khách hàng (nếu khách hàng có cung cấp Email)
  if (contactData.email) {
    const userSubject = `[Máy Văn Phòng Xanh] Cảm ơn bạn đã liên hệ với chúng tôi`;
    const userHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #16a34a; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">Cảm Ơn Bạn Đã Liên Hệ!</h2>
        </div>
        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <p>Kính gửi <strong>${contactData.name}</strong>,</p>
          <p>Máy Văn Phòng Xanh đã nhận được yêu cầu tư vấn của bạn với nội dung:</p>
          <blockquote style="background-color: #f8fafc; border-left: 4px solid #16a34a; margin: 16px 0; padding: 12px 16px; font-style: italic; color: #475569;">
            "${contactData.message}"
          </blockquote>
          <p>Đội ngũ chuyên viên tư vấn của chúng tôi sẽ xem xét thông tin và gọi lại cho bạn qua số điện thoại <strong>${contactData.phone}</strong> trong thời gian sớm nhất.</p>
          <p style="margin-top: 24px;">Trân trọng,<br/><strong>Đội ngũ Máy Văn Phòng Xanh</strong></p>
        </div>
      </div>
    `;

    await sendEmail({ to: contactData.email, subject: userSubject, html: userHtml });
  }

  return adminResult;
}

export async function sendRegisterNotification(userData: {
  name?: string | null;
  email: string;
  phone?: string | null;
}) {
  const config = await getSmtpConfig();

  if (config.email_notify_register === "false") {
    console.log("[Mailer] Thông báo email khi Đăng ký tài khoản đang tắt trong Cài đặt.");
    return { success: false, reason: "disabled" };
  }

  const displayName = userData.name || userData.email;
  const adminEmail = config.admin_receive_email;

  // 1. Gửi thông báo cho Admin
  if (adminEmail) {
    const adminSubject = `👤 [Thành Viên Mới] Khách hàng ${displayName} vừa đăng ký tài khoản`;
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #2563eb; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">Có Thành Viên Mới Đăng Ký</h2>
        </div>
        <div style="padding: 24px; color: #334155; line-height: 1.6;">
          <p>Website vừa ghi nhận 1 tài khoản đăng ký thành công:</p>
          <ul>
            <li><strong>Họ và tên:</strong> ${userData.name || "Chưa cập nhật"}</li>
            <li><strong>Email:</strong> ${userData.email}</li>
            ${userData.phone ? `<li><strong>Số điện thoại:</strong> ${userData.phone}</li>` : ""}
            <li><strong>Thời gian:</strong> ${new Date().toLocaleString("vi-VN")}</li>
          </ul>
        </div>
      </div>
    `;
    await sendEmail({ to: adminEmail, subject: adminSubject, html: adminHtml });
  }

  // 2. Gửi email chào mừng thành viên mới
  const welcomeSubject = `🎉 Chào mừng ${displayName} đến với Máy Văn Phòng Xanh!`;
  const welcomeHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #16a34a; color: #ffffff; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px;">Chào Mừng Bạn!</h1>
      </div>
      <div style="padding: 24px; color: #334155; line-height: 1.6;">
        <p>Xin chào <strong>${displayName}</strong>,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Máy Văn Phòng Xanh</strong>!</p>
        <p>Tài khoản của bạn đã được khởi tạo thành công với email: <strong>${userData.email}</strong>.</p>
        <p>Bây giờ bạn có thể trải nghiệm đầy đủ các dịch vụ, theo dõi đơn hàng, yêu cầu hỗ trợ kỹ thuật và tra cứu bảo hành dễ dàng.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${process.env.NEXTAUTH_URL || "https://mayvanphongxanh.com"}/dang-nhap" style="background-color: #16a34a; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Đăng Nhập Ngay</a>
        </div>
        <p style="margin-top: 24px;">Nếu có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ hotline CSKH của chúng tôi.</p>
        <p>Trân trọng,<br/><strong>Đội ngũ Máy Văn Phòng Xanh</strong></p>
      </div>
    </div>
  `;

  return await sendEmail({ to: userData.email, subject: welcomeSubject, html: welcomeHtml });
}
