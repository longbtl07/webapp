import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function verifyAdminPin(pin?: string | null): boolean {
  const expected = process.env.ADMIN_PIN || "123456";
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

    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        tickets: {
          select: { id: true, status: true },
        },
      },
    });

    const formattedEvents = events.map((e) => {
      const totalTickets = e.tickets.length;
      const checkedInTickets = e.tickets.filter((t) => t.status === "CHECKED_IN").length;

      return {
        id: e.id,
        title: e.title,
        slug: e.slug,
        description: e.description,
        location: e.location,
        startDate: e.startDate.toISOString(),
        endDate: e.endDate ? e.endDate.toISOString() : null,
        capacity: e.capacity,
        isActive: e.isActive,
        createdAt: e.createdAt.toISOString(),
        totalTickets,
        checkedInTickets,
        attendanceRate: totalTickets > 0 ? Math.round((checkedInTickets / totalTickets) * 100) : 0,
      };
    });

    return NextResponse.json({ success: true, data: formattedEvents });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sự kiện:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi lấy danh sách sự kiện." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      pin,
      title,
      slug,
      description,
      location,
      startDate,
      endDate,
      capacity,
    } = body;

    if (!verifyAdminPin(pin)) {
      return NextResponse.json(
        { success: false, message: "Mã PIN Quản trị không chính xác." },
        { status: 401 }
      );
    }

    if (!title || !slug || !location || !startDate) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập đầy đủ: Tên sự kiện, Slug đường dẫn, Địa điểm và Thời gian bắt đầu." },
        { status: 400 }
      );
    }

    // Chuẩn hóa slug
    const cleanSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    const existingSlug = await prisma.event.findUnique({
      where: { slug: cleanSlug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { success: false, message: `Đường dẫn slug "${cleanSlug}" đã tồn tại. Vui lòng chọn slug khác.` },
        { status: 409 }
      );
    }

    const newEvent = await prisma.event.create({
      data: {
        title: title.trim(),
        slug: cleanSlug,
        description: description?.trim() || null,
        location: location.trim(),
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        capacity: capacity ? parseInt(capacity, 10) : null,
        isActive: true,
      },
    });

    return NextResponse.json(
      { success: true, message: "Tạo sự kiện mới thành công!", data: newEvent },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lỗi khi tạo sự kiện:", error);
    return NextResponse.json(
      { success: false, message: "Không thể tạo sự kiện. Vui lòng kiểm tra lại dữ liệu." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      pin,
      id,
      title,
      description,
      location,
      startDate,
      endDate,
      capacity,
      isActive,
    } = body;

    if (!verifyAdminPin(pin)) {
      return NextResponse.json(
        { success: false, message: "Mã PIN Quản trị không chính xác." },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Thiếu ID sự kiện cần cập nhật." },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (location !== undefined) updateData.location = location.trim();
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (capacity !== undefined) updateData.capacity = capacity ? parseInt(capacity, 10) : null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật sự kiện thành công!",
      data: updated,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật sự kiện:", error);
    return NextResponse.json(
      { success: false, message: "Không thể cập nhật sự kiện." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pin = searchParams.get("pin");
    const id = searchParams.get("id");

    if (!verifyAdminPin(pin)) {
      return NextResponse.json(
        { success: false, message: "Mã PIN Quản trị không chính xác." },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Thiếu ID sự kiện cần xóa." },
        { status: 400 }
      );
    }

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa sự kiện thành công.",
    });
  } catch (error) {
    console.error("Lỗi khi xóa sự kiện:", error);
    return NextResponse.json(
      { success: false, message: "Không thể xóa sự kiện." },
      { status: 500 }
    );
  }
}
