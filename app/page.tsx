import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import {
  QrCode,
  ScanLine,
  BarChart3,
  Calendar,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await prisma.event.findMany({
    orderBy: { startDate: "asc" },
    include: {
      _count: {
        select: { tickets: true },
      },
    },
  });

  const activeEvents = events.filter((e) => e.isActive);

  return (
    <div className="relative overflow-hidden py-12 px-4 sm:px-6">
      {/* Background Teal Gradient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-[#2cb696]/15 via-[#2cb696]/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Logo Brand InterGreat */}
          <div className="inline-block bg-white p-3.5 rounded-2xl shadow-xl shadow-[#2cb696]/10 mb-6 border border-slate-200">
            <Image
              src="/intergreat-logo.png"
              alt="InterGreat Education Group"
              width={220}
              height={64}
              className="h-12 w-auto object-contain mx-auto"
              priority
            />
          </div>

          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2cb696]/10 border border-[#2cb696]/30 text-[#2cb696] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Nền Tảng Sự Kiện Doanh Nghiệp
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Đăng Ký & Check-in Sự Kiện{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2cb696] to-teal-200">
              InterGreat
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Hệ thống quản lý sự kiện thông minh cho cán bộ, nhân viên và đối tác của InterGreat Education Group.
            Đăng ký nhận vé QR, quét mã đón tiếp siêu tốc và theo dõi số liệu trực tiếp.
          </p>
        </div>

        {/* 3 Cổng truy cập theo vai trò */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cổng 1: Khách mời */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 hover:border-[#2cb696]/50 transition-all flex flex-col justify-between group shadow-xl">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#2cb696]/10 text-[#2cb696] border border-[#2cb696]/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2cb696]">
                Dành cho Khách mời
              </span>
              <h2 className="text-lg font-bold text-white mt-1 mb-2">Đăng Ký & Nhận Vé QR</h2>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Chọn sự kiện muốn tham dự, nhận vé điện tử kèm mã QR và email xác nhận tự động.
              </p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center justify-between w-full py-2.5 px-4 rounded-xl bg-[#2cb696] hover:bg-[#23977c] text-white text-xs font-semibold transition-all shadow-md shadow-[#2cb696]/20"
            >
              <span>Xem các sự kiện ({activeEvents.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Cổng 2: Nhân viên đón khách */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 hover:border-emerald-500/50 transition-all flex flex-col justify-between group shadow-xl">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ScanLine className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Nhân viên Lễ tân
              </span>
              <h2 className="text-lg font-bold text-white mt-1 mb-2">Cổng Quét Check-in</h2>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Quét QR bằng camera hoặc nhập mã dự phòng. Xác thực vé chỉ trong 1 giây. Mã PIN: <code className="text-emerald-300 font-mono">8888</code>
              </p>
            </div>
            <Link
              href="/checkin"
              className="inline-flex items-center justify-between w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-600/20"
            >
              <span>Mở Máy Quét Check-in</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Cổng 3: Ban tổ chức */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 hover:border-purple-500/50 transition-all flex flex-col justify-between group shadow-xl">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                Ban Tổ Chức
              </span>
              <h2 className="text-lg font-bold text-white mt-1 mb-2">Live Dashboard & Quản Trị</h2>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Tạo/sửa sự kiện, theo dõi số liệu real-time, cấu hình gửi email vé. Mã PIN: <code className="text-purple-300 font-mono">123456</code>
              </p>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center justify-between w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/20"
            >
              <span>Vào Trang Quản Trị</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Danh sách Sự kiện nổi bật của InterGreat */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#2cb696]" />
                Sự Kiện InterGreat Đang Mở Đăng Ký
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Chọn sự kiện để đăng ký tham dự và nhận vé điện tử
              </p>
            </div>
            <Link
              href="/events"
              className="text-xs font-semibold text-[#2cb696] hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả ({events.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((evt) => {
              const startDateStr = new Date(evt.startDate).toLocaleDateString("vi-VN", {
                weekday: "short",
                day: "numeric",
                month: "numeric",
                year: "numeric",
              });
              const startTimeStr = new Date(evt.startDate).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={evt.id}
                  className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 hover:border-[#2cb696]/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {evt.isActive ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2cb696]/15 text-[#2cb696] border border-[#2cb696]/30">
                          ĐANG MỞ ĐĂNG KÝ
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          ĐÃ ĐÓNG
                        </span>
                      )}
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        {evt._count.tickets} {evt.capacity ? `/ ${evt.capacity}` : ""} đăng ký
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white line-clamp-1">{evt.title}</h3>

                    {evt.description && (
                      <p className="text-xs text-slate-400 line-clamp-2">{evt.description}</p>
                    )}

                    <div className="space-y-1.5 pt-2 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{startDateStr} lúc {startTimeStr}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80">
                    <Link
                      href={`/events/${evt.slug}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-[#2cb696] hover:text-white text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>Đăng ký tham dự sự kiện này</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
