"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Download, Check, Share2 } from "lucide-react";

interface DownloadTicketButtonProps {
  ticketCode: string;
  isNewRegistration?: boolean;
  qrDataUrl: string;
  fullName: string;
  eventTitle: string;
  department: string;
}

export default function DownloadTicketButton({
  ticketCode,
  isNewRegistration,
  qrDataUrl,
  fullName,
  eventTitle,
  department,
}: DownloadTicketButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isNewRegistration) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [isNewRegistration]);

  const handleShareOrCopy = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vé sự kiện: ${eventTitle}`,
          text: `Vé tham dự sự kiện của ${fullName} - Mã vé: ${ticketCode}`,
          url: url,
        });
        return;
      } catch {
        // Fallback copy nếu người dùng hủy share
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadImage = () => {
    // Vẽ vé ra thẻ Canvas để xuất ảnh PNG chất lượng cao
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 820;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Nền gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 820);
    gradient.addColorStop(0, "#0f172a");
    gradient.addColorStop(1, "#020617");
    ctx.fillStyle = gradient;
    ctx.roundRect(0, 0, 600, 820, 24);
    ctx.fill();

    // Viền Teal
    ctx.strokeStyle = "rgba(44, 182, 150, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tiêu đề
    ctx.fillStyle = "#2cb696";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("INTERGREAT EDUCATION GROUP", 300, 48);

    // Tên sự kiện
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(eventTitle.length > 35 ? eventTitle.substring(0, 32) + "..." : eventTitle, 300, 85);

    // Khung trắng chứa QR Code
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(140, 120, 320, 320, 16);
    ctx.fill();

    // Vẽ QR Code
    const qrImage = new Image();
    qrImage.onload = () => {
      ctx.drawImage(qrImage, 150, 130, 300, 300);

      // Mã vé
      ctx.fillStyle = "#2cb696";
      ctx.font = "bold 26px monospace";
      ctx.fillText(ticketCode, 300, 480);

      // Đường kẻ đứt
      ctx.strokeStyle = "rgba(44, 182, 150, 0.3)";
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(40, 520);
      ctx.lineTo(560, 520);
      ctx.stroke();
      ctx.setLineDash([]);

      // Thông tin khách mời
      ctx.textAlign = "left";
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px sans-serif";
      ctx.fillText("Họ và tên:", 80, 565);
      ctx.fillText("Phòng ban:", 80, 605);

      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(fullName, 520, 565);
      ctx.fillText(department, 520, 605);

      // Chân vé
      ctx.textAlign = "center";
      ctx.fillStyle = "#64748b";
      ctx.font = "13px sans-serif";
      ctx.fillText("Xuất trình mã QR này tại bàn tiếp đón InterGreat để check-in", 300, 725);

      // Tải ảnh về
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `ticket-${ticketCode}.png`;
      a.click();
    };
    qrImage.src = qrDataUrl;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-6">
      <button
        onClick={handleDownloadImage}
        className="flex-1 py-3 px-4 rounded-xl bg-[#2cb696] hover:bg-[#23977c] active:scale-[0.98] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#2cb696]/20 transition-all cursor-pointer"
      >
        <Download className="w-4 h-4" />
        <span>Tải ảnh vé QR về máy</span>
      </button>

      <button
        onClick={handleShareOrCopy}
        className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-slate-200 font-medium text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-[#2cb696]" />
            <span className="text-[#2cb696]">Đã sao chép link!</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            <span>Lưu / Chia sẻ link vé</span>
          </>
        )}
      </button>
    </div>
  );
}
