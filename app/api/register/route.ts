import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTicketCode } from "@/lib/qrcode";
import { RegisterRequestBody } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body: RegisterRequestBody = await req.json();
    const { eventSlug, fullName, email, phoneNumber, employeeId, department } = body;

    // 1. Kiểm tra các trường bắt buộc
    if (!eventSlug || !fullName || !email || !phoneNumber || !employeeId || !department) {
      return NextResponse.json(
        { success: false, message: "Vui lòng điền đầy đủ tất cả các trường thông tin." },
        { status: 400 }
      );
    }

    // 2. Chuẩn hóa dữ liệu
    const cleanEmail = email.trim().toLowerCase();
    const cleanEmpId = employeeId.trim().toUpperCase();
    const cleanPhone = phoneNumber.trim().replace(/\s+/g, "");
    const cleanName = fullName.trim();
    const cleanDept = department.trim();

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: "Địa chỉ email không hợp lệ (ví dụ: ten@company.com)." },
        { status: 400 }
      );
    }

    // Kiểm tra định dạng số điện thoại Việt Nam (10 chữ số)
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại di động gồm 10 chữ số (ví dụ: 0912345678).",
        },
        { status: 400 }
      );
    }

    // 3. Tìm sự kiện
    const event = await prisma.event.findUnique({
      where: { slug: eventSlug },
      include: {
        _count: {
          select: { tickets: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Sự kiện không tồn tại hoặc đã bị xóa." },
        { status: 404 }
      );
    }

    if (!event.isActive) {
      return NextResponse.json(
        { success: false, message: "Sự kiện hiện đang tạm đóng cổng đăng ký." },
        { status: 400 }
      );
    }

    // 4. Kiểm tra sức chứa (nếu có giới hạn)
    if (event.capacity && event._count.tickets >= event.capacity) {
      return NextResponse.json(
        {
          success: false,
          message: `Rất tiếc! Sự kiện đã đạt số lượng tối đa (${event.capacity} người tham dự).`,
        },
        { status: 400 }
      );
    }

    // 5. Kiểm tra trùng lặp email hoặc mã nhân viên
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        eventId: event.id,
        OR: [{ email: cleanEmail }, { employeeId: cleanEmpId }],
      },
    });

    if (existingTicket) {
      if (existingTicket.email === cleanEmail) {
        return NextResponse.json(
          {
            success: false,
            message: `Email "${cleanEmail}" đã được dùng để đăng ký vé trước đó. Bạn có thể tra cứu mã vé: ${existingTicket.ticketCode}`,
            ticketCode: existingTicket.ticketCode,
          },
          { status: 409 }
        );
      }
      if (existingTicket.employeeId === cleanEmpId) {
        return NextResponse.json(
          {
            success: false,
            message: `Mã nhân viên "${cleanEmpId}" đã được đăng ký cho sự kiện này.`,
            ticketCode: existingTicket.ticketCode,
          },
          { status: 409 }
        );
      }
    }

    // 6. Sinh mã vé duy nhất (chống trùng lặp mã vé)
    let ticketCode = generateTicketCode();
    let isCodeTaken = await prisma.ticket.findUnique({ where: { ticketCode } });
    while (isCodeTaken) {
      ticketCode = generateTicketCode();
      isCodeTaken = await prisma.ticket.findUnique({ where: { ticketCode } });
    }

    // 7. Tạo vé trong database
    const newTicket = await prisma.ticket.create({
      data: {
        eventId: event.id,
        ticketCode,
        fullName: cleanName,
        email: cleanEmail,
        phoneNumber: cleanPhone,
        employeeId: cleanEmpId,
        department: cleanDept,
        status: "REGISTERED",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Đăng ký tham dự thành công!",
        ticketCode: newTicket.ticketCode,
        ticketId: newTicket.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lỗi khi xử lý đăng ký:", error);
    return NextResponse.json(
      { success: false, message: "Đã xảy ra lỗi trên hệ thống máy chủ. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
