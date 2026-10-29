import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RegisterForm from "./RegisterForm";
import { Calendar, MapPin, Users, Sparkles, Clock } from "lucide-react";


interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      _count: {
        select: { tickets: true },
      },
    },
  });

  if (!event) {
    notFound();
  }

  // Format ngày giờ Việt Nam
  const startDateStr = new Date(event.startDate).toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const startTimeStr = new Date(event.startDate).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTimeStr = event.endDate
    ? new Date(event.endDate).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const registeredCount = event._count.tickets;
  const isFull = event.capacity ? registeredCount >= event.capacity : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header Badge */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Sự Kiện Nội Bộ Công Ty
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-3 text-white">
            {event.title}
          </h1>
        </div>

        {/* Card thông tin sự kiện */}
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-6 mb-8 shadow-xl">
          {event.description && (
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              {event.description}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-700/60 text-sm">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">{startDateStr}</p>
                <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                  {startTimeStr} {endTimeStr ? `– ${endTimeStr}` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">{event.location}</p>
                <p className="text-slate-400 text-xs mt-0.5">Địa điểm tổ chức</p>
              </div>
            </div>

            {event.capacity && (
              <div className="flex items-start gap-3 sm:col-span-2">
                <Users className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
                    <span>Số lượng đã đăng ký:</span>
                    <span className="font-semibold text-emerald-300">
                      {registeredCount} / {event.capacity} người
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (registeredCount / event.capacity) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Khung Form Đăng ký */}
        <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-xl font-bold text-slate-900">Thông tin đăng ký tham dự</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Vui lòng điền đúng thông tin nhân viên để nhận mã QR vé vào cổng.
            </p>
          </div>

          {!event.isActive ? (
            <div className="p-6 text-center bg-slate-50 rounded-xl text-slate-600">
              <p className="font-medium">Cổng đăng ký cho sự kiện này hiện đã tạm đóng.</p>
              <p className="text-xs text-slate-400 mt-1">Vui lòng liên hệ Ban Tổ Chức để biết thêm chi tiết.</p>
            </div>
          ) : isFull ? (
            <div className="p-6 text-center bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
              <p className="font-semibold">Sự kiện đã đạt số lượng đăng ký tối đa ({event.capacity} người).</p>
              <p className="text-xs text-amber-600 mt-1">Cảm ơn bạn đã quan tâm. Hẹn gặp bạn ở các sự kiện tiếp theo!</p>
            </div>
          ) : (
            <RegisterForm eventSlug={event.slug} />
          )}
        </div>
      </div>
    </div>
  );
}
