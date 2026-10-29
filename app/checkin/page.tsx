"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import QrScanner from "./QrScanner";
import ManualCodeInput from "./ManualCodeInput";
import ScanFeedbackModal from "./ScanFeedbackModal";
import RecentScans, { RecentScanItem } from "./RecentScans";
import { playSuccessSound, playAlertSound } from "@/lib/audio";
import { CheckinResponse } from "@/lib/types";
import { ShieldCheck, LogOut, ScanLine, ArrowLeft, UserCircle2, Sparkles, Lock } from "lucide-react";

export default function CheckinPage() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [operatorName, setOperatorName] = useState("Nhân viên tiếp đón");

  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<CheckinResponse | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScanItem[]>([]);

  // Kiểm tra PIN trong sessionStorage khi tải trang
  useEffect(() => {
    const savedPin = sessionStorage.getItem("event_staff_pin");
    const savedOperator = sessionStorage.getItem("event_staff_operator");
    if (savedPin) {
      setPin(savedPin);
      setIsAuthenticated(true);
    }
    if (savedOperator) {
      setOperatorName(savedOperator);
    }
  }, []);

  // Xử lý xác thực PIN
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    // Test thử với một mã rỗng để kiểm tra PIN từ backend
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: "PING_TEST", staffPin: pin.trim() }),
      });

      const data: CheckinResponse = await res.json();
      if (data.codeStatus === "UNAUTHORIZED") {
        setPinError("Mã PIN không đúng. Vui lòng thử lại!");
        return;
      }

      // PIN hợp lệ
      sessionStorage.setItem("event_staff_pin", pin.trim());
      sessionStorage.setItem("event_staff_operator", operatorName.trim());
      setIsAuthenticated(true);
      setPinError(null);
    } catch {
      setPinError("Lỗi kết nối máy chủ. Vui lòng thử lại.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("event_staff_pin");
    setIsAuthenticated(false);
    setPin("");
  };

  // Xử lý quét mã hoặc nhập mã vé
  const handleProcessCode = async (code: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          staffPin: pin,
          operatorName,
        }),
      });

      const data: CheckinResponse = await res.json();
      setScanResult(data);

      if (data.success && data.codeStatus === "VALID") {
        playSuccessSound();
        if (data.ticket) {
          const nowStr = new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          setRecentScans((prev) => [
            {
              ticketCode: data.ticket!.ticketCode,
              fullName: data.ticket!.fullName,
              department: data.ticket!.department,
              time: nowStr,
            },
            ...prev,
          ]);
        }
      } else {
        playAlertSound();
      }
    } catch (err) {
      console.error("Lỗi khi gọi API check-in:", err);
      playAlertSound();
      setScanResult({
        success: false,
        message: "Lỗi kết nối mạng khi điểm danh.",
        codeStatus: "INVALID",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Màn hình nhập PIN nếu chưa xác thực
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-white">Xác thực Ca Trực Đón Tiếp</h1>
            <p className="text-xs text-slate-400 mt-1">
              Nhập mã PIN đón khách (Mặc định: <code className="text-emerald-400 font-mono">8888</code>)
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
                Tên nhân viên / Cổng trực
              </label>
              <div className="relative">
                <UserCircle2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  placeholder="VD: Cổng A - Lễ tân 1"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mã PIN bảo mật <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Nhập PIN 4 số"
                autoFocus
                required
                className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 text-white text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              Vào Máy Quét Check-in
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

  // Màn hình chính máy quét Check-in
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-6 px-4">
      <div className="w-full max-w-md space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trang chủ</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
              {operatorName}
            </span>
            <button
              onClick={handleLogout}
              title="Đăng xuất / Đổi PIN"
              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tiêu đề */}
        <div className="text-center">
          <h1 className="text-lg sm:text-xl font-extrabold text-white flex items-center justify-center gap-2">
            <ScanLine className="w-5 h-5 text-emerald-400" />
            Máy Quét Check-in Sự Kiện
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Hướng camera vào mã QR của khách hoặc nhập mã vé bên dưới
          </p>
        </div>

        {/* Camera QR Scanner */}
        <QrScanner onScanSuccess={handleProcessCode} isProcessing={isProcessing} />

        {/* Nhập mã bằng tay (Fallback) */}
        <div className="pt-2">
          <p className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Nhập mã vé thủ công (khi camera lỗi/mờ):
          </p>
          <ManualCodeInput onSubmit={handleProcessCode} isProcessing={isProcessing} />
        </div>

        {/* Danh sách 5 lượt check-in gần nhất */}
        <RecentScans scans={recentScans} />
      </div>

      {/* Pop-up phản hồi kết quả quét */}
      <ScanFeedbackModal result={scanResult} onClose={() => setScanResult(null)} />
    </div>
  );
}
