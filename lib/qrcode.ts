import QRCode from "qrcode";

/**
 * Sinh Data URL base64 chứa hình ảnh mã QR từ text
 * Độ tương phản cao, margin chuẩn để máy quét dễ đọc nhất
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 320,
      margin: 2,
      color: {
        dark: "#0f172a", // Slate-900 cho độ tương phản sắc nét
        light: "#ffffff",
      },
      errorCorrectionLevel: "H", // High error correction: mã vẫn quét được dù màn hình mờ/xước
    });
  } catch (error) {
    console.error("Lỗi khi sinh mã QR:", error);
    throw new Error("Không thể tạo mã QR cho vé.");
  }
}

/**
 * Sinh mã vé ngẫu nhiên định dạng dễ đọc: EVT-XXXX-YYYY
 */
export function generateTicketCode(prefix = "EVT"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Loại bỏ ký tự dễ nhầm lẫn như 0, O, 1, I
  let randomPart = "";
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${randomPart}`;
}
