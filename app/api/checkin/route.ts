import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CheckinRequestBody, CheckinResponse } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body: CheckinRequestBody = await req.json();
    const { code, staffPin, operatorName } = body;

    // 1. Kiểm tra mã PIN nhân viên
    const expectedPin = process.env.STAFF_PIN || "8888";
    if (!staffPin || staffPin.trim() !== expectedPin) {
      return NextResponse.json<CheckinResponse>(
        {
          success: false,
          message: "Mã PIN đón tiếp không chính xác. Vui lòng kiểm tra lại.",
          codeStatus: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    if (!code || typeof code !== "string") {
      return NextResponse.json<CheckinResponse>(
        {
          success: false,
          message: "Vui lòng cung cấp mã vé để check-in.",
          codeStatus: "INVALID",
        },
        { status: 400 }
      );
    }

    // 2. Chuẩn hóa mã vé (Nếu quét trúng URL như https://domain/tickets/EVT-2026-XXXX, tách lấy phần mã vé)
    let cleanCode = code.trim();
    if (cleanCode.includes("/tickets/")) {
      const parts = cleanCode.split("/tickets/");
      cleanCode = parts[parts.length - 1].split("?")[0].split("/")[0].trim();
    }

    // 3. Tra cứu vé trong database
    const ticket = await prisma.ticket.findUnique({
      where: { ticketCode: cleanCode },
      include: { event: true },
    });

    if (!ticket) {
      return NextResponse.json<CheckinResponse>(
        {
          success: false,
          message: `Mã vé "${cleanCode}" không tồn tại trong hệ thống.`,
          codeStatus: "INVALID",
        },
        { status: 404 }
      );
    }

    // 4. Kiểm tra xem vé đã check-in trước đó chưa
    if (ticket.status === "CHECKED_IN") {
      const timeStr = ticket.checkedInAt
        ? new Date(ticket.checkedInAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : "trước đó";

      return NextResponse.json<CheckinResponse>(
        {
          success: false,
          message: `CẢNH BÁO: Vé này đã được check-in vào lúc ${timeStr}!`,
          codeStatus: "ALREADY_CHECKED_IN",
          ticket: {
            id: ticket.id,
            ticketCode: ticket.ticketCode,
            fullName: ticket.fullName,
            email: ticket.email,
            employeeId: ticket.employeeId,
            department: ticket.department,
            status: ticket.status,
            checkedInAt: ticket.checkedInAt ? ticket.checkedInAt.toISOString() : null,
            checkedInBy: ticket.checkedInBy,
            eventTitle: ticket.event.title,
          },
        },
        { status: 409 }
      );
    }

    // 5. Cập nhật trạng thái check-in thành công
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: "CHECKED_IN",
        checkedInAt: new Date(),
        checkedInBy: operatorName?.trim() || "Nhân viên tiếp đón",
      },
      include: { event: true },
    });

    return NextResponse.json<CheckinResponse>(
      {
        success: true,
        message: "Xác thực & Check-in thành công!",
        codeStatus: "VALID",
        ticket: {
          id: updatedTicket.id,
          ticketCode: updatedTicket.ticketCode,
          fullName: updatedTicket.fullName,
          email: updatedTicket.email,
          employeeId: updatedTicket.employeeId,
          department: updatedTicket.department,
          status: updatedTicket.status,
          checkedInAt: updatedTicket.checkedInAt ? updatedTicket.checkedInAt.toISOString() : null,
          checkedInBy: updatedTicket.checkedInBy,
          eventTitle: updatedTicket.event.title,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Lỗi khi xử lý check-in:", error);
    return NextResponse.json<CheckinResponse>(
      {
        success: false,
        message: "Lỗi hệ thống khi điểm danh vé.",
        codeStatus: "INVALID",
      },
      { status: 500 }
    );
  }
}
