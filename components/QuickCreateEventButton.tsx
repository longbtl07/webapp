"use client";

import { useState } from "react";
import { PlusCircle, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface QuickCreateEventButtonProps {
  className?: string;
  variant?: "primary" | "secondary" | "subtle";
  onSuccess?: () => void;
  label?: string;
}

export default function QuickCreateEventButton({
  className = "",
  variant = "primary",
  onSuccess,
  label = "Tạo nhanh sự kiện mẫu InterGreat",
}: QuickCreateEventButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null);

  const handleCreate = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    setStatusType(null);

    try {
      const res = await fetch("/api/admin/events/seed", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatusType("success");
        setStatusMessage(data.message || "Tạo sự kiện thành công!");
        if (onSuccess) {
          onSuccess();
        } else {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } else {
        setStatusType("error");
        setStatusMessage(data.message || "Không thể tạo sự kiện.");
      }
    } catch {
      setStatusType("error");
      setStatusMessage("Lỗi kết nối khi tạo sự kiện.");
    } finally {
      setIsLoading(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 shadow-md";
      case "subtle":
        return "bg-[#2cb696]/10 hover:bg-[#2cb696]/20 text-[#2cb696] border border-[#2cb696]/30";
      case "primary":
      default:
        return "bg-[#2cb696] hover:bg-[#23977c] text-slate-950 font-bold shadow-lg shadow-[#2cb696]/25";
    }
  };

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <button
        onClick={handleCreate}
        disabled={isLoading}
        type="button"
        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 ${getVariantStyles()} ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang tạo sự kiện...
          </>
        ) : (
          <>
            <PlusCircle className="w-4 h-4" />
            {label}
          </>
        )}
      </button>

      {statusMessage && (
        <div
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border animate-fadeIn ${
            statusType === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}
        >
          {statusType === "success" ? (
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          )}
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
