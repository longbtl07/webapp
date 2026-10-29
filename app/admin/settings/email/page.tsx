"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  ArrowLeft,
  Check,
  Send,
  AlertCircle,
  ShieldCheck,
  Server,
  Zap,
  Eye,
  Loader2,
  Sparkles,
} from "lucide-react";
import { EmailSettingsConfig, EmailProviderType } from "@/lib/email";

export default function AdminEmailSettingsPage() {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const [testEmail, setTestEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [config, setConfig] = useState<EmailSettingsConfig>({
    provider: "mock",
    resendApiKey: "",
    smtpHost: "smtp.gmail.com",
    smtpPort: 465,
    smtpSecure: true,
    smtpUser: "",
    smtpPass: "",
    fromEmail: "events@intergreat.com",
    fromName: "InterGreat Education Group",
  });

  useEffect(() => {
    const savedPin = sessionStorage.getItem("event_admin_pin") || "123456";
    setPin(savedPin);

    fetch(`/api/admin/settings/email?pin=${encodeURIComponent(savedPin)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setConfig(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleProviderChange = (newProvider: EmailProviderType) => {
    setConfig((prev) => ({ ...prev, provider: newProvider }));
    setStatusMessage(null);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/settings/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, config }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: "success", text: data.message });
      } else {
        setStatusMessage({ type: "error", text: data.message || "Lỗi khi lưu cấu hình." });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      setStatusMessage({ type: "error", text: "Vui lòng nhập địa chỉ email để nhận thư thử nghiệm." });
      return;
    }
    setIsTesting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/settings/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin,
          config,
          testEmail: testEmail.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ type: "success", text: data.message });
      } else {
        setStatusMessage({ type: "error", text: data.message || "Gửi email thử nghiệm thất bại." });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Lỗi kết nối khi gửi thử nghiệm." });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#2cb696]" />
              Cài Đặt Dịch Vụ Gửi Email
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Chuyển đổi phương thức gửi email vé thật (Resend API, SMTP Gmail, hoặc Mock Test)
            </p>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 ${
            statusMessage.type === "success"
              ? "bg-[#2cb696]/15 border-[#2cb696]/30 text-[#2cb696]"
              : "bg-red-500/15 border-red-500/30 text-red-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <Check className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <p className="flex-1 font-medium">{statusMessage.text}</p>
        </div>
      )}

      {isLoading ? (
        <div className="py-16 text-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#2cb696]" />
          Đang tải cấu hình email...
        </div>
      ) : (
        <form onSubmit={handleSaveConfig} className="space-y-6">
          {/* Chọn Provider */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#2cb696]" />
              Chọn Phương Thức Gửi (Provider)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: Resend */}
              <div
                onClick={() => handleProviderChange("resend")}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  config.provider === "resend"
                    ? "bg-[#2cb696]/10 border-[#2cb696] text-white shadow-lg shadow-[#2cb696]/10"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">Resend API</span>
                  {config.provider === "resend" && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2cb696]" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Tỷ lệ vào Inbox 99%, chuẩn cho môi trường public và production.
                </p>
              </div>

              {/* Option 2: SMTP Gmail */}
              <div
                onClick={() => handleProviderChange("smtp")}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  config.provider === "smtp"
                    ? "bg-[#2cb696]/10 border-[#2cb696] text-white shadow-lg shadow-[#2cb696]/10"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">SMTP Gmail / Host</span>
                  {config.provider === "smtp" && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2cb696]" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Dùng hòm thư Gmail (Mật khẩu ứng dụng) hoặc máy chủ mail nội bộ.
                </p>
              </div>

              {/* Option 3: Mock */}
              <div
                onClick={() => handleProviderChange("mock")}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  config.provider === "mock"
                    ? "bg-[#2cb696]/10 border-[#2cb696] text-white shadow-lg shadow-[#2cb696]/10"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm">Chế Độ Thử Nghiệm (Mock)</span>
                  {config.provider === "mock" && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2cb696]" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Ghi log và kiểm tra quy trình mà không tốn quota email thật.
                </p>
              </div>
            </div>
          </div>

          {/* Chi tiết thông số cấu hình */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-[#2cb696]" />
              Thông Số Cấu Hình Chi Tiết
            </h2>

            {/* Nếu là Resend */}
            {config.provider === "resend" && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Resend API Key <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={config.resendApiKey || ""}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, resendApiKey: e.target.value }))
                  }
                  placeholder="re_xxxxxxxxxxxxxx"
                  required={config.provider === "resend"}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#2cb696]"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Lấy API key tại bảng điều khiển <a href="https://resend.com/api-keys" target="_blank" className="text-[#2cb696] underline">resend.com</a>.
                </p>
              </div>
            )}

            {/* Nếu là SMTP */}
            {config.provider === "smtp" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      SMTP Host <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={config.smtpHost || "smtp.gmail.com"}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, smtpHost: e.target.value }))
                      }
                      placeholder="smtp.gmail.com"
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#2cb696]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Cổng Port
                    </label>
                    <input
                      type="number"
                      value={config.smtpPort || 465}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          smtpPort: parseInt(e.target.value, 10),
                        }))
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#2cb696]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tài khoản Email đăng nhập <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={config.smtpUser || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, smtpUser: e.target.value }))
                      }
                      placeholder="ten_email@gmail.com"
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#2cb696]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mật khẩu ứng dụng (App Password) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      value={config.smtpPass || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, smtpPass: e.target.value }))
                      }
                      placeholder="16 ký tự mã ứng dụng Google"
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#2cb696]"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Lưu ý với Gmail: Tạo <strong>Mật khẩu ứng dụng (App Password)</strong> tại mục Quản lý tài khoản Google &gt; Bảo mật &gt; Xác minh 2 bước.
                </p>
              </div>
            )}

            {/* Thông tin Người gửi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tên hiển thị người gửi
                </label>
                <input
                  type="text"
                  value={config.fromName || "InterGreat Education Group"}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, fromName: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#2cb696]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Địa chỉ Email người gửi
                </label>
                <input
                  type="email"
                  value={config.fromEmail || "events@intergreat.com"}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, fromEmail: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-[#2cb696]"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="py-2.5 px-6 rounded-xl bg-[#2cb696] hover:bg-[#23977c] text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-[#2cb696]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Lưu Cấu Hình Phương Thức Gửi</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Thử nghiệm gửi Email Test */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Send className="w-4 h-4 text-indigo-400" />
          Kiểm Tra Kết Nối & Gửi Email Thử Nghiệm
        </h2>
        <p className="text-xs text-slate-400">
          Gửi thử 1 email test với cấu hình vừa nhập để kiểm tra xem email có vào hộp thư đến không.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Nhập địa chỉ email của bạn để nhận thư test..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={handleTestEmail}
            disabled={isTesting || !testEmail.trim()}
            className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang gửi thử...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Gửi Thử Nghiệm Ngay</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
