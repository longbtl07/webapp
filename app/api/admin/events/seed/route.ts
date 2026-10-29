import { NextResponse } from "next/server";

if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith("file:")) {
  process.env.DATABASE_URL = process.env.VERCEL ? "file:/tmp/dev.db" : "file:./prisma/dev.db";
}

import { prisma, ensureDatabaseReady } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    await ensureDatabaseReady();

    const timestamp = Date.now();
    const uniqueSlug = `intergreat-event-${timestamp.toString().slice(-6)}`;

    // Tạo sự kiện mới
    const newEvent = await prisma.event.create({
      data: {
        title: `Lễ Ra Mắt & Gala Gặp Gỡ InterGreat Education ${new Date().getFullYear()}`,
        slug: uniqueSlug,
        description:
          "Sự kiện quy tụ cán bộ nhân viên, đối tác chiến lược và học viên xuất sắc của InterGreat Education Group. Khám phá định hướng phát triển giáo dục toàn cầu và nhận vé QR check-in tiện lợi.",
        location: "Trung tâm Hội nghị Quốc tế - Sảnh Crystal, Tầng 5",
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày sau
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        capacity: 300,
        isActive: true,
      },
    });

    // Tạo sẵn 2 vé mẫu
    const ticket1 = await prisma.ticket.create({
      data: {
        eventId: newEvent.id,
        ticketCode: `VIP-${timestamp.toString().slice(-4)}-01`,
        fullName: "Nguyễn Hoàng Long",
        email: "long.nh@intergreat.edu.vn",
        phoneNumber: "0912345678",
        employeeId: "IG-8889",
        department: "Ban Điều Hành (Board of Directors)",
        status: "REGISTERED",
      },
    });

    const ticket2 = await prisma.ticket.create({
      data: {
        eventId: newEvent.id,
        ticketCode: `VIP-${timestamp.toString().slice(-4)}-02`,
        fullName: "Phạm Thu Hà",
        email: "ha.pt@intergreat.edu.vn",
        phoneNumber: "0987654321",
        employeeId: "IG-9990",
        department: "Khối Đào Tạo (Academic)",
        status: "CHECKED_IN",
        checkedInAt: new Date(),
        checkedInBy: "Lễ tân số 1",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã tự động tạo sự kiện mới: ${newEvent.title}`,
      data: {
        event: newEvent,
        tickets: [ticket1, ticket2],
      },
    });
  } catch (error: any) {
    console.error("Lỗi khi tự tạo sự kiện mới:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Lỗi máy chủ khi tự tạo sự kiện.",
      },
      { status: 500 }
    );
  }
}

// Hỗ trợ cả GET để test trực tiếp từ trình duyệt
export async function GET(req: Request) {
  return POST(req);
}
