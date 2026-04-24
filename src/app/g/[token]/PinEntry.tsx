"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PinEntry({ galleryId, galleryName }: { galleryId: string; galleryName: string }) {
  const [digits, setDigits] = useState(["", "", ""]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => { refs[0].current?.focus(); }, []);

  function handleDigit(idx: number, char: string) {
    const clean = char.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = clean;
    setDigits(next);
    setError(false);
    if (clean && idx < 2) refs[idx + 1].current?.focus();
    if (clean && idx === 2) {
      submitPin([...next.slice(0, 2), clean]);
    }
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        const next = [...digits];
        next[idx] = "";
        setDigits(next);
      } else if (idx > 0) {
        refs[idx - 1].current?.focus();
      }
    }
  }

  async function submitPin(d: string[]) {
    const pin = d.join("");
    if (pin.length < 3) return;
    setLoading(true);
    const res = await fetch(`/api/galleries/${galleryId}/verify-pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    setLoading(false);
    if (res.ok) {
      window.location.reload();
    } else {
      setDigits(["", "", ""]);
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setTimeout(() => refs[0].current?.focus(), 50);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", backgroundColor: "var(--bg)", padding: 24,
    }}>
      {/* Subtle bokeh */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 400, height: 400, left: "20%", top: "20%", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.08), transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", width: 300, height: 300, right: "15%", bottom: "25%", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.07), transparent 70%)", filter: "blur(50px)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            width: 56, height: 56, borderRadius: 16, marginBottom: 24,
            background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(99,102,241,0.18))",
            border: "1px solid rgba(124,58,237,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.6" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            <circle cx="12" cy="16" r="1.5" fill="#A78BFA" stroke="none"/>
          </svg>
        </motion.div>

        <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: 22, fontWeight: 300, color: "var(--text)", margin: "0 0 6px", textAlign: "center" }}>
          {galleryName}
        </h2>
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "var(--text-3)", marginBottom: 36, textAlign: "center" }}>
          Bitte geben Sie den 3-stelligen PIN ein
        </p>

        {/* PIN boxes */}
        <motion.div
          animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.5 }}
          style={{ display: "flex", gap: 14, marginBottom: 28 }}
        >
          {digits.map((d, i) => (
            <motion.div key={i} style={{ position: "relative" }}>
              <input
                ref={refs[i]}
                type="text"
                inputMode="numeric"
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                maxLength={1}
                disabled={loading}
                style={{
                  width: 64, height: 72, textAlign: "center", fontSize: 28, fontWeight: 700,
                  borderRadius: 14, outline: "none", caretColor: "transparent",
                  fontFamily: "var(--font-inter)", letterSpacing: "0.05em",
                  color: error ? "var(--red)" : (d ? "var(--text)" : "transparent"),
                  background: error
                    ? "rgba(244,63,94,0.1)"
                    : (d ? "rgba(124,58,237,0.15)" : "var(--surface)"),
                  border: error
                    ? "1.5px solid rgba(244,63,94,0.5)"
                    : (d ? "1.5px solid rgba(124,58,237,0.55)" : "1px solid var(--border)"),
                  transition: "all 0.15s",
                  cursor: loading ? "not-allowed" : "text",
                }}
                onFocus={e => {
                  if (!error) e.target.style.borderColor = "var(--accent)";
                }}
                onBlur={e => {
                  if (!error) e.target.style.borderColor = d ? "rgba(124,58,237,0.55)" : "var(--border)";
                }}
              />
              {/* Dot indicator at bottom */}
              <motion.div
                animate={{ opacity: d ? 1 : 0, scaleX: d ? 1 : 0 }}
                style={{
                  position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)",
                  width: 20, height: 2, borderRadius: 2,
                  background: error ? "var(--red)" : "var(--accent)",
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ fontSize: 12, color: "var(--red)", fontFamily: "var(--font-inter)", marginBottom: 16, textAlign: "center" }}
            >
              Falscher PIN. Bitte erneut versuchen.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(124,58,237,0.3)", borderTopColor: "var(--accent)", animation: "spin 0.6s linear infinite" }} />
            <span style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "var(--font-inter)" }}>Prüfen...</span>
          </div>
        )}
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
