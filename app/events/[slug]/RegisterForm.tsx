"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, BadgeCheck, Building2, Loader2, AlertCircle } from "lucide-react";
import { RegisterResponse } from "@/lib/types";

interface RegisterFormProps {
  eventSlug: string;
}

const DEPARTMENTS = [
  "Ban Giám Đốc / Executive",
  "Kỹ thuật & Công nghệ (Engineering & Tech)",
  "Phát triển Sản phẩm (Product & Design)",
  "Kinh doanh & Bán hàng (Sales & BD)",
  "Tiếp thị & Truyền thông (Marketing)",
  "Nhân sự & Hành chính (HR & Admin)",
  "Tài chính & Kế toán (Finance & Accounting)",
  "Chăm sóc Khách hàng (Customer Success)",
  "Vận hành (Operations)",
  "Khác (Other)",
];

export default function RegisterForm({ eventSlug }: RegisterFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    employeeId: "",
    department: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [existingCode, setExistingCode] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMessage) {
      setErrorMessage(null);
      setExistingCode(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setExistingCode(null);

    // Validate nhanh
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phoneNumber ||
      !formData.employeeId ||
      !formData.department
    ) {
      setErrorMessage("Vui lòng nhập đầy đủ các trường thông tin bên dưới.");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMessage("Địa chỉ email không hợp lệ (ví dụ: ten@company.com).");
      setIsLoading(false);
      return;
    }

    const cleanPhone = formData.phoneNumber.trim().replace(/\s+/g, "");
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setErrorMessage("Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại di động 10 số (ví dụ: 0912345678).");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug,
          ...formData,
        }),
      });

      const data: RegisterResponse = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Đăng ký không thành công.");
        if (data.ticketCode) {
          setExistingCode(data.ticketCode);
        }
        setIsLoading(false);
        return;
      }

      // Đăng ký thành công -> chuyển sang trang vé
      if (data.ticketCode) {
        router.push(`/tickets/${data.ticketCode}?registered=true`);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1">
            <p>{errorMessage}</p>
            {existingCode && (
              <button
                type="button"
                onClick={() => router.push(`/tickets/${existingCode}`)}
                className="mt-2 text-xs font-semibold text-red-800 underline hover:text-red-950 inline-block"
              >
                Nhấn vào đây để xem vé đã đăng ký ({existingCode}) →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Họ và tên */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Ví dụ: Nguyễn Văn An"
            required
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2cb696] focus:border-transparent transition-all placeholder:text-slate-400 text-sm shadow-sm"
          />
        </div>
      </div>

      {/* Email công ty */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Email công ty <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="an.nv@company.com"
            required
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2cb696] focus:border-transparent transition-all placeholder:text-slate-400 text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Số điện thoại */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
            <input
              type="tel"
              inputMode="numeric"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="0912345678"
              maxLength={12}
              required
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2cb696] focus:border-transparent transition-all placeholder:text-slate-400 text-sm shadow-sm font-mono"
            />
          </div>
        </div>

        {/* Mã nhân viên */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Mã nhân viên <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <BadgeCheck className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              placeholder="EMP001"
              required
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2cb696] focus:border-transparent transition-all placeholder:text-slate-400 text-sm uppercase shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Phòng ban */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Phòng ban / Bộ phận <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Building2 className="absolute left-3.5 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2cb696] focus:border-transparent transition-all text-sm shadow-sm appearance-none"
          >
            <option value="">-- Chọn phòng ban của bạn --</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Nút gửi */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-4 py-3.5 px-4 rounded-xl bg-[#2cb696] hover:bg-[#23977c] text-white font-semibold text-sm shadow-md shadow-[#2cb696]/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Đang tạo vé & gửi email...</span>
          </>
        ) : (
          <span>Đăng ký & Nhận vé QR ngay</span>
        )}
      </button>

      <p className="text-center text-xs text-slate-400 mt-2">
        Mã vé QR sẽ được cấp tức thì trên màn hình ngay sau khi đăng ký thành công.
      </p>
    </form>
  );
}
