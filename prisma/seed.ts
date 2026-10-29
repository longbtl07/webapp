import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial event data...");

  const existingEvent = await prisma.event.findUnique({
    where: { slug: "townhall-q4-2026" },
  });

  if (!existingEvent) {
    const event = await prisma.event.create({
      data: {
        title: "All-Hands Town Hall & Year-End Gala 2026",
        slug: "townhall-q4-2026",
        description:
          "Sự kiện tổng kết quý IV và dạ tiệc cuối năm dành cho toàn thể cán bộ nhân viên công ty. Hãy đăng ký để nhận vé QR check-in tại cửa sảnh tiệc!",
        location: "Hội trường Grand Ballroom - Tầng 3, Trụ sở chính",
        startDate: new Date("2026-12-18T18:00:00.000Z"),
        endDate: new Date("2026-12-18T22:30:00.000Z"),
        capacity: 250,
        isActive: true,
      },
    });

    console.log(`Created sample event: ${event.title} (${event.slug})`);

    // Tạo sẵn 2 vé mẫu để test check-in
    await prisma.ticket.createMany({
      data: [
        {
          eventId: event.id,
          ticketCode: "EVT-2026-TEST01",
          fullName: "Nguyễn Văn An",
          email: "an.nv@company.com",
          phoneNumber: "0901234567",
          employeeId: "EMP001",
          department: "Kỹ thuật (Engineering)",
          status: "REGISTERED",
        },
        {
          eventId: event.id,
          ticketCode: "EVT-2026-TEST02",
          fullName: "Trần Thị Mai",
          email: "mai.tt@company.com",
          phoneNumber: "0987654321",
          employeeId: "EMP002",
          department: "Nhân sự (HR)",
          status: "CHECKED_IN",
          checkedInAt: new Date(),
          checkedInBy: "Lễ tân Cổng A",
        },
      ],
    });

    console.log("Seeded sample tickets for testing.");
  } else {
    console.log("Sample event already exists, skipping seed.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
