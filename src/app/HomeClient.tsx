"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

const BOKEH = [
  { size: 420, x: "10%", y: "20%", color: "rgba(124,58,237,0.35)", blur: 55, delay: 0,   dur: 14 },
  { size: 240, x: "78%", y: "10%", color: "rgba(99,102,241,0.30)",  blur: 38, delay: 2,   dur: 11 },
  { size: 320, x: "85%", y: "65%", color: "rgba(124,58,237,0.28)", blur: 45, delay: 1,   dur: 16 },
  { size: 180, x: "22%", y: "78%", color: "rgba(167,139,250,0.32)",blur: 30, delay: 3,   dur: 12 },
  { size: 500, x: "50%", y: "50%", color: "rgba(99,102,241,0.18)",  blur: 75, delay: 0.5, dur: 20 },
];

export default function HomeClient({ photoUrls }: { photoUrls: string[] }) {
  const [lensPos, setLensPos]   = useState({ x: -999, y: -999 }); // off-screen initially
  const [mounted, setMounted]   = useState(false);
  const frameRef = useRef<number>(undefined);
  const tRef     = useRef(0);

  useEffect(() => {
    setMounted(true);

    const isMobile = window.matchMedia("(hover: none)").matches;
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;

    if (isMobile) {
      // Auto-animate lens in slow Lissajous path
      const rx = window.innerWidth  * 0.34;
      const ry = window.innerHeight * 0.26;
      const animate = () => {
        tRef.current += 0.006;
        const t = tRef.current;
        setLensPos({
          x: cx + rx * Math.cos(t * 0.71) * Math.cos(t * 0.27),
          y: cy + ry * Math.sin(t * 0.53) * Math.cos(t * 0.38 + 0.5),
        });
        frameRef.current = requestAnimationFrame(animate);
      };
      // small delay so card animation runs first
      const timer = setTimeout(() => { frameRef.current = requestAnimationFrame(animate); }, 1200);
      return () => { clearTimeout(timer); if (frameRef.current) cancelAnimationFrame(frameRef.current); };
    } else {
      // Start lens at screen center, then track mouse
      setLensPos({ x: cx, y: cy });
      const onMove = (e: MouseEvent) => setLensPos({ x: e.clientX, y: e.clientY });
      window.addEventListener("mousemove", onMove);
      return () => window.removeEventListener("mousemove", onMove);
    }
  }, []);

  const hasPhotos  = photoUrls.length > 0;
  const lensR      = 230; // px — sharp circle radius
  const mask       = `radial-gradient(circle ${lensR}px at ${lensPos.x}px ${lensPos.y}px, black 15%, rgba(0,0,0,0.55) 60%, transparent 100%)`;

  return (
    <main
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden select-none"
      style={{ backgroundColor: "#05040F" }}
    >
      {/* ── BOKEH (always — shows through photos or as fallback) ── */}
      {BOKEH.map((b, i) => (
        <motion.div key={i} className="absolute rounded-full pointer-events-none"
          style={{ width: b.size, height: b.size, left: b.x, top: b.y, transform: "translate(-50%,-50%)", background: `radial-gradient(circle at center, ${b.color}, transparent 70%)`, filter: `blur(${b.blur}px)` }}
          animate={{ scale: [1,1.12,0.94,1], opacity: [0.5,0.85,0.6,0.5], x:[0,18,-12,0], y:[0,-14,18,0] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut", delay: b.delay }}
        />
      ))}

      {/* ── PHOTO BACKGROUND (when photos available) ── */}
      {hasPhotos && mounted && (
        <>
          {/* Layer 1 — heavily blurred base */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ filter: "blur(22px) saturate(0.65) brightness(0.55)", transform: "scale(1.08)", zIndex: 1 }}>
            <PhotoGrid urls={photoUrls} />
          </div>

          {/* Layer 2 — sharp, visible only through lens mask */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              filter: "blur(0.5px) saturate(1.1) brightness(0.75)",
              transform: "scale(1.08)",
              zIndex: 2,
              WebkitMaskImage: mask,
              maskImage: mask,
              transition: "mask-position 0.05s",
            }}>
            <PhotoGrid urls={photoUrls} />
          </div>
        </>
      )}

      {/* Dot-grid texture */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "32px 32px" }} />

      {/* ── CONTENT CARD (frosted glass) ── */}
      <div className="relative flex flex-col items-center text-center w-full mx-auto px-6"
        style={{ zIndex: 10, maxWidth: 380 }}>
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: "rgba(6,5,20,0.70)",
            backdropFilter: "blur(32px) saturate(1.4)",
            WebkitBackdropFilter: "blur(32px) saturate(1.4)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 28,
            padding: "40px 32px 36px",
            boxShadow: "0 8px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,58,237,0.07), inset 0 1px 0 rgba(255,255,255,0.05)",
            width: "100%",
          }}
        >
          {/* Aperture */}
          <motion.div initial={{ opacity: 0, scale: 0.6, rotate: -40 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} className="mb-7 flex justify-center">
            <ApertureIcon />
          </motion.div>

          {/* Tag */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-4">
            <div style={{ width: 28, height: 1, background: "rgba(167,139,250,0.3)" }} />
            <span style={{ fontSize: 10, letterSpacing: "0.38em", textTransform: "uppercase", color: "var(--accent-lt)", opacity: 0.7, fontFamily: "var(--font-inter)" }}>
              Andrii Golik · Fotograf
            </span>
            <div style={{ width: 28, height: 1, background: "rgba(167,139,250,0.3)" }} />
          </motion.div>

          {/* Title */}
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontFamily: "var(--font-playfair)", color: "var(--text)", fontSize: 88, fontWeight: 300, lineHeight: 1, marginBottom: 16, letterSpacing: "-0.01em" }}>
            Folio
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.58, duration: 0.6 }}
            style={{ fontFamily: "var(--font-inter)", color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, marginBottom: 8, letterSpacing: "0.02em" }}>
            Meine persönliche Galerie-Plattform
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.68, duration: 0.6 }}
            style={{ fontFamily: "var(--font-inter)", color: "var(--text-3)", fontSize: 12, lineHeight: 1.6, marginBottom: 32 }}>
            Fotoserien bequem mit Kunden teilen — zum Ansehen, Auswählen und Herunterladen.
          </motion.p>

          {/* Feature badges — 2×2 grid */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.78 }}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 28 }}>
            {[
              { icon: <ShareIcon />,    label: "Teilen" },
              { icon: <DownloadIcon />, label: "Downloads" },
              { icon: <LockIcon />,     label: "PIN-Schutz" },
              { icon: <HeartIcon />,    label: "Favoriten" },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.82 + i * 0.07 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.025)" }}>
                <span style={{ color: "var(--accent-lt)" }}>{f.icon}</span>
                <span style={{ fontFamily: "var(--font-inter)", color: "var(--text-3)", fontSize: 12 }}>{f.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.08, duration: 0.5 }}
            whileHover={{ scale: 1.02, boxShadow: "0 0 55px rgba(124,58,237,0.45)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => signIn("google", { callbackUrl: "/admin" })}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "14px 24px", borderRadius: 16, fontSize: 14, fontWeight: 500, cursor: "pointer", background: "linear-gradient(135deg, #7C3AED, #6366F1)", color: "#fff", fontFamily: "var(--font-inter)", letterSpacing: "0.04em", boxShadow: "0 4px 32px rgba(124,58,237,0.3)", border: "none" }}>
            <GoogleIcon />
            Mit Google anmelden
          </motion.button>

          {/* Admin note */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.35 }}
            style={{ marginTop: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-3)", opacity: 0.5, fontFamily: "var(--font-inter)" }}>
              Nur für den Administrator
            </p>
            <p style={{ fontSize: 12, color: "var(--text-2)", fontFamily: "var(--font-inter)" }}>Andrii Golik</p>
            <p style={{ fontSize: 10, color: "var(--text-3)", opacity: 0.35, fontFamily: "var(--font-inter)" }}>Entwickler &amp; Fotograf</p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}

function PhotoGrid({ urls }: { urls: string[] }) {
  const cells = Array.from({ length: 6 }, (_, i) => urls[i % urls.length]);
  return (
    <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(2, 1fr)" }}>
      {cells.map((url, i) => (
        <div key={i} style={{ overflow: "hidden", position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          {/* Vignette — hides hard seams between cells */}
          <div style={{
            position: "absolute", inset: 0,
            boxShadow: "inset 0 0 70px 35px rgba(5,4,15,0.95)",
          }} />
        </div>
      ))}
    </div>
  );
}

function ApertureIcon() {
  const lines = [0, 60, 120, 180, 240, 300].map(angle => {
    const rad = (angle * Math.PI) / 180;
    return { x1: 26 + 9 * Math.cos(rad), y1: 26 + 9 * Math.sin(rad), x2: 26 + 23 * Math.cos(rad + 0.4), y2: 26 + 23 * Math.sin(rad + 0.4) };
  });
  return (
    <motion.svg width="60" height="60" viewBox="0 0 52 52" fill="none"
      animate={{ rotate: 360 }} transition={{ duration: 45, repeat: Infinity, ease: "linear" }}>
      <circle cx="26" cy="26" r="24" stroke="#7C3AED" strokeWidth="0.8" strokeOpacity="0.25"/>
      <circle cx="26" cy="26" r="15" stroke="#A78BFA" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="3 6"/>
      <circle cx="26" cy="26" r="7"  stroke="#A78BFA" strokeWidth="1.6" strokeOpacity="0.95"/>
      {lines.map((l, i) => <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#7C3AED" strokeWidth="1.2" strokeOpacity="0.6"/>)}
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
function ShareIcon()    { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="13" cy="3" r="1.5"/><circle cx="3" cy="8" r="1.5"/><circle cx="13" cy="13" r="1.5"/><path d="M4.5 7.2l7-3.4M4.5 8.8l7 3.4"/></svg>; }
function DownloadIcon() { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M8 2v9M5 8l3 3 3-3"/><path d="M2.5 13.5h11"/></svg>; }
function LockIcon()     { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="7" width="10" height="8" rx="1.5"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/></svg>; }
function HeartIcon()    { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 13.5S2 9.3 2 5.3a3.6 3.6 0 0 1 6-2.7A3.6 3.6 0 0 1 14 5.3c0 4-6 8.2-6 8.2z"/></svg>; }
