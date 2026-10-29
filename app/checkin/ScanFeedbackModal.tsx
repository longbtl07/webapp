"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertOctagon, XCircle, ArrowRight, User, Building2 } from "lucide-react";
import { CheckinResponse } from "@/lib/types";

interface ScanFeedbackModalProps {
  result: CheckinResponse | null;
  onClose: () => void;
}

export default function ScanFeedbackModal({ result, onClose }: ScanFeedbackModalProps) {
  useEffect(() => {
    if (!result) return;

    // Tự động đóng modal sau 4 giây để nhân viên quét khách tiếp theo
    const timer = setTimeout(() => {
      onClose();
    }, 4500);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [result, onClose]);

  if (!result) return null;

  const isValid = result.codeStatus === "VALID";
  const isAlreadyCheckedIn = result.codeStatus === "ALREADY_CHECKED_IN";
  const isInvalid = result.codeStatus === "INVALID" || result.codeStatus === "UNAUTHORIZED";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl border transition-all transform ${
          isValid
            ? "bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 border-emerald-500/50"
            : isAlreadyCheckedIn
            ? "bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 border-amber-500/50"
            : "bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 border-rose-500/50"
        }`}
      >
        {/* Icon trạng thái */}
        <div className="flex justify-center mb-4">
          {isValid && (
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          )}
          {isAlreadyCheckedIn && (
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
              <AlertOctagon className="w-10 h-10" />
            </div>
          )}
          {isInvalid && (
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
              <XCircle className="w-10 h-10" />
            </div>
          )}
        </div>

        {/* Tiêu đề trạng thái */}
        <h3
          className={`text-xl font-extrabold tracking-tight mb-1 ${
            isValid ? "text-emerald-400" : isAlreadyCheckedIn ? "text-amber-400" : "text-rose-400"
          }`}
        >
          {isValid
            ? "CHECK-IN THÀNH CÔNG!"
            : isAlreadyCheckedIn
            ? "VÉ ĐÃ CHECK-IN TRƯỚC ĐÓ!"
            : "MÃ VÉ KHÔNG HỢP LỆ"}
        </h3>

        <p className="text-xs text-slate-300 mb-4">{result.message}</p>

        {/* Thông tin vé chi tiết (nếu có) */}
        {result.ticket && (
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 text-left space-y-2 mb-5 text-xs">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <User className="w-4 h-4 text-indigo-400" />
              <span>{result.ticket.fullName}</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 ml-auto">
                {result.ticket.employeeId}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="line-clamp-1">{result.ticket.department}</span>
            </div>

            {isAlreadyCheckedIn && result.ticket.checkedInAt && (
              <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300">
                Thời gian check-in trước:{" "}
                <span className="font-semibold text-white">
                  {new Date(result.ticket.checkedInAt).toLocaleTimeString("vi-VN")}
                </span>
                {result.ticket.checkedInBy && ` (${result.ticket.checkedInBy})`}
              </div>
            )}
          </div>
        )}

        {/* Nút đóng tiếp tục quét */}
        <button
          type="button"
          onClick={onClose}
          className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
            isValid
              ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30"
              : isAlreadyCheckedIn
              ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/30"
              : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
          }`}
        >
          <span>Quét khách tiếp theo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
