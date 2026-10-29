import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl } from "@/lib/qrcode";
import { sendTicketEmail } from "@/lib/email";

function verifyAdminPin(pin?: string | null): boolean {
  const expected = (process.env.ADMIN_PIN || "123456").trim();
  return !!pin && pin.trim() === expected;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, pin } = body;

    if (!verifyAdminPin(pin)) {
      return NextResponse.json(
        { success: false, message: "Mã PIN Quản trị không chính xác." },
        { status: 401 }
      );
    }

    if (!ticketId) {
      return NextResponse.json(
        { success: false, message: "Thiếu ticketId." },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy vé trong hệ thống." },
        { status: 404 }
      );
    }

    const qrDataUrl = await generateQrDataUrl(ticket.ticketCode);
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const ticketUrl = `${protocol}://${host}/tickets/${ticket.ticketCode}`;

    const startDateStr = new Date(ticket.event.startDate).toLocaleString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const result = await sendTicketEmail(ticket.email, {
      recipientName: ticket.fullName,
      ticketCode: ticket.ticketCode,
      eventTitle: ticket.event.title,
      eventLocation: ticket.event.location,
      startDateStr,
      ticketUrl,
      qrDataUrl,
      department: ticket.department,
      employeeId: ticket.employeeId,
    });

    return NextResponse.json({
      success: true,
      message: `Đã gửi lại vé thành công đến ${ticket.email}!`,
      data: result,
    });
  } catch (error: unknown) {
    console.error("Lỗi khi gửi lại vé:", error);
    const msg = error instanceof Error ? error.message : "Không thể gửi lại vé.";
    return NextResponse.json(
      { success: false, message: msg },
      { status: 500 }
    );
  }
}
