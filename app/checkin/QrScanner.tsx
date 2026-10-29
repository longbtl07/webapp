"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats, Html5QrcodeScannerState } from "html5-qrcode";
import { Camera, SwitchCamera, AlertTriangle, Play, Square, Upload, Image as ImageIcon } from "lucide-react";

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  isProcessing: boolean;
}

export default function QrScanner({ onScanSuccess, isProcessing }: QrScannerProps) {
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const lastScannedTimeRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Lấy danh sách camera khi khởi chạy
  useEffect(() => {
    isMountedRef.current = true;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!isMountedRef.current) return;
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Ưu tiên camera sau (back / environment) nếu có
          const backCam = devices.find(
            (d) =>
              d.label.toLowerCase().includes("back") ||
              d.label.toLowerCase().includes("sau") ||
              d.label.toLowerCase().includes("environment")
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        } else {
          setCameraError("Không tìm thấy camera trên thiết bị.");
        }
      })
      .catch((err) => {
        console.warn("Lỗi lấy danh sách camera:", err);
        setCameraError("Chưa cấp quyền truy cập camera hoặc thiết bị không có camera.");
      });

    return () => {
      isMountedRef.current = false;
      // Dọn dẹp an toàn khi component unmount
      safeStopScanner();
    };
  }, []);

  const safeStopScanner = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    try {
      const state = scanner.getState();
      if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED) {
        await scanner.stop();
      }
      await scanner.clear();
    } catch (err) {
      // Bắt lỗi nuốt exception chuyển trạng thái của html5-qrcode
      console.warn("Safe stop scanner warning:", err);
    } finally {
      if (isMountedRef.current) {
        setIsCameraActive(false);
        setIsInitializing(false);
      }
    }
  };

  const handleScan = useCallback(
    (decodedText: string) => {
      const now = Date.now();
      if (now - lastScannedTimeRef.current < 2500) {
        return;
      }
      lastScannedTimeRef.current = now;
      onScanSuccess(decodedText);
    },
    [onScanSuccess]
  );

  const startScanningWithCamera = async (cameraId: string) => {
    if (!cameraId || isInitializing) return;

    setIsInitializing(true);
    setCameraError(null);

    // Dừng scanner cũ trước nếu đang chạy
    await safeStopScanner();

    if (!isMountedRef.current) return;

    try {
      const qrScannerId = "qr-reader-container";
      const scanner = new Html5Qrcode(qrScannerId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = scanner;

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {
          // Frame scan error - ignore
        }
      );

      if (isMountedRef.current) {
        setIsCameraActive(true);
        setCameraError(null);
      } else {
        await safeStopScanner();
      }
    } catch (err: unknown) {
      console.warn("Lỗi khởi động camera:", err);
      if (isMountedRef.current) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Không thể mở camera. Vui lòng cấp quyền hoặc sử dụng ô nhập tay bên dưới.";
        setCameraError(errorMsg.includes("transition") ? null : errorMsg);
        setIsCameraActive(false);
      }
    } finally {
      if (isMountedRef.current) {
        setIsInitializing(false);
      }
    }
  };

  // Nút bật/tắt camera
  const handleToggleCameraActive = () => {
    if (isCameraActive) {
      safeStopScanner();
    } else {
      if (selectedCameraId) {
        startScanningWithCamera(selectedCameraId);
      } else if (cameras.length > 0) {
        startScanningWithCamera(cameras[0].id);
      }
    }
  };

  // Chuyển đổi camera
  const handleSwitchCamera = async () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];
    setSelectedCameraId(nextCamera.id);

    if (isCameraActive) {
      await startScanningWithCamera(nextCamera.id);
    }
  };

  // Quét từ file ảnh
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const scanner =
        scannerRef.current ??
        new Html5Qrcode("qr-reader-container", {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
      scannerRef.current = scanner;

      const result = await scanner.scanFile(file, true);
      if (result) {
        handleScan(result);
      }
    } catch {
      setCameraError("Không nhận diện được mã QR từ hình ảnh vừa chọn. Vui lòng thử ảnh khác.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Vùng Scanner Viewport */}
      <div className="relative w-full aspect-square max-w-[320px] bg-slate-900 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl flex flex-col items-center justify-center">
        {/* DOM node cho Html5Qrcode */}
        <div
          id="qr-reader-container"
          className={`w-full h-full object-cover ${!isCameraActive ? "hidden" : "block"}`}
        />

        {/* Trạng thái khi camera đang tắt */}
        {!isCameraActive && (
          <div className="p-6 text-center text-slate-400 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 text-indigo-400 flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8 opacity-70" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Camera Đang Tắt</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">
                Bấm nút bên dưới để mở camera hoặc chọn ảnh mã vé từ máy.
              </p>
            </div>
          </div>
        )}

        {/* Khung ngắm & laser khi đang quét */}
        {isCameraActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-56 h-56 border-2 border-transparent">
              {/* 4 Góc ngắm */}
              <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

              {/* Đường laser quét */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse top-1/2 -translate-y-1/2" />
            </div>

            {isProcessing && (
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs font-semibold text-emerald-300">Đang đối soát vé...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Thông báo lỗi nếu có */}
        {cameraError && (
          <div className="absolute bottom-3 left-3 right-3 bg-red-950/90 border border-red-500/40 p-2.5 rounded-xl text-center text-[11px] text-red-200 backdrop-blur-sm">
            <p>{cameraError}</p>
          </div>
        )}
      </div>

      {/* Thanh điều khiển chuyên nghiệp */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
        {/* Nút Bật/Tắt Camera */}
        <button
          type="button"
          onClick={handleToggleCameraActive}
          disabled={isInitializing}
          className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md cursor-pointer ${
            isCameraActive
              ? "bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
          }`}
        >
          {isCameraActive ? (
            <>
              <Square className="w-3.5 h-3.5 fill-rose-400" />
              <span>Tắt Camera</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isInitializing ? "Đang mở camera..." : "Bật Camera Quét"}</span>
            </>
          )}
        </button>

        {/* Nút đổi camera (nếu có nhiều camera) */}
        {cameras.length > 1 && (
          <button
            type="button"
            onClick={handleSwitchCamera}
            className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
            title="Đổi camera trước / sau"
          >
            <SwitchCamera className="w-3.5 h-3.5 text-indigo-400" />
            <span>Đổi Cam</span>
          </button>
        )}

        {/* Nút tải ảnh mã QR lên */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileScan}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
          title="Tải ảnh mã vé QR"
        >
          <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>Tải ảnh QR</span>
        </button>
      </div>
    </div>
  );
}
