import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl } from "@/lib/qrcode";
import DownloadTicketButton from "./DownloadTicketButton";
import { Calendar, MapPin, CheckCircle2, Clock, ArrowLeft, QrCode } from "lucide-react";


interface TicketPageProps {
  params: Promise<{ ticketCode: string }>;
  searchParams: Promise<{ registered?: string }>;
}

export default async function TicketPage({ params, searchParams }: TicketPageProps) {
  const { ticketCode } = await params;
  const { registered } = await searchParams;

  const ticket = await prisma.ticket.findUnique({
    where: { ticketCode },
    include: { event: true },
  });

  if (!ticket) {
    notFound();
  }

  const qrDataUrl = await generateQrDataUrl(ticket.ticketCode);

  const startDateStr = new Date(ticket.event.startDate).toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  const startTimeStr = new Date(ticket.event.startDate).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isCheckedIn = ticket.status === "CHECKED_IN";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 flex flex-col justify-start sm:justify-center items-center">
      <div className="w-full max-w-md my-auto">
        {/* Nút quay lại sự kiện */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={`/events/${ticket.event.slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về trang sự kiện</span>
          </Link>
          <span className="text-xs text-slate-500 font-mono">Vé điện tử #POC</span>
        </div>

        {/* Thông báo đăng ký thành công nếu vừa tạo */}
        {registered === "true" && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold text-white">Đăng ký tham dự thành công!</p>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                Vui lòng lưu lại mã QR vé dưới đây để check-in tại sự kiện.
              </p>
            </div>
          </div>
        )}

        {/* Thẻ vé Điện tử */}
        <div className="bg-gradient-to-b from-slate-900 to-indigo-950/90 rounded-3xl border border-indigo-500/30 shadow-2xl overflow-hidden relative">
          {/* Header vé */}
          <div className="p-6 border-b border-indigo-500/20 bg-slate-900/60 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                Vé Khách Mời
              </span>
              {isCheckedIn ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ĐÃ CHECK-IN
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  CHƯA ĐIỂM DANH
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-white line-clamp-2">{ticket.event.title}</h1>
          </div>

          {/* Vùng QR Code Trung Tâm */}
          <div className="p-6 flex flex-col items-center justify-center bg-white/5">
            <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-200/20 inline-block">
              <Image
                src={qrDataUrl}
                alt={`Mã QR cho vé ${ticket.ticketCode}`}
                width={220}
                height={220}
                className="rounded-lg"
                priority
              />
            </div>
            <p className="font-mono font-bold text-lg text-indigo-200 tracking-wider mt-3">
              {ticket.ticketCode}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5" /> Xuất trình mã này cho nhân viên đón khách
            </p>
          </div>

          {/* Rãnh cắt vé (Ticket notch decoration) */}
          <div className="relative flex items-center justify-between px-[-12px]">
            <div className="w-6 h-6 rounded-full bg-slate-950 -ml-3" />
            <div className="flex-1 border-t-2 border-dashed border-indigo-500/30 mx-2" />
            <div className="w-6 h-6 rounded-full bg-slate-950 -mr-3" />
          </div>

          {/* Thông tin khách mời */}
          <div className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-slate-400">Họ và tên</p>
                <p className="text-sm font-semibold text-white mt-0.5">{ticket.fullName}</p>
              </div>
              <div>
                <p className="text-slate-400">Mã nhân viên</p>
                <p className="text-sm font-semibold text-indigo-300 font-mono mt-0.5">
                  {ticket.employeeId}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-slate-400">Phòng ban</p>
                <p className="text-xs font-medium text-slate-200 mt-0.5 line-clamp-1">
                  {ticket.department}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Số điện thoại</p>
                <p className="text-xs font-mono text-slate-200 mt-0.5">{ticket.phoneNumber}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-indigo-500/20 space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  {startDateStr} lúc {startTimeStr}
                </span>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{ticket.event.location}</span>
              </div>
            </div>

            {isCheckedIn && ticket.checkedInAt && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px]">
                Đã check-in thành công vào lúc:{" "}
                <span className="font-semibold text-white">
                  {new Date(ticket.checkedInAt).toLocaleString("vi-VN")}
                </span>
                {ticket.checkedInBy && ` (Bởi: ${ticket.checkedInBy})`}
              </div>
            )}
          </div>
        </div>

        {/* Nút thao tác tải vé và chia sẻ */}
        <DownloadTicketButton
          ticketCode={ticket.ticketCode}
          isNewRegistration={registered === "true"}
          qrDataUrl={qrDataUrl}
          fullName={ticket.fullName}
          eventTitle={ticket.event.title}
          department={ticket.department}
        />
      </div>
    </div>
  );
}
