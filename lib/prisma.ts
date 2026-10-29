import { PrismaClient } from "@prisma/client";

// Đảm bảo DATABASE_URL luôn hợp lệ cho SQLite trên Vercel
let dbUrl = process.env.DATABASE_URL;
if (!dbUrl || !dbUrl.startsWith("file:")) {
  dbUrl = "file:./dev.db";
  process.env.DATABASE_URL = dbUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
