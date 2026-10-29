import nodemailer from "nodemailer";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { generateTicketEmailHtml, TicketEmailData } from "./email-template";

export type EmailProviderType = "resend" | "smtp" | "mock";

export interface EmailSettingsConfig {
  provider: EmailProviderType;
  resendApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  fromEmail: string;
  fromName: string;
}

const SETTING_KEY = "EMAIL_SETTINGS";

/**
 * Lấy cấu hình email hiện tại: ưu tiên từ Database SystemSetting, fallback về .env
 */
export async function getEmailConfig(): Promise<EmailSettingsConfig> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: SETTING_KEY },
    });

    if (setting && setting.value) {
      return JSON.parse(setting.value);
    }
  } catch (err) {
    console.warn("Chưa đọc được email setting từ DB, dùng fallback env:", err);
  }

  // Fallback từ biến môi trường
  const provider = (process.env.EMAIL_PROVIDER as EmailProviderType) || "mock";
  return {
    provider,
    resendApiKey: process.env.RESEND_API_KEY || "",
    smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
    smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465,
    smtpSecure: process.env.SMTP_SECURE === "true" || true,
    smtpUser: process.env.SMTP_USER || "",
    smtpPass: process.env.SMTP_PASS || "",
    fromEmail: process.env.EMAIL_FROM_ADDRESS || "events@intergreat.com",
    fromName: process.env.EMAIL_FROM_NAME || "InterGreat Education Group",
  };
}

/**
 * Lưu cấu hình email mới vào Database
 */
export async function saveEmailConfig(config: EmailSettingsConfig): Promise<void> {
  await prisma.systemSetting.upsert({
    where: { key: SETTING_KEY },
    create: {
      key: SETTING_KEY,
      value: JSON.stringify(config),
    },
    update: {
      value: JSON.stringify(config),
    },
  });
}

/**
 * Gửi email vé tham dự sự kiện
 */
export async function sendTicketEmail(
  toEmail: string,
  ticketData: TicketEmailData
): Promise<{ success: boolean; message: string; previewUrl?: string }> {
  const config = await getEmailConfig();
  const htmlContent = generateTicketEmailHtml(ticketData);
  const subject = `[Vé Sự Kiện] ${ticketData.eventTitle} — InterGreat Education Group`;

  const sender = `"${config.fromName}" <${config.fromEmail}>`;

  // 1. Chế độ Mock / Preview (Không tốn quota)
  if (config.provider === "mock") {
    console.log("==========================================");
    console.log(`[MOCK EMAIL SENT] Đến: ${toEmail}`);
    console.log(`Tiêu đề: ${subject}`);
    console.log(`Mã vé: ${ticketData.ticketCode} | Sự kiện: ${ticketData.eventTitle}`);
    console.log(`Link vé: ${ticketData.ticketUrl}`);
    console.log("==========================================");
    return {
      success: true,
      message: `[Mô phỏng] Đã ghi nhận gửi email vé tới ${toEmail} (Chế độ Mock).`,
    };
  }

  // 2. Chế độ Resend API
  if (config.provider === "resend") {
    if (!config.resendApiKey) {
      throw new Error("Chưa cấu hình RESEND_API_KEY.");
    }
    const resend = new Resend(config.resendApiKey);

    const { data, error } = await resend.emails.send({
      from: config.fromEmail.includes("<") ? config.fromEmail : sender,
      to: [toEmail],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error("Lỗi Resend:", error);
      throw new Error(error.message);
    }

    return {
      success: true,
      message: `Đã gửi email vé thành công qua Resend (ID: ${data?.id})`,
    };
  }

  // 3. Chế độ SMTP (Gmail, Outlook, Host công ty)
  if (config.provider === "smtp") {
    if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
      throw new Error("Chưa điền đủ thông tin SMTP (Host, User, Pass).");
    }

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort || 465,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: sender,
      to: toEmail,
      subject,
      html: htmlContent,
    });

    return {
      success: true,
      message: `Đã gửi email vé thành công qua SMTP (Message ID: ${info.messageId})`,
    };
  }

  return { success: false, message: "Provider email không được hỗ trợ." };
}

/**
 * Kiểm tra kết nối gửi email thử nghiệm (Test Connection)
 */
export async function testEmailConnection(
  targetEmail: string,
  testConfig: EmailSettingsConfig
): Promise<{ success: boolean; message: string }> {
  const subject = "Kiểm tra kết nối Email — InterGreat Education Group";
  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; background-color: #0f172a; color: #ffffff; border-radius: 12px; border: 1px solid #2cb696;">
      <h2 style="color: #2cb696; margin-top: 0;">Kết nối Email thành công!</h2>
      <p>Hệ thống Sự kiện InterGreat Education Group đã gửi thành công email thử nghiệm với cấu hình <strong>${testConfig.provider.toUpperCase()}</strong>.</p>
      <p style="color: #94a3b8; font-size: 13px;">Thời gian thử nghiệm: ${new Date().toLocaleString("vi-VN")}</p>
    </div>
  `;

  const sender = `"${testConfig.fromName}" <${testConfig.fromEmail}>`;

  if (testConfig.provider === "mock") {
    return {
      success: true,
      message: `[Mô phỏng] Kiểm tra kết nối thành công tới ${targetEmail} (Chế độ Mock).`,
    };
  }

  if (testConfig.provider === "resend") {
    if (!testConfig.resendApiKey) throw new Error("Vui lòng nhập Resend API Key.");
    const resend = new Resend(testConfig.resendApiKey);
    const { error } = await resend.emails.send({
      from: testConfig.fromEmail.includes("<") ? testConfig.fromEmail : sender,
      to: [targetEmail],
      subject,
      html: htmlContent,
    });
    if (error) throw new Error(error.message);
    return { success: true, message: `Gửi email thử nghiệm thành công qua Resend tới ${targetEmail}!` };
  }

  if (testConfig.provider === "smtp") {
    if (!testConfig.smtpHost || !testConfig.smtpUser || !testConfig.smtpPass) {
      throw new Error("Vui lòng điền đầy đủ SMTP Host, User và Mật khẩu ứng dụng.");
    }
    const transporter = nodemailer.createTransport({
      host: testConfig.smtpHost,
      port: testConfig.smtpPort || 465,
      secure: testConfig.smtpPort === 465,
      auth: {
        user: testConfig.smtpUser,
        pass: testConfig.smtpPass,
      },
    });

    await transporter.verify();
    await transporter.sendMail({
      from: sender,
      to: targetEmail,
      subject,
      html: htmlContent,
    });

    return { success: true, message: `Gửi email thử nghiệm thành công qua SMTP tới ${targetEmail}!` };
  }

  return { success: false, message: "Provider không hợp lệ." };
}
