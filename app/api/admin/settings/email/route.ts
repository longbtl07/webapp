import { NextResponse } from "next/server";
import { getEmailConfig, saveEmailConfig, testEmailConnection, EmailSettingsConfig } from "@/lib/email";

function verifyAdminPin(pin?: string | null): boolean {
  const expected = (process.env.ADMIN_PIN || "123456").trim();
  return !!pin && pin.trim() === expected;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pin = searchParams.get("pin");

    if (!verifyAdminPin(pin)) {
      return NextResponse.json(
        { success: false, message: "Mã PIN Quản trị không chính xác." },
        { status: 401 }
      );
    }

    const config = await getEmailConfig();

    // Ẩn mật khẩu khi trả về client
    return NextResponse.json({
      success: true,
      data: {
        ...config,
        smtpPass: config.smtpPass ? "••••••••••••" : "",
        hasSmtpPass: Boolean(config.smtpPass),
      },
    });
  } catch (error) {
    console.error("Lỗi khi đọc cấu hình email:", error);
    return NextResponse.json(
      { success: false, message: "Không thể tải cấu hình email." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pin, config, testEmail } = body;

    if (!verifyAdminPin(pin)) {
      return NextResponse.json(
        { success: false, message: "Mã PIN Quản trị không chính xác." },
        { status: 401 }
      );
    }

    if (!config || !config.provider) {
      return NextResponse.json(
        { success: false, message: "Dữ liệu cấu hình không hợp lệ." },
        { status: 400 }
      );
    }

    // Nếu mật khẩu giữ nguyên dạng che giấu "••••••••••••", giữ nguyên pass cũ trong DB
    const oldConfig = await getEmailConfig();
    const finalConfig: EmailSettingsConfig = {
      ...config,
      smtpPass:
        config.smtpPass && config.smtpPass !== "••••••••••••"
          ? config.smtpPass
          : oldConfig.smtpPass,
    };

    // Nếu là yêu cầu Test gửi mail
    if (testEmail) {
      try {
        const testResult = await testEmailConnection(testEmail.trim(), finalConfig);
        return NextResponse.json(testResult);
      } catch (testErr: unknown) {
        const msg = testErr instanceof Error ? testErr.message : "Kiểm tra kết nối thất bại.";
        return NextResponse.json(
          { success: false, message: `Lỗi kết nối: ${msg}` },
          { status: 400 }
        );
      }
    }

    // Lưu cấu hình vào Database
    await saveEmailConfig(finalConfig);

    return NextResponse.json({
      success: true,
      message: `Đã lưu và chuyển đổi phương thức gửi email sang: ${finalConfig.provider.toUpperCase()} thành công!`,
    });
  } catch (error: unknown) {
    console.error("Lỗi khi cập nhật cấu hình email:", error);
    const msg = error instanceof Error ? error.message : "Không thể lưu cấu hình.";
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}
