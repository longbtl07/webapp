"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Plus,
  ArrowLeft,
  Edit2,
  Trash2,
  ExternalLink,
  Users,
  CheckCircle2,
  Clock,
  ToggleLeft,
  ToggleRight,
  MapPin,
  X,
  Loader2,
} from "lucide-react";

interface AdminEventItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  location: string;
  startDate: string;
  endDate: string | null;
  capacity: number | null;
  isActive: boolean;
  createdAt: string;
  totalTickets: number;
  checkedInTickets: number;
  attendanceRate: number;
}

export default function AdminEventsPage() {
  const [pin, setPin] = useState("");
  const [events, setEvents] = useState<AdminEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AdminEventItem | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    capacity: "",
  });

  const fetchEvents = useCallback(async (activePin: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/events?pin=${encodeURIComponent(activePin)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setEvents(data.data);
      } else {
        setErrorMessage(data.message || "Không thể tải danh sách sự kiện.");
      }
    } catch {
      setErrorMessage("Lỗi kết nối máy chủ.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedPin = sessionStorage.getItem("event_admin_pin") || "123456";
    setPin(savedPin);
    fetchEvents(savedPin);
  }, [fetchEvents]);

  // Tự động tạo slug từ tiêu đề
  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: editingEvent
        ? prev.slug
        : val
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-"),
    }));
  };

  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      location: "",
      startDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 86400000 * 3 + 14400000).toISOString().slice(0, 16),
      capacity: "150",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (evt: AdminEventItem) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title,
      slug: evt.slug,
      description: evt.description || "",
      location: evt.location,
      startDate: new Date(evt.startDate).toISOString().slice(0, 16),
      endDate: evt.endDate ? new Date(evt.endDate).toISOString().slice(0, 16) : "",
      capacity: evt.capacity ? evt.capacity.toString() : "",
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (evt: AdminEventItem) => {
    try {
      const res = await fetch("/api/admin/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin,
          id: evt.id,
          isActive: !evt.isActive,
        }),
      });
      if (res.ok) {
        await fetchEvents(pin);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sự kiện "${title}"? Tất cả vé đăng ký liên quan sẽ bị xóa.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/events?pin=${encodeURIComponent(pin)}&id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchEvents(pin);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = "/api/admin/events";
      const method = editingEvent ? "PUT" : "POST";
      const payload = {
        pin,
        ...(editingEvent ? { id: editingEvent.id } : { slug: formData.slug }),
        title: formData.title,
        description: formData.description,
        location: formData.location,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        await fetchEvents(pin);
      } else {
        alert(data.message || "Không thể lưu sự kiện.");
      }
    } catch {
      alert("Lỗi kết nối khi lưu sự kiện.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#2cb696]" />
              Quản Lý Sự Kiện InterGreat
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Tạo mới, chỉnh sửa và đóng/mở đăng ký cho các sự kiện của tập đoàn
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="py-2.5 px-4 rounded-xl bg-[#2cb696] hover:bg-[#23977c] text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-[#2cb696]/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Sự Kiện Mới</span>
        </button>
      </div>

      {/* Danh sách sự kiện */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#2cb696]" />
          Đang tải danh sách sự kiện...
        </div>
      ) : events.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-slate-900/60 rounded-3xl border border-slate-800">
          Chưa có sự kiện nào. Bấm "Tạo Sự Kiện Mới" để bắt đầu!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between hover:border-[#2cb696]/40 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleToggleActive(evt)}
                    className="flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                    title="Bấm để đổi trạng thái"
                  >
                    {evt.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2cb696]/15 text-[#2cb696] border border-[#2cb696]/30">
                        <ToggleRight className="w-3.5 h-3.5" /> Mở Đăng Ký
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        <ToggleLeft className="w-3.5 h-3.5" /> Đã Khóa
                      </span>
                    )}
                  </button>

                  <Link
                    href={`/events/${evt.slug}`}
                    target="_blank"
                    className="text-slate-400 hover:text-[#2cb696] text-[11px] font-mono flex items-center gap-1"
                  >
                    <span>/{evt.slug}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <h3 className="text-base font-bold text-white line-clamp-2">{evt.title}</h3>

                <div className="space-y-1 text-xs text-slate-300">
                  <p className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{new Date(evt.startDate).toLocaleString("vi-VN")}</span>
                  </p>
                  <p className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{evt.location}</span>
                  </p>
                </div>

                {/* Thống kê nhanh */}
                <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950/60 p-2 rounded-xl">
                    <span className="text-slate-500 text-[10px] block">Đăng ký</span>
                    <span className="font-bold text-white">
                      {evt.totalTickets} {evt.capacity ? `/ ${evt.capacity}` : ""}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-xl">
                    <span className="text-slate-500 text-[10px] block">Đã Check-in</span>
                    <span className="font-bold text-emerald-400">
                      {evt.checkedInTickets} ({evt.attendanceRate}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <Link
                  href={`/admin?slug=${evt.slug}`}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium text-center transition-all"
                >
                  Xem Live Dashboard →
                </Link>

                <button
                  onClick={() => handleOpenEditModal(evt)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Sửa sự kiện"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDeleteEvent(evt.id, evt.title)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                  title="Xóa sự kiện"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tạo/Sửa Sự Kiện */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#2cb696]" />
                {editingEvent ? "Chỉnh Sửa Sự Kiện" : "Tạo Sự Kiện InterGreat Mới"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tên sự kiện <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="VD: Hội Thảo Học Bổng Du Học Anh Quốc 2026"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-[#2cb696]"
                />
              </div>

              {!editingEvent && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Đường dẫn Slug (URL) <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-500">
                    <span>/events/</span>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, slug: e.target.value }))
                      }
                      className="w-full bg-transparent text-white font-mono focus:outline-none ml-1"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Thời gian bắt đầu <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-[#2cb696]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Thời gian kết thúc
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-[#2cb696]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Địa điểm tổ chức <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="VD: Hội trường tầng 5, InterGreat Tower"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-[#2cb696]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Sức chứa tối đa (Chỗ)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, capacity: e.target.value }))
                    }
                    placeholder="Để trống nếu không giới hạn"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-[#2cb696]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mô tả sự kiện</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Giới thiệu nội dung, diễn giả, quyền lợi của người tham dự..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-[#2cb696]"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-5 rounded-xl bg-[#2cb696] hover:bg-[#23977c] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#2cb696]/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingEvent ? "Lưu Thay Đổi" : "Khởi Tạo Sự Kiện"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
