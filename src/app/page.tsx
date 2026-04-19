"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

export default function HomePage() {
  return (
    <main
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(135deg, #FAF7F2 0%, #EDE3D4 50%, #D9C9AB 100%)" }}
    >
      {/* Decorative circles */}
      <motion.div
        className="absolute top-[-120px] right-[-120px] w-[400px] h-[400px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, #C9A97A, transparent)" }}
        animate={{ scale: [1, 1.05, 1], rotate: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #B8904F, transparent)" }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">

        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-px h-8 bg-[#C9A97A]" />
            <span
              className="text-xs tracking-[0.3em] uppercase text-[#9A7340]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Фотогалереи
            </span>
            <div className="w-px h-8 bg-[#C9A97A]" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
          className="text-6xl sm:text-7xl font-light tracking-tight text-[#2C1F0E] mb-6 leading-none"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Folio
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="text-base text-[#7A5A32] leading-relaxed mb-12 max-w-xs"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Ваши фотографии.<br />
          Ваши клиенты.<br />
          Всё просто.
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
          className="w-16 h-px bg-[#C9A97A] mb-12"
        />

        {/* Google Sign In */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
          whileHover={{ scale: 1.02, boxShadow: "0 8px 32px rgba(185, 144, 79, 0.25)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => signIn("google", { callbackUrl: "/admin" })}
          className="flex items-center gap-3 px-8 py-4 rounded-full border border-[#C9A97A]/50 bg-white/60 backdrop-blur-sm text-[#5C4124] hover:bg-white/80 transition-all duration-300 cursor-pointer"
          style={{ fontFamily: "var(--font-inter)", fontSize: "0.9rem", letterSpacing: "0.02em" }}
        >
          <GoogleIcon />
          Войти через Google
        </motion.button>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 text-xs text-[#9A7340]/60 tracking-wide"
        >
          Доступ только для авторизованных
        </motion.p>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
