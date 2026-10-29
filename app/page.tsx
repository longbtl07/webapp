import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { QrCode, ScanLine, BarChart3, Calendar, ArrowRight, Sparkles } from "lucide-react";


export default async function HomePage() {
  const sampleEvent = await prisma.event.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { tickets: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> POC Web App: Event Check-in
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Hệ Thống Đăng Ký & Quét Mã <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">QR Check-in</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Giải pháp số hóa toàn diện thay thế bảng tính Excel: nhân viên tự đăng ký nhận vé điện tử, đón tiếp quét mã camera siêu tốc, ban tổ chức theo dõi số liệu trực tiếp.
          </p>
        </div>

        {/* 3 Vai trò người dùng */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Vai trò 1: Khách mời */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Dành cho Khách mời</span>
              <h2 className="text-lg font-bold text-white mt-1 mb-2">Đăng Ký & Nhận Vé QR</h2>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Điền thông tin nhân viên, nhận vé điện tử kèm mã QR sắc nét trên màn hình và tải về máy.
              </p>
            </div>
            {sampleEvent ? (
              <Link
                href={`/events/${sampleEvent.slug}`}
                className="inline-flex items-center justify-between w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all"
              >
                <span>Đăng ký sự kiện mẫu</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="text-xs text-slate-500">Chưa có sự kiện khả dụng</span>
            )}
          </div>

          {/* Vai trò 2: Nhân viên đón khách */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ScanLine className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Nhân viên đón khách</span>
              <h2 className="text-lg font-bold text-white mt-1 mb-2">Quét Mã Check-in</h2>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Mở camera quét mã QR tức thì trên điện thoại, hỗ trợ ô nhập tay mã vé dự phòng. PIN: <code className="text-emerald-300 font-mono">8888</code>
              </p>
            </div>
            <Link
              href="/checkin"
              className="inline-flex items-center justify-between w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all"
            >
              <span>Mở Web Scanner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Vai trò 3: Ban tổ chức */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Ban Tổ Chức</span>
              <h2 className="text-lg font-bold text-white mt-1 mb-2">Live Dashboard</h2>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Theo dõi số liệu trực tiếp: tỷ lệ tham dự, số người đã đến, danh sách chi tiết. PIN: <code className="text-purple-300 font-mono">123456</code>
              </p>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center justify-between w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-all"
            >
              <span>Xem Thống Kê Trực Tiếp</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Thông tin sự kiện mẫu hiện có */}
        {sampleEvent && (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                <Calendar className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Sự kiện mẫu đang kích hoạt</p>
                <h3 className="text-base font-semibold text-white">{sampleEvent.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Đã đăng ký: <span className="text-blue-400 font-semibold">{sampleEvent._count.tickets}</span> / {sampleEvent.capacity || "Không giới hạn"} người
                </p>
              </div>
            </div>
            <Link
              href={`/events/${sampleEvent.slug}`}
              className="py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all shrink-0"
            >
              Xem trang sự kiện →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
