"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import StatsCards from "./StatsCards";
import AttendeeTable, { AttendeeItem } from "./AttendeeTable";
import {
  Lock,
  BarChart3,
  RefreshCw,
  LogOut,
  ArrowLeft,
  ExternalLink,
  ScanLine,
  Building2,
  Calendar,
} from "lucide-react";

interface AdminData {
  event: {
    id: string;
    title: string;
    slug: string;
    location: string;
    startDate: string;
    capacity: number | null;
    isActive: boolean;
  };
  stats: {
    totalRegistrations: number;
    checkedInCount: number;
    pendingCount: number;
    attendanceRate: number;
    capacity: number | null;
  };
  departmentStats: {
    name: string;
    total: number;
    checkedIn: number;
    rate: number;
  }[];
  tickets: AttendeeItem[];
}

export default function AdminDashboardPage() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const [data, setData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Tải dữ liệu từ API
  const fetchDashboardData = useCallback(async (activePin: string) => {
    try {
      const res = await fetch(`/api/admin/stats?pin=${encodeURIComponent(activePin)}`);
      const resJson = await res.json();

      if (!res.ok || !resJson.success) {
        if (res.status === 401) {
          setIsAuthenticated(false);
          sessionStorage.removeItem("event_admin_pin");
          setPinError("Mã PIN không đúng hoặc đã hết hạn.");
        }
        return false;
      }

      setData(resJson.data);
      setLastUpdated(new Date().toLocaleTimeString("vi-VN"));
      return true;
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu dashboard:", err);
      return false;
    }
  }, []);

  // Kiểm tra PIN đã lưu khi tải trang
  useEffect(() => {
    const savedPin = sessionStorage.getItem("event_admin_pin");
    if (savedPin) {
      setPin(savedPin);
      fetchDashboardData(savedPin).then((valid) => {
        if (valid) setIsAuthenticated(true);
      });
    }
  }, [fetchDashboardData]);

  // Cơ chế tự động Polling dữ liệu mỗi 4 giây
  useEffect(() => {
    if (!isAuthenticated || !pin) return;

    const interval = setInterval(() => {
      fetchDashboardData(pin);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAuthenticated, pin, fetchDashboardData]);

  // Xử lý đăng nhập bằng PIN
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    setIsLoading(true);
    setPinError(null);

    const ok = await fetchDashboardData(pin.trim());
    if (ok) {
      sessionStorage.setItem("event_admin_pin", pin.trim());
      setIsAuthenticated(true);
    } else {
      setPinError("Mã PIN Quản trị không chính xác!");
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("event_admin_pin");
    setIsAuthenticated(false);
    setPin("");
    setData(null);
  };

  // Cập nhật thủ công trạng thái vé
  const handleToggleStatus = async (ticketId: string, targetStatus: string) => {
    setIsUpdatingId(ticketId);
    try {
      const res = await fetch("/api/admin/stats", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          status: targetStatus,
          pin,
          operatorName: "Ban tổ chức (Thủ công)",
        }),
      });

      if (res.ok) {
        await fetchDashboardData(pin);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingId(null);
    }
  };

  // Màn hình nhập PIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-white">Quản Trị Ban Tổ Chức</h1>
            <p className="text-xs text-slate-400 mt-1">
              Nhập mã PIN Admin để xem số liệu trực tiếp (Mặc định: <code className="text-purple-400 font-mono">123456</code>)
            </p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            {pinError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium">
                {pinError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mã PIN Quản trị <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                maxLength={10}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Nhập PIN 6 số"
                autoFocus
                required
                className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 text-white text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-98 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Đang xác thực..." : "Truy Cập Dashboard"}
            </button>

            <div className="text-center pt-2">
              <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                ← Quay lại trang chủ
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Navbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Về trang chủ"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  Live Event Dashboard
                </h1>
                {/* Live pulse indicator */}
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Real-time (4s)
                </span>
              </div>
              {data && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Sự kiện: <span className="text-white font-medium">{data.event.title}</span> • Cập nhật lúc {lastUpdated}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/checkin"
              target="_blank"
              className="py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>Mở Máy Quét Check-in</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>

            {data && (
              <Link
                href={`/events/${data.event.slug}`}
                target="_blank"
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-all flex items-center gap-1.5"
              >
                <span>Trang Đăng Ký</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </Link>
            )}

            <button
              onClick={() => fetchDashboardData(pin)}
              title="Làm mới ngay"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thẻ thống kê KPI */}
        {data && <StatsCards stats={data.stats} />}

        {/* Thống kê theo phòng ban */}
        {data && data.departmentStats.length > 0 && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Tiến độ Điểm Danh theo Phòng Ban
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.departmentStats.map((dept) => (
                <div
                  key={dept.name}
                  className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 text-xs"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-white truncate max-w-[180px]">
                      {dept.name}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {dept.checkedIn}/{dept.total} ({dept.rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${dept.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bảng danh sách người tham gia */}
        {data && (
          <AttendeeTable
            tickets={data.tickets}
            onToggleStatus={handleToggleStatus}
            isUpdatingId={isUpdatingId}
          />
        )}
      </div>
    </div>
  );
}
