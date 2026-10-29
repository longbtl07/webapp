import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Calendar, MapPin, Clock, Users, ArrowRight, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventsListPage() {
  const events = await prisma.event.findMany({
    orderBy: { startDate: "asc" },
    include: {
      _count: {
        select: { tickets: true },
      },
    },
  });

  return (
    <div className="py-12 px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2cb696]/10 border border-[#2cb696]/30 text-[#2cb696] text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" /> InterGreat Education Group
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Cổng Đăng Ký Sự Kiện
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Chọn sự kiện bạn muốn tham dự để đăng ký và nhận vé điện tử kèm mã QR vào cửa.
        </p>
      </div>

      {/* Grid danh sách sự kiện */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((evt) => {
          const startDateStr = new Date(evt.startDate).toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          const startTimeStr = new Date(evt.startDate).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          });

          const isFull = evt.capacity ? evt._count.tickets >= evt.capacity : false;

          return (
            <div
              key={evt.id}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 hover:border-[#2cb696]/50 transition-all flex flex-col justify-between shadow-xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {evt.isActive && !isFull ? (
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#2cb696]/15 text-[#2cb696] border border-[#2cb696]/30">
                      ĐANG MỞ ĐĂNG KÝ
                    </span>
                  ) : isFull ? (
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      ĐÃ HẾT CHỖ
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      TẠM ĐÓNG
                    </span>
                  )}

                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-[#2cb696]" />
                    {evt._count.tickets} {evt.capacity ? `/ ${evt.capacity}` : ""} người
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white">{evt.title}</h2>

                {evt.description && (
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {evt.description}
                  </p>
                )}

                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{startDateStr} lúc {startTimeStr}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{evt.location}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/80">
                <Link
                  href={`/events/${evt.slug}`}
                  className="w-full py-3 px-4 rounded-xl bg-[#2cb696] hover:bg-[#23977c] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#2cb696]/20 cursor-pointer"
                >
                  <span>Xem Chi Tiết & Đăng Ký</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
