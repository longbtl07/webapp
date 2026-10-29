"use client";

import { useState } from "react";
import { KeyRound, Check, Loader2 } from "lucide-react";

interface ManualCodeInputProps {
  onSubmit: (code: string) => void;
  isProcessing: boolean;
}

export default function ManualCodeInput({ onSubmit, isProcessing }: ManualCodeInputProps) {
  const [inputCode, setInputCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim() || isProcessing) return;
    onSubmit(inputCode.trim().toUpperCase());
    setInputCode("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Nhập mã vé (VD: EVT-2026-TEST01)"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 text-xs sm:text-sm uppercase font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            disabled={isProcessing}
          />
        </div>
        <button
          type="submit"
          disabled={!inputCode.trim() || isProcessing}
          className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer shrink-0"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Kiểm tra</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
