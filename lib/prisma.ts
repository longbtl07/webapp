import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function setupDatabase(): string {
  // 1. Nếu có cấu hình cơ sở dữ liệu ngoài (PostgreSQL, Supabase, Turso...), ưu tiên sử dụng
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && !envUrl.startsWith("file:")) {
    return envUrl;
  }

  // 2. Trên môi trường Vercel Serverless, hệ thống file gốc là READ-ONLY.
  // SQLite bắt buộc phải được copy vào thư mục /tmp (nơi duy nhất có quyền ghi)
  if (process.env.VERCEL) {
    const tmpDbPath = path.join("/tmp", "dev.db");

    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(process.cwd(), "dev.db"),
        path.join("/var", "task", "prisma", "dev.db"),
        path.join("/var", "task", "dev.db"),
      ];

      for (const candidate of candidates) {
        try {
          if (fs.existsSync(/* turbopackIgnore: true */ candidate)) {
            fs.copyFileSync(candidate, tmpDbPath);
            console.log(`[Prisma] Đã khởi tạo /tmp/dev.db từ ${candidate}`);
            break;
          }
        } catch {
          // Bỏ qua nếu ứng viên không khả dụng
        }
      }
    }

    return `file:${tmpDbPath}`;
  }

  // 3. Môi trường Local development
  const localDb = path.join(process.cwd(), "prisma", "dev.db");
  return `file:${localDb}`;
}

const resolvedDbUrl = setupDatabase();
process.env.DATABASE_URL = resolvedDbUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedDbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
