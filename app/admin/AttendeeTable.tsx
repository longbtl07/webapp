"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  Clock,
  Filter,
  ExternalLink,
  RotateCcw,
  UserCheck,
  Building,
  Mail,
  Loader2,
} from "lucide-react";

export interface AttendeeItem {
  id: string;
  ticketCode: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  employeeId: string;
  department: string;
  status: string;
  checkedInAt: string | null;
  checkedInBy: string | null;
  createdAt: string;
}

interface AttendeeTableProps {
  tickets: AttendeeItem[];
  onToggleStatus: (ticketId: string, currentStatus: string) => Promise<void>;
  isUpdatingId: string | null;
}

export default function AttendeeTable({
  tickets,
  onToggleStatus,
  isUpdatingId,
}: AttendeeTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "CHECKED_IN" | "REGISTERED">("ALL");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  const handleResendTicket = async (ticketId: string, email: string) => {
    const pin = sessionStorage.getItem("event_admin_pin") || "123456";
    setSendingEmailId(ticketId);
    try {
      const res = await fetch("/api/admin/tickets/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, pin }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Đã gửi lại vé thành công đến ${email}!`);
      } else {
        alert(data.message || "Gửi lại vé thất bại.");
      }
    } catch {
      alert("Lỗi kết nối khi gửi lại vé.");
    } finally {
      setSendingEmailId(null);
    }
  };

  // Trích xuất danh sách phòng ban duy nhất
  const departments = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach((t) => set.add(t.department));
    return Array.from(set).sort();
  }, [tickets]);

  // Lọc danh sách
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // 1. Lọc theo trạng thái
      if (statusFilter !== "ALL" && t.status !== statusFilter) {
        return false;
      }

      // 2. Lọc theo phòng ban
      if (departmentFilter !== "ALL" && t.department !== departmentFilter) {
        return false;
      }

      // 3. Tìm kiếm theo từ khóa
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = t.fullName.toLowerCase().includes(query);
        const matchEmail = t.email.toLowerCase().includes(query);
        const matchCode = t.ticketCode.toLowerCase().includes(query);
        const matchEmpId = t.employeeId.toLowerCase().includes(query);
        const matchDept = t.department.toLowerCase().includes(query);
        return matchName || matchEmail || matchCode || matchEmpId || matchDept;
      }

      return true;
    });
  }, [tickets, statusFilter, departmentFilter, searchTerm]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      {/* Header & Bộ lọc */}
      <div className="p-5 border-b border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              Danh Sách Người Tham Gia
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hiển thị {filteredTickets.length} / {tickets.length} khách mời
            </p>
          </div>

          {/* Bộ lọc trạng thái */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto text-xs">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                statusFilter === "ALL"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Tất cả ({tickets.length})
            </button>
            <button
              onClick={() => setStatusFilter("CHECKED_IN")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                statusFilter === "CHECKED_IN"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-emerald-400"
              }`}
            >
              Đã đến ({tickets.filter((t) => t.status === "CHECKED_IN").length})
            </button>
            <button
              onClick={() => setStatusFilter("REGISTERED")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                statusFilter === "REGISTERED"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-amber-400"
              }`}
            >
              Chưa đến ({tickets.filter((t) => t.status === "REGISTERED").length})
            </button>
          </div>
        </div>

        {/* Tìm kiếm & Lọc phòng ban */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, email, mã nhân viên, mã vé..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="relative">
            <Building className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              <option value="ALL">Tất cả phòng ban</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <th className="py-3 px-4 font-semibold">Khách mời</th>
              <th className="py-3 px-3 font-semibold">Mã NV</th>
              <th className="py-3 px-3 font-semibold">Phòng ban</th>
              <th className="py-3 px-3 font-semibold">Mã vé</th>
              <th className="py-3 px-3 font-semibold">Trạng thái</th>
              <th className="py-3 px-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500 text-xs">
                  Không tìm thấy người tham gia nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              filteredTickets.map((t) => {
                const isCheckedIn = t.status === "CHECKED_IN";
                const isUpdating = isUpdatingId === t.id;

                return (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Tên & Email */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {t.fullName}
                      </p>
                      <p className="text-[11px] text-slate-400">{t.email}</p>
                    </td>

                    {/* Mã NV */}
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {t.employeeId}
                    </td>

                    {/* Phòng ban */}
                    <td className="py-3 px-3 text-slate-300 max-w-[160px] truncate">
                      {t.department}
                    </td>

                    {/* Mã vé */}
                    <td className="py-3 px-3">
                      <Link
                        href={`/tickets/${t.ticketCode}`}
                        target="_blank"
                        className="font-mono text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 group/link"
                        title="Xem trang vé"
                      >
                        <span>{t.ticketCode}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </Link>
                    </td>

                    {/* Trạng thái check-in */}
                    <td className="py-3 px-3">
                      {isCheckedIn ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Đã đến
                          </span>
                          {t.checkedInAt && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(t.checkedInAt).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          <Clock className="w-3 h-3" /> Chưa đến
                        </span>
                      )}
                    </td>

                    {/* Thao tác thủ công */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={sendingEmailId === t.id}
                          onClick={() => handleResendTicket(t.id, t.email)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-[#2cb696] transition-all border border-slate-700 cursor-pointer disabled:opacity-50"
                          title={`Gửi lại vé qua email (${t.email})`}
                        >
                          {sendingEmailId === t.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Mail className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {isCheckedIn ? (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => onToggleStatus(t.id, "REGISTERED")}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-300 text-[11px] transition-all inline-flex items-center gap-1 border border-slate-700 cursor-pointer disabled:opacity-50"
                            title="Hủy trạng thái check-in"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Hoàn tác</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => onToggleStatus(t.id, "CHECKED_IN")}
                            className="px-2.5 py-1 rounded-lg bg-[#2cb696] hover:bg-[#23977c] text-white text-[11px] font-medium transition-all inline-flex items-center gap-1 shadow-sm shadow-[#2cb696]/20 cursor-pointer disabled:opacity-50"
                            title="Điểm danh thủ công"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Điểm danh</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
