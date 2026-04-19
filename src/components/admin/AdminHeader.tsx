"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

export default function AdminHeader() {
  return (
    <header
      className="border-b"
      style={{ backgroundColor: "#FAF7F2", borderColor: "#E8DCC8" }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/admin"
          className="text-xl font-light tracking-widest"
          style={{ fontFamily: "var(--font-playfair)", color: "#2C1F0E" }}
        >
          Folio
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/admin/galleries/new"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
            style={{ backgroundColor: "#C9A97A", color: "#FAF7F2", fontFamily: "var(--font-inter)" }}
          >
            <span>+</span> Новая галерея
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm transition-colors"
            style={{ color: "#9A7340", fontFamily: "var(--font-inter)" }}
          >
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
}
