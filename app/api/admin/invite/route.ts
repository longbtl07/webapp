import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTicketCode, generateQrDataUrl } from "@/lib/qrcode";
import { sendTicketEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      eventId,
      fullName,
      email,
      phoneNumber,
      department,
      role = "Khách mời VIP",
      customNote,
      pin,
    } = body;

    const expectedPin = process.env.ADMIN_PIN || "123456";
    if (pin && pin.trim() !== expectedPin) {
      return NextResponse.json(
        { success: false, message: "Mã PIN Quản trị không chính xác." },
        { status: 401 }
      );
    }

    if (!eventId || !fullName || !email || !phoneNumber || !department) {
      return NextResponse.json(
        { success: false, message: "Vui lòng điền đầy đủ các thông tin bắt buộc." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phoneNumber.trim().replace(/\s+/g, "");

    // Validate email & phone
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: "Địa chỉ email không hợp lệ." },
        { status: 400 }
      );
    }

    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Số điện thoại không hợp lệ (Vui lòng nhập 10 chữ số).",
        },
        { status: 400 }
      );
    }

    // Tìm sự kiện
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Sự kiện được chọn không tồn tại." },
        { status: 404 }
      );
    }

    // Kiểm tra trùng vé
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        eventId: event.id,
        email: cleanEmail,
      },
    });

    let ticket;
    if (existingTicket) {
      ticket = existingTicket;
    } else {
      // Sinh mã vé VIP
      let ticketCode = generateTicketCode("VIP");
      let isCodeTaken = await prisma.ticket.findUnique({ where: { ticketCode } });
      while (isCodeTaken) {
        ticketCode = generateTicketCode("VIP");
        isCodeTaken = await prisma.ticket.findUnique({ where: { ticketCode } });
      }

      ticket = await prisma.ticket.create({
        data: {
          eventId: event.id,
          ticketCode,
          fullName: fullName.trim(),
          email: cleanEmail,
          phoneNumber: cleanPhone,
          employeeId: role.trim(),
          department: department.trim(),
          status: "REGISTERED",
        },
      });
    }

    // Gửi email vé thật qua Resend Engine
    const qrDataUrl = await generateQrDataUrl(ticket.ticketCode);
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const ticketUrl = `${protocol}://${host}/tickets/${ticket.ticketCode}`;

    const startDateStr = new Date(event.startDate).toLocaleString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const emailResult = await sendTicketEmail(cleanEmail, {
      recipientName: ticket.fullName,
      ticketCode: ticket.ticketCode,
      eventTitle: event.title,
      eventLocation: event.location,
      startDateStr,
      ticketUrl,
      qrDataUrl,
      department: ticket.department,
      employeeId: ticket.employeeId,
    });

    return NextResponse.json({
      success: true,
      message: `Đã phát hành vé và gửi thư mời thành công tới hòm thư ${cleanEmail}!`,
      ticketCode: ticket.ticketCode,
      ticketUrl,
      emailResult,
    });
  } catch (error: unknown) {
    console.error("Lỗi gửi lời mời dự án:", error);
    const msg = error instanceof Error ? error.message : "Lỗi hệ thống khi gửi lời mời.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
