import path from "path";

// Đảm bảo DATABASE_URL luôn có tiền tố "file:" hợp lệ cho SQLite trước khi nạp Prisma Client
function getEnforcedDatabaseUrl(): string {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === "production");

  if (isServerless) {
    const tmpUrl = "file:/tmp/dev.db";
    process.env.DATABASE_URL = tmpUrl;
    return tmpUrl;
  }

  // Local development
  let envUrl = (process.env.DATABASE_URL || "").trim();
  if (!envUrl.startsWith("file:")) {
    const localDbPath = path.join(process.cwd(), "prisma", "dev.db");
    envUrl = `file:${localDbPath}`;
  }
  process.env.DATABASE_URL = envUrl;
  return envUrl;
}

const resolvedDbUrl = getEnforcedDatabaseUrl();

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbInitialized: boolean | undefined;
};

const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedDbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;

let initPromise: Promise<void> | null = null;

export async function ensureDatabaseReady(): Promise<void> {
  if (globalForPrisma.dbInitialized) return;
  if (initPromise) return initPromise;

  // Luôn đảm bảo DATABASE_URL đúng trước khi chạy query
  process.env.DATABASE_URL = resolvedDbUrl;

  initPromise = (async () => {
    try {
      // 1. DDL tự động tạo cấu trúc bảng SQLite
      const ddlStatements = [
        `CREATE TABLE IF NOT EXISTS "Event" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "title" TEXT NOT NULL,
          "slug" TEXT NOT NULL,
          "description" TEXT,
          "location" TEXT NOT NULL,
          "startDate" DATETIME NOT NULL,
          "endDate" DATETIME,
          "capacity" INTEGER,
          "isActive" BOOLEAN NOT NULL DEFAULT 1,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );`,
        `CREATE TABLE IF NOT EXISTS "Ticket" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "ticketCode" TEXT NOT NULL,
          "eventId" TEXT NOT NULL,
          "fullName" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "phoneNumber" TEXT NOT NULL,
          "employeeId" TEXT NOT NULL,
          "department" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'REGISTERED',
          "checkedInAt" DATETIME,
          "checkedInBy" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Ticket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        );`,
        `CREATE TABLE IF NOT EXISTS "SystemSetting" (
          "key" TEXT NOT NULL PRIMARY KEY,
          "value" TEXT NOT NULL,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "Event_slug_key" ON "Event"("slug");`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "Ticket_ticketCode_key" ON "Ticket"("ticketCode");`,
        `CREATE INDEX IF NOT EXISTS "Ticket_eventId_idx" ON "Ticket"("eventId");`,
        `CREATE INDEX IF NOT EXISTS "Ticket_ticketCode_idx" ON "Ticket"("ticketCode");`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "Ticket_eventId_email_key" ON "Ticket"("eventId", "email");`,
        `CREATE UNIQUE INDEX IF NOT EXISTS "Ticket_eventId_employeeId_key" ON "Ticket"("eventId", "employeeId");`,
      ];

      for (const sql of ddlStatements) {
        await basePrisma.$executeRawUnsafe(sql);
      }

      // 2. Kiểm tra nếu chưa có sự kiện nào thì tạo sự kiện khởi đầu
      const eventCount = await basePrisma.event.count();
      if (eventCount === 0) {
        console.log("[Prisma] Khởi tạo dữ liệu sự kiện mẫu cho InterGreat Education Group...");
        const event = await basePrisma.event.create({
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

        await basePrisma.ticket.createMany({
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
              checkedInBy: "Check-in Staff 01",
            },
          ],
        });

        await basePrisma.systemSetting.upsert({
          where: { key: "EMAIL_SETTINGS" },
          update: {},
          create: {
            key: "EMAIL_SETTINGS",
            value: JSON.stringify({
              provider: process.env.RESEND_API_KEY ? "resend" : "mock",
              resendApiKey: process.env.RESEND_API_KEY || "",
              fromEmail: process.env.EMAIL_FROM_ADDRESS || "onboarding@resend.dev",
              fromName: "InterGreat Education Group",
            }),
          },
        });

        console.log("[Prisma] Hoàn tất khởi tạo dữ liệu mặc định!");
      }

      globalForPrisma.dbInitialized = true;
    } catch (err) {
      console.error("[Prisma] Lỗi trong quá trình khởi tạo cơ sở dữ liệu:", err);
    } finally {
      initPromise = null;
    }
  })();

  return initPromise;
}

// Bọc proxy để tự động gọi ensureDatabaseReady trước mỗi thao tác model
export const prisma = new Proxy(basePrisma, {
  get(target, prop, receiver) {
    if (prop === "event" || prop === "ticket" || prop === "systemSetting") {
      const model = Reflect.get(target, prop, receiver);
      return new Proxy(model, {
        get(mTarget, mProp, mReceiver) {
          const fn = Reflect.get(mTarget, mProp, mReceiver);
          if (typeof fn === "function") {
            return async (...args: any[]) => {
              // Luôn bảo đảm biến môi trường chuẩn xác trước mỗi truy vấn
              process.env.DATABASE_URL = resolvedDbUrl;
              await ensureDatabaseReady();
              return fn.apply(mTarget, args);
            };
          }
          return fn;
        },
      });
    }
    return Reflect.get(target, prop, receiver);
  },
});
