export interface TicketEmailData {
  recipientName: string;
  ticketCode: string;
  eventTitle: string;
  eventLocation: string;
  startDateStr: string;
  ticketUrl: string;
  qrDataUrl: string;
  department: string;
  employeeId: string;
}

export function generateTicketEmailHtml(data: TicketEmailData): string {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vé Tham Dự Sự Kiện: ${data.eventTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #0f172a; border-radius: 20px; border: 1px solid rgba(44, 182, 150, 0.3); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Top Brand Header -->
          <tr>
            <td align="center" style="padding: 28px 20px 20px 20px; background-color: #0b1120; border-bottom: 1px solid #1e293b;">
              <div style="background-color: #ffffff; padding: 8px 16px; border-radius: 12px; display: inline-block;">
                <span style="font-size: 16px; font-weight: 800; color: #334155; letter-spacing: 0.5px;">
                  Inter<span style="color: #2cb696;">Great</span>
                </span>
                <span style="font-size: 9px; display: block; color: #64748b; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700;">EDUCATION GROUP</span>
              </div>
              <h2 style="margin: 16px 0 0 0; font-size: 18px; color: #ffffff; font-weight: 700;">VÉ THAM DỰ SỰ KIỆN</h2>
            </td>
          </tr>

          <!-- Event Title & Greeting -->
          <tr>
            <td style="padding: 24px 30px 10px 30px;">
              <p style="margin: 0 0 12px 0; font-size: 15px; color: #94a3b8;">
                Xin chào <strong style="color: #ffffff;">${data.recipientName}</strong>,
              </p>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                Bạn đã đăng ký thành công vé tham dự sự kiện của <strong>InterGreat Education Group</strong>:
              </p>
              <div style="margin: 16px 0; padding: 14px 18px; background-color: #1e293b; border-left: 4px solid #2cb696; border-radius: 8px;">
                <h3 style="margin: 0 0 6px 0; font-size: 16px; color: #ffffff;">${data.eventTitle}</h3>
                <p style="margin: 0 0 4px 0; font-size: 13px; color: #94a3b8;">⏰ <strong>Thời gian:</strong> ${data.startDateStr}</p>
                <p style="margin: 0; font-size: 13px; color: #94a3b8;">📍 <strong>Địa điểm:</strong> ${data.eventLocation}</p>
              </div>
            </td>
          </tr>

          <!-- QR Code Section -->
          <tr>
            <td align="center" style="padding: 10px 30px 20px 30px;">
              <div style="background-color: #ffffff; padding: 14px; border-radius: 16px; display: inline-block; box-shadow: 0 8px 16px rgba(0,0,0,0.3);">
                <img src="${data.qrDataUrl}" alt="Mã QR Vé" width="200" height="200" style="display: block; border-radius: 8px;" />
              </div>
              <p style="margin: 12px 0 0 0; font-family: monospace; font-size: 18px; font-weight: bold; color: #2cb696; letter-spacing: 2px;">
                ${data.ticketCode}
              </p>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">
                Xuất trình mã QR này tại bàn tiếp đón để nhân viên quét check-in
              </p>
            </td>
          </tr>

          <!-- Ticket Info Details -->
          <tr>
            <td style="padding: 0 30px 24px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b1120; border-radius: 12px; padding: 14px 18px; font-size: 12px; color: #94a3b8;">
                <tr>
                  <td style="padding: 4px 0;">Mã nhân viên: <strong style="color: #ffffff;">${data.employeeId}</strong></td>
                  <td style="padding: 4px 0; text-align: right;">Phòng ban: <strong style="color: #ffffff;">${data.department}</strong></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 0 30px 32px 30px;">
              <a href="${data.ticketUrl}" target="_blank" style="display: inline-block; background-color: #2cb696; color: #ffffff; text-decoration: none; padding: 13px 28px; border-radius: 12px; font-weight: 700; font-size: 14px; box-shadow: 0 6px 16px rgba(44, 182, 150, 0.3);">
                Xem Vé Điện Tử & Tải Về Máy →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 20px; background-color: #0b1120; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b;">
              <p style="margin: 0 0 4px 0;">© 2026 InterGreat Education Group. All rights reserved.</p>
              <p style="margin: 0;">Email này được gửi tự động từ Hệ thống Sự kiện InterGreat.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
