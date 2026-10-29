import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pin = searchParams.get("pin");
    const eventSlug = searchParams.get("slug");

    // 1. Xác thực Admin PIN
    const expectedPin = process.env.ADMIN_PIN || "123456";
    if (!pin || pin.trim() !== expectedPin) {
      return NextResponse.json(
        { success: false, message: "Mã PIN Quản trị không chính xác." },
        { status: 401 }
      );
    }

    // Lấy danh sách tất cả sự kiện cho dropdown
    const allEvents = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        isActive: true,
        startDate: true,
      },
    });

    // 2. Lấy sự kiện đang xem
    const event = eventSlug
      ? await prisma.event.findUnique({ where: { slug: eventSlug } })
      : allEvents.length > 0
      ? await prisma.event.findUnique({ where: { id: allEvents[0].id } })
      : null;

    if (!event) {
      return NextResponse.json({
        success: true,
        data: {
          allEvents: [],
          event: null,
          stats: {
            totalRegistrations: 0,
            checkedInCount: 0,
            pendingCount: 0,
            attendanceRate: 0,
            capacity: null,
          },
          departmentStats: [],
          tickets: [],
        },
      });
    }

    // 3. Lấy tất cả vé của sự kiện
    const tickets = await prisma.ticket.findMany({
      where: { eventId: event.id },
      orderBy: [
        { checkedInAt: "desc" },
        { createdAt: "desc" },
      ],
    });

    const totalRegistrations = tickets.length;
    const checkedInCount = tickets.filter((t) => t.status === "CHECKED_IN").length;
    const pendingCount = totalRegistrations - checkedInCount;
    const attendanceRate =
      totalRegistrations > 0
        ? Math.round((checkedInCount / totalRegistrations) * 100)
        : 0;

    // 4. Thống kê theo phòng ban
    const deptMap: Record<string, { total: number; checkedIn: number }> = {};
    for (const t of tickets) {
      if (!deptMap[t.department]) {
        deptMap[t.department] = { total: 0, checkedIn: 0 };
      }
      deptMap[t.department].total += 1;
      if (t.status === "CHECKED_IN") {
        deptMap[t.department].checkedIn += 1;
      }
    }

    const departmentStats = Object.entries(deptMap).map(([name, data]) => ({
      name,
      total: data.total,
      checkedIn: data.checkedIn,
      rate: data.total > 0 ? Math.round((data.checkedIn / data.total) * 100) : 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        allEvents: allEvents.map((e) => ({
          id: e.id,
          title: e.title,
          slug: e.slug,
          isActive: e.isActive,
          startDate: e.startDate.toISOString(),
        })),
        event: {
          id: event.id,
          title: event.title,
          slug: event.slug,
          location: event.location,
          startDate: event.startDate,
          capacity: event.capacity,
          isActive: event.isActive,
        },
        stats: {
          totalRegistrations,
          checkedInCount,
          pendingCount,
          attendanceRate,
          capacity: event.capacity,
        },
        departmentStats,
        tickets: tickets.map((t) => ({
          id: t.id,
          ticketCode: t.ticketCode,
          fullName: t.fullName,
          email: t.email,
          phoneNumber: t.phoneNumber,
          employeeId: t.employeeId,
          department: t.department,
          status: t.status,
          checkedInAt: t.checkedInAt ? t.checkedInAt.toISOString() : null,
          checkedInBy: t.checkedInBy,
          createdAt: t.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê admin:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi lấy dữ liệu thống kê." },
      { status: 500 }
    );
  }
}

/**
 * Cập nhật thủ công trạng thái vé (check-in tay hoặc hoàn tác)
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, status, pin, operatorName } = body;

    const expectedPin = process.env.ADMIN_PIN || "123456";
    if (!pin || pin.trim() !== expectedPin) {
      return NextResponse.json(
        { success: false, message: "Mã PIN không chính xác." },
        { status: 401 }
      );
    }

    if (!ticketId || !status) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin ticketId hoặc status." },
        { status: 400 }
      );
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status,
        checkedInAt: status === "CHECKED_IN" ? new Date() : null,
        checkedInBy:
          status === "CHECKED_IN"
            ? operatorName || "Ban tổ chức (Thủ công)"
            : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật trạng thái vé thành: ${status}`,
      ticket: updated,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái vé:", error);
    return NextResponse.json(
      { success: false, message: "Không thể cập nhật trạng thái vé." },
      { status: 500 }
    );
  }
}
