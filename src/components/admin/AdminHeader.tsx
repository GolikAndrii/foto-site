"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminHeader() {
  const pathname = usePathname();
  const isRoot = pathname === "/admin";

  return (
    <header className="border-b border-white/[0.06] bg-[#0C0C0C]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/admin"
          className="flex items-center gap-2.5 group"
        >
          <ApertureSmall />
          <span
            className="text-lg font-light tracking-[0.2em] text-white group-hover:text-orange-400 transition-colors"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Folio
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!isRoot && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 11L5 7l4-4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Назад
            </Link>
          )}

          <Link
            href="/admin/galleries/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: "linear-gradient(135deg, #FF6B00, #FF8C33)",
              color: "#fff",
              fontFamily: "var(--font-inter)",
              boxShadow: "0 2px 12px rgba(255,107,0,0.25)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 2v10M2 7h10" strokeLinecap="round"/>
            </svg>
            Новая галерея
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-all"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 7h7M9 5l2 2-2 2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 2H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2" strokeLinecap="round"/>
            </svg>
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
}

function ApertureSmall() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="10" stroke="#FF6B00" strokeWidth="1" strokeOpacity="0.4" />
      <circle cx="11" cy="11" r="3.5" stroke="#FF6B00" strokeWidth="1.2" />
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 11 + 4.5 * Math.cos(rad);
        const y1 = 11 + 4.5 * Math.sin(rad);
        const x2 = 11 + 9.5 * Math.cos(rad + 0.4);
        const y2 = 11 + 9.5 * Math.sin(rad + 0.4);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FF6B00" strokeWidth="0.8" strokeOpacity="0.6" />;
      })}
    </svg>
  );
}
