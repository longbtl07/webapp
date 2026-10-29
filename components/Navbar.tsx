"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Calendar, ScanLine, BarChart3, Home } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/events", label: "Sự kiện", icon: Calendar },
    { href: "/checkin", label: "Check-in", icon: ScanLine },
    { href: "/admin", label: "Quản trị", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo InterGreat */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-white p-1 rounded-xl shadow-sm flex items-center justify-center">
            <Image
              src="/intergreat-logo.png"
              alt="InterGreat Education Group"
              width={110}
              height={32}
              className="h-7 w-auto object-contain"
              priority
            />
          </div>
          <div className="hidden sm:block border-l border-slate-700 pl-3">
            <span className="text-xs font-bold text-white tracking-wide block uppercase">
              Event Hub
            </span>
            <span className="text-[10px] text-teal-400 font-medium block">
              Education Group
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#2cb696] text-white shadow-md shadow-[#2cb696]/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
