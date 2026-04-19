"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

const features = [
  { icon: "◈", text: "Гalerien in Sekunden teilen" },
  { icon: "◎", text: "Originals auf Abruf laden" },
  { icon: "♡", text: "Kunden markieren Favoriten" },
];

export default function HomePage() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden select-none">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "linear-gradient(135deg, #FAF7F2 0%, #EDE3D4 40%, #D9C9AB 100%)",
            "linear-gradient(160deg, #F5EFE6 0%, #E8DCC8 45%, #C9A97A55 100%)",
            "linear-gradient(135deg, #FAF7F2 0%, #EDE3D4 40%, #D9C9AB 100%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: "200px",
      }} />

      {/* Large decorative circle top-right */}
      <motion.div
        className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle at center, #C9A97A22, transparent 70%)" }}
        animate={{ scale: [1, 1.06, 1], rotate: [0, 15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Medium circle bottom-left */}
      <motion.div
        className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle at center, #B8904F18, transparent 70%)" }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* Thin lines decoration */}
      <div className="absolute top-8 left-8 opacity-20">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-px bg-[#C9A97A] mb-3"
            initial={{ height: 0 }}
            animate={{ height: 40 }}
            transition={{ delay: 0.5 + i * 0.15, duration: 0.6 }}
          />
        ))}
      </div>
      <div className="absolute bottom-8 right-8 opacity-20">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-px bg-[#C9A97A] ml-auto mb-2"
            initial={{ width: 0 }}
            animate={{ width: 40 }}
            transition={{ delay: 0.7 + i * 0.15, duration: 0.6 }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md">

        {/* Aperture icon */}
        <motion.div
          initial={{ opacity: 0, rotate: -20 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-6"
        >
          <ApertureIcon />
        </motion.div>

        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-3 mb-5"
        >
          <div className="w-8 h-px" style={{ backgroundColor: "#C9A97A" }} />
          <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: "#9A7340" }}>
            Fotogalerien
          </span>
          <div className="w-8 h-px" style={{ backgroundColor: "#C9A97A" }} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-7xl sm:text-8xl font-light leading-none mb-4 tracking-tight"
          style={{ fontFamily: "var(--font-playfair)", color: "#2C1F0E" }}
        >
          Folio
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-sm leading-relaxed mb-8"
          style={{ color: "#7A5A32", fontFamily: "var(--font-inter)", letterSpacing: "0.03em" }}
        >
          Ihre Fotos. Ihre Kunden. Ganz einfach.
        </motion.p>

        {/* Feature list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-col gap-2 mb-10 w-full max-w-xs"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="flex items-center gap-3 text-left px-4 py-2.5 rounded-xl"
              style={{ backgroundColor: "rgba(255,255,255,0.35)" }}
            >
              <span className="text-base" style={{ color: "#C9A97A" }}>{f.icon}</span>
              <span className="text-xs" style={{ color: "#5C4124", fontFamily: "var(--font-inter)" }}>{f.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Sign in button */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(185,144,79,0.3)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => signIn("google", { callbackUrl: "/admin" })}
          className="flex items-center gap-3 px-8 py-4 rounded-full text-sm cursor-pointer transition-all w-full justify-center"
          style={{
            backgroundColor: "#2C1F0E",
            color: "#FAF7F2",
            fontFamily: "var(--font-inter)",
            letterSpacing: "0.04em",
          }}
        >
          <GoogleIcon />
          Mit Google anmelden
        </motion.button>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 flex flex-col items-center gap-1"
        >
          <p className="text-[10px] tracking-widest uppercase" style={{ color: "#9A7340", opacity: 0.5 }}>
            Nur für autorisierte Nutzer
          </p>
          <p className="text-[10px]" style={{ color: "#9A7340", opacity: 0.4 }}>
            © Andrii Golik
          </p>
        </motion.div>
      </div>
    </main>
  );
}

function ApertureIcon() {
  return (
    <motion.svg
      width="44" height="44" viewBox="0 0 44 44" fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="22" cy="22" r="20" stroke="#C9A97A" strokeWidth="1" strokeOpacity="0.5" />
      <circle cx="22" cy="22" r="6" stroke="#C9A97A" strokeWidth="1.5" />
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 22 + 8 * Math.cos(rad);
        const y1 = 22 + 8 * Math.sin(rad);
        const x2 = 22 + 19 * Math.cos(rad + 0.4);
        const y2 = 22 + 19 * Math.sin(rad + 0.4);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C9A97A" strokeWidth="1" strokeOpacity="0.6" />;
      })}
    </motion.svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
