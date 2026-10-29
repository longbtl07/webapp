"use client";

import { CheckCircle2, History, User } from "lucide-react";

export interface RecentScanItem {
  ticketCode: string;
  fullName: string;
  department: string;
  time: string;
}

interface RecentScansProps {
  scans: RecentScanItem[];
}

export default function RecentScans({ scans }: RecentScansProps) {
  if (scans.length === 0) {
    return (
      <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 text-center text-xs text-slate-500">
        <History className="w-4 h-4 mx-auto mb-1 opacity-50" />
        Chưa có lượt check-in nào trong ca này.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 shadow-lg">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-indigo-400" />
          Lượt check-in gần nhất ({scans.length})
        </span>
        <span className="text-[10px] text-slate-500">Tự động lưu</span>
      </div>

      <div className="space-y-2">
        {scans.slice(0, 5).map((scan, idx) => (
          <div
            key={`${scan.ticketCode}-${idx}`}
            className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-xs"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold text-white leading-tight">{scan.fullName}</p>
                <p className="text-[11px] text-slate-400 line-clamp-1">{scan.department}</p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-2">
              <span className="font-mono text-[11px] text-emerald-400 font-medium">
                {scan.time}
              </span>
              <p className="font-mono text-[10px] text-slate-500">{scan.ticketCode}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
