"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, SwitchCamera, AlertTriangle, EyeOff } from "lucide-react";

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  isProcessing: boolean;
}

export default function QrScanner({ onScanSuccess, isProcessing }: QrScannerProps) {
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMountedRef = useRef(true);
  const lastScannedTimeRef = useRef<number>(0);

  // Khởi tạo và lấy danh sách camera
  useEffect(() => {
    isMountedRef.current = true;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!isMountedRef.current) return;
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Ưu tiên camera sau (back / environment)
          const backCamera = devices.find(
            (d) =>
              d.label.toLowerCase().includes("back") ||
              d.label.toLowerCase().includes("sau") ||
              d.label.toLowerCase().includes("environment")
          );
          setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
        } else {
          setCameraError("Không tìm thấy thiết bị camera nào trên máy.");
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy danh sách camera:", err);
        setCameraError("Không thể truy cập camera. Vui lòng cấp quyền camera cho trình duyệt.");
      });

    return () => {
      isMountedRef.current = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleScan = useCallback(
    (decodedText: string) => {
      const now = Date.now();
      // Chống quét trùng liên tiếp trong 2.5s
      if (now - lastScannedTimeRef.current < 2500) {
        return;
      }
      lastScannedTimeRef.current = now;
      onScanSuccess(decodedText);
    },
    [onScanSuccess]
  );

  // Khởi động scanner khi có selectedCameraId
  useEffect(() => {
    if (!selectedCameraId) return;

    const qrScannerId = "qr-reader-container";
    const scanner = new Html5Qrcode(qrScannerId, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });
    scannerRef.current = scanner;

    scanner
      .start(
        selectedCameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {
          // Bỏ qua lỗi nhận diện từng frame
        }
      )
      .then(() => {
        setIsScanning(true);
        setCameraError(null);
      })
      .catch((err) => {
        console.error("Lỗi khởi động máy quét:", err);
        setCameraError("Không thể kích hoạt camera. Vui lòng thử đổi camera hoặc nhập mã vé bằng tay.");
        setIsScanning(false);
      });

    return () => {
      if (scanner.isScanning) {
        scanner.stop().catch(() => {});
      }
    };
  }, [selectedCameraId, handleScan]);

  const handleToggleCamera = () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setSelectedCameraId(cameras[nextIndex].id);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Vùng hiển thị Camera */}
      <div className="relative w-full aspect-square max-w-[340px] bg-slate-950 rounded-3xl overflow-hidden border-2 border-indigo-500/40 shadow-2xl flex items-center justify-center">
        <div id="qr-reader-container" className="w-full h-full object-cover" />

        {/* Khung ngắm & hiệu ứng laser quét */}
        {isScanning && !cameraError && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* 4 Góc ngắm */}
            <div className="relative w-64 h-64 border-2 border-transparent">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

              {/* Đường laser quét chuyển động */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse top-1/2 -translate-y-1/2" />
            </div>

            {isProcessing && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs font-semibold text-emerald-300">Đang đối soát vé...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Thông báo lỗi nếu camera không mở được */}
        {cameraError && (
          <div className="absolute inset-0 bg-slate-900 p-6 flex flex-col items-center justify-center text-center text-slate-300">
            <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
            <p className="text-xs text-amber-200 mb-4">{cameraError}</p>
            <p className="text-[11px] text-slate-400">
              Bạn có thể sử dụng ô <strong>Nhập tay mã vé</strong> bên dưới để check-in bình thường.
            </p>
          </div>
        )}
      </div>

      {/* Điều khiển Camera */}
      <div className="flex items-center gap-3 mt-4">
        {cameras.length > 1 && (
          <button
            type="button"
            onClick={handleToggleCamera}
            className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2 border border-slate-700 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <SwitchCamera className="w-4 h-4 text-indigo-400" />
            <span>Đổi Camera</span>
          </button>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Camera className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Camera đang hoạt động</span>
        </div>
      </div>
    </div>
  );
}
