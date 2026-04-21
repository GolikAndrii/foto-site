"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Photo = { id: string; previewUrl: string; filename: string };

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill={filled ? "#ff5577" : "none"}
      stroke={filled ? "#ff5577" : "rgba(255,255,255,0.8)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5S2 10.3 2 5.8a3.8 3.8 0 0 1 6.5-2.7A3.8 3.8 0 0 1 15 5.8c0 4.5-6.5 8.7-6.5 8.7z"/>
    </svg>
  );
}

function DownloadIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v9M5 8l3 3 3-3"/>
      <path d="M2.5 13.5h11"/>
    </svg>
  );
}

export default function PublicGalleryClient({ galleryName, photos }: { galleryName: string; photos: Photo[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [cols, setCols] = useState(2);

  useEffect(() => {
    const update = () => setCols(window.innerWidth >= 768 ? 4 : 2);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const [likes, setLikes] = useState<Record<string, { liked: boolean; count: number }>>({});
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (!photos.length) return;
    Promise.all(photos.map(async (p) => {
      const res = await fetch(`/api/photos/${p.id}/like`);
      return [p.id, await res.json()] as const;
    })).then((results) => setLikes(Object.fromEntries(results)));
  }, [photos]);

  async function toggleLike(photoId: string) {
    setLikes((prev) => {
      const cur = prev[photoId] ?? { liked: false, count: 0 };
      return { ...prev, [photoId]: { liked: !cur.liked, count: cur.liked ? cur.count - 1 : cur.count + 1 } };
    });
    const res = await fetch(`/api/photos/${photoId}/like`, { method: "POST" });
    const data = await res.json();
    setLikes((prev) => ({ ...prev, [photoId]: data }));
  }

  async function downloadPhoto(photoId: string, filename: string) {
    setDownloading(photoId);
    const { url } = await fetch(`/api/photos/${photoId}/download`).then((r) => r.json());
    Object.assign(document.createElement("a"), { href: url, download: filename }).click();
    setDownloading(null);
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (lightbox === null) return;
    if (e.key === "ArrowRight") setLightbox((i) => (i! + 1) % photos.length);
    if (e.key === "ArrowLeft") setLightbox((i) => (i! - 1 + photos.length) % photos.length);
    if (e.key === "Escape") setLightbox(null);
  }, [lightbox, photos.length]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const currentPhoto = lightbox !== null ? photos[lightbox] : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0E0E0E" }}>

      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#111" }}>
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="#FF6B00" strokeWidth="0.8" strokeOpacity="0.4"/>
              <circle cx="10" cy="10" r="3" stroke="#FF6B00" strokeWidth="1.4"/>
              {[0,60,120,180,240,300].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                return <line key={i} x1={10 + 3.8 * Math.cos(rad)} y1={10 + 3.8 * Math.sin(rad)}
                  x2={10 + 8.5 * Math.cos(rad + 0.42)} y2={10 + 8.5 * Math.sin(rad + 0.42)}
                  stroke="#FF6B00" strokeWidth="1" strokeOpacity="0.65"/>;
              })}
            </svg>
            <h1 style={{ fontFamily: "var(--font-playfair)", color: "#F0E8D8", fontSize: "15px", fontWeight: 300, letterSpacing: "0.12em" }}>
              {galleryName}
            </h1>
          </div>
          <span style={{ color: "#FF6B00", fontFamily: "var(--font-inter)", fontSize: "12px", letterSpacing: "0.08em" }}>
            {photos.length} {photos.length === 1 ? "Foto" : "Fotos"}
          </span>
        </div>
      </header>

      {/* Hint */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", backgroundColor: "#0a0a0a" }}>
        <div className="max-w-screen-xl mx-auto px-4 py-2">
          <span style={{ color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-inter)", fontSize: "11px", letterSpacing: "0.05em" }}>
            ♥ Markiere deine Lieblingsfotos &nbsp;·&nbsp; ↓ Lade Originale herunter
          </span>
        </div>
      </div>

      {/* Masonry grid — 2 cols mobile, 3 tablet, 4 desktop */}
      <div className="max-w-screen-xl mx-auto px-3 py-4">
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: "6px",
        }}>
          {photos.map((photo, idx) => {
            const liked = likes[photo.id]?.liked ?? false;
            const count = likes[photo.id]?.count ?? 0;

            return (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03, duration: 0.35 }}
                className="relative group"
                style={{ borderRadius: "5px", overflow: "hidden", backgroundColor: "#141414" }}
              >
                {/* Photo — full natural aspect ratio, no crop */}
                <div className="relative cursor-pointer" onClick={() => setLightbox(idx)}>
                  <img
                    src={photo.previewUrl}
                    alt={photo.filename}
                    className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                    style={{ display: "block" }}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)" }} />
                </div>

                {/* Actions */}
                <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-2.5 pb-2" style={{ zIndex: 2 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(photo.id); }}
                    className="flex items-center gap-1 transition-transform active:scale-90"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                  >
                    <HeartIcon filled={liked} />
                    {count > 0 && (
                      <span style={{ color: liked ? "#ff5577" : "rgba(255,255,255,0.7)", fontSize: "11px", fontFamily: "var(--font-inter)", fontWeight: 500 }}>
                        {count}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadPhoto(photo.id, photo.filename); }}
                    disabled={downloading === photo.id}
                    className="flex items-center justify-center transition-transform active:scale-90"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                    title="Original herunterladen"
                  >
                    {downloading === photo.id
                      ? <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>…</span>
                      : <DownloadIcon />}
                  </button>
                </div>

                {liked && (
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ boxShadow: "inset 0 0 0 1.5px rgba(255,85,119,0.5)", borderRadius: "5px" }} />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: "8px" }}>
        <div className="flex items-center justify-center gap-3">
          <div style={{ width: "28px", height: "1px", background: "rgba(255,107,0,0.3)" }} />
          <p style={{ color: "rgba(255,255,255,0.18)", fontFamily: "var(--font-inter)", fontSize: "11px", letterSpacing: "0.07em" }}>
            Fotografie &amp; Galerie von{" "}
            <a href="https://golikandrii.com" target="_blank" rel="noopener noreferrer"
              style={{ color: "rgba(255,107,0,0.55)", textDecoration: "none" }}>
              Andrii Golik
            </a>
          </p>
          <div style={{ width: "28px", height: "1px", background: "rgba(255,107,0,0.3)" }} />
        </div>
      </footer>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && currentPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ backgroundColor: "rgba(6,4,2,0.98)" }}
            onClick={() => setLightbox(null)}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              onClick={(e) => e.stopPropagation()}>
              <span style={{ color: "rgba(240,232,216,0.3)", fontFamily: "var(--font-inter)", fontSize: "13px" }}>
                {lightbox + 1} / {photos.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleLike(currentPhoto.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all"
                  style={{
                    backgroundColor: likes[currentPhoto.id]?.liked ? "rgba(255,85,119,0.15)" : "rgba(255,255,255,0.07)",
                    border: likes[currentPhoto.id]?.liked ? "1px solid rgba(255,85,119,0.35)" : "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                  }}
                >
                  <HeartIcon filled={likes[currentPhoto.id]?.liked ?? false} />
                  {(likes[currentPhoto.id]?.count ?? 0) > 0 && (
                    <span style={{ fontSize: "13px", color: likes[currentPhoto.id]?.liked ? "#ff5577" : "rgba(255,255,255,0.5)", fontFamily: "var(--font-inter)" }}>
                      {likes[currentPhoto.id].count}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => downloadPhoto(currentPhoto.id, currentPhoto.filename)}
                  disabled={downloading === currentPhoto.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: "rgba(255,107,0,0.12)",
                    border: "1px solid rgba(255,107,0,0.25)",
                    color: "#FF8C33",
                    fontFamily: "var(--font-inter)",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  <DownloadIcon size={14} />
                  <span className="hidden sm:inline">{downloading === currentPhoto.id ? "…" : "Original"}</span>
                </button>

                <button
                  onClick={() => setLightbox(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M1 1l9 9M10 1L1 10"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Image — full width on mobile, padded on desktop */}
            <div className="flex-1 flex items-center justify-center overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}>

              {/* Prev — smaller & semi-transparent on mobile */}
              <button
                className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", zIndex: 2, cursor: "pointer", fontSize: "20px" }}
                onClick={() => setLightbox((i) => (i! - 1 + photos.length) % photos.length)}
              >‹</button>

              <AnimatePresence mode="wait">
                <motion.img
                  key={currentPhoto.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  src={currentPhoto.previewUrl}
                  alt={currentPhoto.filename}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    maxHeight: "calc(100dvh - 110px)",
                    maxWidth: "100%",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                    borderRadius: "2px",
                  }}
                />
              </AnimatePresence>

              <button
                className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", zIndex: 2, cursor: "pointer", fontSize: "20px" }}
                onClick={() => setLightbox((i) => (i! + 1) % photos.length)}
              >›</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
