"use client";

import { Users, CheckCircle2, Clock, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalRegistrations: number;
    checkedInCount: number;
    pendingCount: number;
    attendanceRate: number;
    capacity: number | null;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tổng số vé đăng ký */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Tổng Đăng Ký
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">
            {stats.totalRegistrations}
          </span>
          {stats.capacity && (
            <span className="text-xs text-slate-500">/ {stats.capacity} chỗ</span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          {stats.capacity
            ? `Còn lại ${Math.max(0, stats.capacity - stats.totalRegistrations)} vé`
            : "Không giới hạn số chỗ"}
        </p>
      </div>

      {/* 2. Đã Check-in */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Đã Check-in
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
            {stats.checkedInCount}
          </span>
          <span className="text-xs text-slate-500">khách</span>
        </div>
        <p className="text-[11px] text-emerald-500/80 mt-2 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Đã có mặt tại hội trường
        </p>
      </div>

      {/* 3. Chưa đến */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Chưa Đến
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-amber-300 tracking-tight">
            {stats.pendingCount}
          </span>
          <span className="text-xs text-slate-500">khách</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">Đang trên đường đến hoặc vắng mặt</p>
      </div>

      {/* 4. Tỷ lệ tham dự */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
            Tỷ Lệ Check-in
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-purple-300 tracking-tight">
            {stats.attendanceRate}%
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${stats.attendanceRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
