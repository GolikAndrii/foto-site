"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

const features = [
  { icon: <IconGrid />, text: "Galerien in Sekunden teilen" },
  { icon: <IconDownload />, text: "Originale auf Abruf laden" },
  { icon: <IconHeart />, text: "Kunden markieren Favoriten" },
];

export default function HomePage() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden select-none bg-[#0C0C0C]">

      {/* Orange glow top-right */}
      <div className="absolute top-[-160px] right-[-160px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle at center, rgba(255,107,0,0.12), transparent 70%)" }} />

      {/* Orange glow bottom-left */}
      <div className="absolute bottom-[-120px] left-[-120px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle at center, rgba(255,107,0,0.07), transparent 70%)" }} />

      {/* Subtle grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

      {/* Corner decoration — top left */}
      <div className="absolute top-8 left-8 flex flex-col gap-1.5 opacity-30">
        {[0, 1, 2].map((i) => (
          <motion.div key={i} className="w-px bg-orange-500"
            initial={{ height: 0 }} animate={{ height: 32 }}
            transition={{ delay: 0.4 + i * 0.12, duration: 0.5 }} />
        ))}
      </div>

      {/* Corner decoration — bottom right */}
      <div className="absolute bottom-8 right-8 flex flex-col items-end gap-1.5 opacity-30">
        {[0, 1, 2].map((i) => (
          <motion.div key={i} className="h-px bg-orange-500"
            initial={{ width: 0 }} animate={{ width: 32 }}
            transition={{ delay: 0.6 + i * 0.12, duration: 0.5 }} />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm">

        {/* Aperture icon */}
        <motion.div
          initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="mb-8"
        >
          <ApertureIcon />
        </motion.div>

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="w-8 h-px bg-orange-500/50" />
          <span className="text-[10px] tracking-[0.45em] uppercase text-orange-500/70">
            Fotogalerien
          </span>
          <div className="w-8 h-px bg-orange-500/50" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="text-8xl font-light leading-none mb-4 tracking-tight text-white"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Folio
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-sm leading-relaxed mb-8 text-neutral-400"
          style={{ fontFamily: "var(--font-inter)", letterSpacing: "0.03em" }}
        >
          Ihre Fotos. Ihre Kunden. Ganz einfach.
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col gap-2 mb-10 w-full"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65 + i * 0.1 }}
              className="flex items-center gap-3 text-left px-4 py-3 rounded-xl border border-white/5 bg-white/[0.03]"
            >
              <span className="text-orange-500 shrink-0">{f.icon}</span>
              <span className="text-sm text-neutral-300" style={{ fontFamily: "var(--font-inter)" }}>{f.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Sign in button */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(255,107,0,0.25)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => signIn("google", { callbackUrl: "/admin" })}
          className="flex items-center gap-3 px-8 py-4 rounded-full text-sm cursor-pointer w-full justify-center font-medium transition-all"
          style={{
            background: "linear-gradient(135deg, #FF6B00, #FF8C33)",
            color: "#fff",
            fontFamily: "var(--font-inter)",
            letterSpacing: "0.04em",
            boxShadow: "0 4px 24px rgba(255,107,0,0.2)",
          }}
        >
          <GoogleIcon />
          Mit Google anmelden
        </motion.button>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-8 flex flex-col items-center gap-1"
        >
          <p className="text-[10px] tracking-widest uppercase text-neutral-600">
            Nur für autorisierte Nutzer
          </p>
          <p className="text-[10px] text-neutral-700">© Andrii Golik</p>
        </motion.div>
      </div>
    </main>
  );
}

const APERTURE_LINES = [0, 60, 120, 180, 240, 300].map((angle) => {
  const rad = (angle * Math.PI) / 180;
  return {
    x1: Math.round((26 + 9 * Math.cos(rad)) * 1000) / 1000,
    y1: Math.round((26 + 9 * Math.sin(rad)) * 1000) / 1000,
    x2: Math.round((26 + 23 * Math.cos(rad + 0.4)) * 1000) / 1000,
    y2: Math.round((26 + 23 * Math.sin(rad + 0.4)) * 1000) / 1000,
  };
});

function ApertureIcon() {
  return (
    <motion.svg
      width="52" height="52" viewBox="0 0 52 52" fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="26" cy="26" r="24" stroke="#FF6B00" strokeWidth="1" strokeOpacity="0.25" />
      <circle cx="26" cy="26" r="7" stroke="#FF6B00" strokeWidth="1.5" strokeOpacity="0.9" />
      {APERTURE_LINES.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#FF6B00" strokeWidth="1.2" strokeOpacity="0.5" />
      ))}
    </motion.svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="rgba(255,255,255,0.9)"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(255,255,255,0.9)"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="rgba(255,255,255,0.9)"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(255,255,255,0.9)"/>
    </svg>
  );
}

function IconGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2v8M5 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12h12" strokeLinecap="round"/>
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 13.5S1.5 9.5 1.5 5.5a3.5 3.5 0 0 1 6.5-1.8A3.5 3.5 0 0 1 14.5 5.5c0 4-6.5 8-6.5 8z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
