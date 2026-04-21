"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

// Bokeh circles config
const BOKEH = [
  { size: 320, x: "10%",  y: "15%",  color: "rgba(255,107,0,0.07)",  blur: 60, delay: 0,   dur: 14 },
  { size: 180, x: "75%",  y: "8%",   color: "rgba(255,140,50,0.09)", blur: 40, delay: 2,   dur: 11 },
  { size: 240, x: "85%",  y: "60%",  color: "rgba(255,107,0,0.06)",  blur: 50, delay: 1,   dur: 16 },
  { size: 140, x: "20%",  y: "75%",  color: "rgba(255,160,80,0.08)", blur: 35, delay: 3,   dur: 12 },
  { size: 400, x: "50%",  y: "50%",  color: "rgba(255,107,0,0.04)",  blur: 80, delay: 0.5, dur: 20 },
  { size: 100, x: "60%",  y: "25%",  color: "rgba(255,200,100,0.1)", blur: 25, delay: 4,   dur: 9  },
  { size: 200, x: "5%",   y: "45%",  color: "rgba(255,107,0,0.05)",  blur: 45, delay: 1.5, dur: 18 },
  { size: 120, x: "90%",  y: "85%",  color: "rgba(255,140,50,0.08)", blur: 30, delay: 2.5, dur: 13 },
];

export default function HomePage() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden select-none bg-[#080808]">

      {/* Bokeh layer */}
      {BOKEH.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: b.size,
            height: b.size,
            left: b.x,
            top: b.y,
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle at center, ${b.color}, transparent 70%)`,
            filter: `blur(${b.blur}px)`,
          }}
          animate={{
            scale: [1, 1.15, 0.95, 1],
            opacity: [0.7, 1, 0.8, 0.7],
            x: [0, 20, -15, 0],
            y: [0, -15, 20, 0],
          }}
          transition={{
            duration: b.dur,
            repeat: Infinity,
            ease: "easeInOut",
            delay: b.delay,
          }}
        />
      ))}

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md">

        {/* Aperture */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-6"
        >
          <ApertureIcon />
        </motion.div>

        {/* Personal tag */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center gap-3 mb-3"
        >
          <div className="w-6 h-px bg-orange-500/40" />
          <span className="text-[10px] tracking-[0.4em] uppercase text-orange-500/60">
            Andrii Golik · Fotograf
          </span>
          <div className="w-6 h-px bg-orange-500/40" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-8xl font-light leading-none mb-4 tracking-tight text-white"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Folio
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="text-sm leading-relaxed mb-3 text-neutral-300"
          style={{ fontFamily: "var(--font-inter)", letterSpacing: "0.02em" }}
        >
          Meine persönliche Galerie-Plattform
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          className="text-xs leading-relaxed mb-8 text-neutral-500 max-w-xs"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Hier teile ich meine Fotoserien bequem mit meinen Kunden — zum Ansehen, Auswählen und Herunterladen.
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="flex gap-3 mb-10 w-full justify-center flex-wrap"
        >
          {[
            { icon: "◈", label: "Galerien teilen" },
            { icon: "↓", label: "Original laden" },
            { icon: "♡", label: "Favoriten" },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.08 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.07] bg-white/[0.03]"
            >
              <span className="text-orange-500 text-sm">{f.icon}</span>
              <span className="text-xs text-neutral-400" style={{ fontFamily: "var(--font-inter)" }}>{f.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.5 }}
          whileHover={{ scale: 1.02, boxShadow: "0 0 50px rgba(255,107,0,0.3)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => signIn("google", { callbackUrl: "/admin" })}
          className="flex items-center gap-3 px-8 py-4 rounded-full text-sm cursor-pointer w-full justify-center font-medium"
          style={{
            background: "linear-gradient(135deg, #FF6B00, #FF9033)",
            color: "#fff",
            fontFamily: "var(--font-inter)",
            letterSpacing: "0.05em",
            boxShadow: "0 4px 30px rgba(255,107,0,0.25)",
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
          className="mt-7 flex flex-col items-center gap-1"
        >
          <p className="text-[10px] tracking-widest uppercase text-neutral-700">
            Nur für autorisierte Nutzer
          </p>
          <p className="text-[10px] text-neutral-700">© Andrii Golik</p>
        </motion.div>
      </div>
    </main>
  );
}

function ApertureIcon() {
  const lines = [0, 60, 120, 180, 240, 300].map((angle) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x1: 26 + 9 * Math.cos(rad),
      y1: 26 + 9 * Math.sin(rad),
      x2: 26 + 23 * Math.cos(rad + 0.4),
      y2: 26 + 23 * Math.sin(rad + 0.4),
    };
  });
  return (
    <motion.svg
      width="56" height="56" viewBox="0 0 52 52" fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="26" cy="26" r="24" stroke="#FF6B00" strokeWidth="0.8" strokeOpacity="0.2" />
      <circle cx="26" cy="26" r="15" stroke="#FF6B00" strokeWidth="0.5" strokeOpacity="0.1" strokeDasharray="3 5" />
      <circle cx="26" cy="26" r="7" stroke="#FF6B00" strokeWidth="1.5" strokeOpacity="0.9" />
      {lines.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="#FF6B00" strokeWidth="1.2" strokeOpacity="0.55" />
      ))}
    </motion.svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="rgba(255,255,255,0.95)"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(255,255,255,0.95)"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="rgba(255,255,255,0.95)"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(255,255,255,0.95)"/>
    </svg>
  );
}
