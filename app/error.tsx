"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Lỗi ứng dụng:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-[#1e293b]/90 border border-slate-700/60 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Đang tải lại dữ liệu hệ thống</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Hệ thống đang khởi động hoặc kết nối cơ sở dữ liệu. Vui lòng bấm thử lại hoặc quay về trang chủ.
        </p>

        {error.digest && (
          <p className="text-xs font-mono text-slate-500 bg-slate-900/60 p-2 rounded-lg mb-6 border border-slate-800">
            Mã tham chiếu: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2cb696] hover:bg-[#2cb696]/90 text-slate-950 font-bold transition-all shadow-lg shadow-[#2cb696]/20 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại ngay
          </button>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-all border border-slate-700 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
