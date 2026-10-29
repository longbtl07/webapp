"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Send,
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  Sparkles,
  Loader2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface EventOption {
  id: string;
  title: string;
  slug: string;
  isActive: boolean;
  startDate: string;
  location: string;
}

export default function InviteGuestPage() {
  const [pin, setPin] = useState("");
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    department: "",
    role: "Khách mời VIP",
    customNote: "",
  });

  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    ticketCode?: string;
    ticketUrl?: string;
  } | null>(null);

  useEffect(() => {
    const savedPin = sessionStorage.getItem("event_admin_pin") || "123456";
    setPin(savedPin);

    fetch(`/api/admin/events?pin=${encodeURIComponent(savedPin)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setEvents(data.data);
          setSelectedEventId(data.data[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingEvents(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (result) setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin,
          eventId: selectedEventId,
          ...formData,
        }),
      });

      const data = await res.json();
      setResult(data);

      if (data.success) {
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          department: "",
          role: "Khách mời VIP",
          customNote: "",
        });
      }
    } catch {
      setResult({
        success: false,
        message: "Lỗi kết nối khi gửi thư mời. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="py-8 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-[#2cb696]" />
                Gửi Thư Mời Khách Mời & Cấp Vé Dự Án
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2cb696]/20 text-[#2cb696] border border-[#2cb696]/30">
                Resend Real Email
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Cấp vé QR chính thức và tự động gửi email thư mời chuẩn nhận diện InterGreat Education Group
            </p>
          </div>
        </div>
      </div>

      {/* Thông báo kết quả */}
      {result && (
        <div
          className={`p-5 rounded-3xl border shadow-xl flex items-start gap-3.5 ${
            result.success
              ? "bg-[#2cb696]/15 border-[#2cb696]/30 text-[#2cb696]"
              : "bg-red-500/15 border-red-500/30 text-red-300"
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 text-[#2cb696]" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              !
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-sm font-bold">{result.message}</h3>
            {result.ticketCode && (
              <div className="mt-2 text-xs text-slate-300 space-y-1">
                <p>
                  Mã vé cấp phát:{" "}
                  <span className="font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded">
                    {result.ticketCode}
                  </span>
                </p>
                {result.ticketUrl && (
                  <p>
                    <a
                      href={result.ticketUrl}
                      target="_blank"
                      className="text-[#2cb696] hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <span>Xem thẻ vé điện tử vừa cấp</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Mời Khách */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Chọn sự kiện */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#2cb696]" />
              Chọn Dự Án / Sự Kiện InterGreat <span className="text-red-400">*</span>
            </label>
            {isLoadingEvents ? (
              <div className="py-3 text-xs text-slate-500">Đang tải danh sách sự kiện...</div>
            ) : events.length === 0 ? (
              <div className="p-4 bg-slate-950 rounded-xl text-xs text-slate-400">
                Chưa có sự kiện nào. Hãy vào{" "}
                <Link href="/admin/events" className="text-[#2cb696] underline">
                  Quản lý sự kiện
                </Link>{" "}
                để tạo sự kiện trước.
              </div>
            ) : (
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2cb696] cursor-pointer"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} ({new Date(evt.startDate).toLocaleDateString("vi-VN")})
                  </option>
                ))}
              </select>
            )}

            {selectedEvent && (
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-2">
                <span>📍 {selectedEvent.location}</span>
                <span>•</span>
                <span>⏰ {new Date(selectedEvent.startDate).toLocaleString("vi-VN")}</span>
              </p>
            )}
          </div>

          <div className="border-t border-slate-800/80 pt-4" />

          {/* 2. Thông tin khách mời */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Họ và tên Khách mời / Đại biểu <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="VD: TS. Nguyễn Văn Minh"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2cb696]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email nhận vé & thư mời thật <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="dai_bieu@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2cb696]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Số điện thoại liên hệ <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  maxLength={12}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="0912345678"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2cb696]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cơ quan / Đơn vị / Phòng ban <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="VD: Đại học Ngoại Thương"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2cb696]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Vai trò / Tư cách tham dự
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2cb696] cursor-pointer"
              >
                <option value="Khách mời VIP">Khách mời VIP</option>
                <option value="Đối tác Chiến lược">Đối tác Chiến lược</option>
                <option value="Diễn giả (Speaker)">Diễn giả (Speaker)</option>
                <option value="Cán bộ Nhân viên">Cán bộ Nhân viên</option>
                <option value="Học viên / Phụ huynh">Học viên / Phụ huynh</option>
                <option value="Đại biểu Danh dự">Đại biểu Danh dự</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Ghi chú thêm cho Ban Tổ Chức (Tùy chọn)
            </label>
            <textarea
              name="customNote"
              rows={2}
              value={formData.customNote}
              onChange={handleChange}
              placeholder="VD: Cần đón tiếp tại sảnh A, bố trí hàng ghế đầu..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#2cb696]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !selectedEventId}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#2cb696] hover:bg-[#23977c] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#2cb696]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang cấp vé & gửi email qua Resend...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Gửi Thư Mời & Cấp Vé QR Thật Ngay</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2">
              Email vé mời đính kèm mã QR sẽ được gửi tức thì đến hòm thư người nhận qua Resend API.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
