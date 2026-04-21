"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Photo = { id: string; previewUrl: string; filename: string };

// Icons
function HeartIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="#ff5577">
      <path d="M8 14s-6-3.9-6-8a4 4 0 0 1 6-3.46A4 4 0 0 1 14 6c0 4.1-6 8-6 8z"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4">
      <path d="M8 14s-6-3.9-6-8a4 4 0 0 1 6-3.46A4 4 0 0 1 14 6c0 4.1-6 8-6 8z"/>
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.5 2v8M5 7.5l2.5 2.5 2.5-2.5"/>
      <path d="M2.5 12h10"/>
    </svg>
  );
}

export default function PublicGalleryClient({
  galleryName,
  photos,
}: {
  galleryName: string;
  photos: Photo[];
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [likes, setLikes] = useState<Record<string, { liked: boolean; count: number }>>({});
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchLikes = async () => {
      const results = await Promise.all(
        photos.map(async (p) => {
          const res = await fetch(`/api/photos/${p.id}/like`);
          return [p.id, await res.json()] as const;
        })
      );
      setLikes(Object.fromEntries(results));
    };
    if (photos.length) fetchLikes();
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
    const res = await fetch(`/api/photos/${photoId}/download`);
    const { url } = await res.json();
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
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
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="#FF6B00" strokeWidth="0.8" strokeOpacity="0.4"/>
              <circle cx="10" cy="10" r="3" stroke="#FF6B00" strokeWidth="1.4"/>
              {[0,60,120,180,240,300].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                return <line key={i}
                  x1={10 + 3.8 * Math.cos(rad)} y1={10 + 3.8 * Math.sin(rad)}
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

      {/* Hint bar */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", backgroundColor: "#0a0a0a" }}>
        <div className="max-w-screen-xl mx-auto px-6 py-2">
          <span style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-inter)", fontSize: "11px", letterSpacing: "0.06em" }}>
            ♥ Markiere deine Lieblingsfotos &nbsp;·&nbsp; ↓ Lade Originale herunter
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {photos.map((photo, idx) => {
            const liked = likes[photo.id]?.liked ?? false;
            const count = likes[photo.id]?.count ?? 0;

            return (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02, duration: 0.3 }}
                className="relative group"
                style={{ borderRadius: "6px", overflow: "hidden", backgroundColor: "#1a1a1a" }}
              >
                {/* Photo */}
                <div className="relative aspect-square cursor-pointer" onClick={() => setLightbox(idx)}>
                  <img
                    src={photo.previewUrl}
                    alt={photo.filename}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Bottom gradient */}
                  <div className="absolute inset-x-0 bottom-0 h-14 pointer-events-none"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)" }} />
                </div>

                {/* Action bar — always visible */}
                <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-2.5 pb-2" style={{ zIndex: 2 }}>
                  {/* Like */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(photo.id); }}
                    className="flex items-center gap-1 transition-transform active:scale-90"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "3px" }}
                  >
                    <HeartIcon filled={liked} />
                    {count > 0 && (
                      <span style={{ color: liked ? "#ff5577" : "rgba(255,255,255,0.7)", fontSize: "11px", fontFamily: "var(--font-inter)", fontWeight: 500 }}>
                        {count}
                      </span>
                    )}
                  </button>

                  {/* Download */}
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadPhoto(photo.id, photo.filename); }}
                    disabled={downloading === photo.id}
                    className="flex items-center justify-center transition-transform active:scale-90"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "3px" }}
                    title="Original herunterladen"
                  >
                    {downloading === photo.id ? (
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>…</span>
                    ) : (
                      <DownloadIcon />
                    )}
                  </button>
                </div>

                {/* Thin orange border on like */}
                {liked && (
                  <div className="absolute inset-0 pointer-events-none rounded"
                    style={{ boxShadow: "inset 0 0 0 1.5px rgba(255,85,119,0.45)" }} />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: "16px" }}>
        <div className="flex items-center justify-center gap-3">
          <div style={{ width: "28px", height: "1px", background: "rgba(255,107,0,0.3)" }} />
          <p style={{ color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-inter)", fontSize: "11px", letterSpacing: "0.07em" }}>
            Fotografie &amp; Galerie von{" "}
            <a href="https://golikandrii.com" target="_blank" rel="noopener noreferrer"
              style={{ color: "rgba(255,107,0,0.6)", textDecoration: "none" }}>
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
            style={{ backgroundColor: "rgba(8,6,2,0.97)" }}
            onClick={() => setLightbox(null)}
          >
            {/* Top bar */}
            <div
              className="flex items-center justify-between px-5 py-3 shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <span style={{ color: "rgba(240,232,216,0.35)", fontFamily: "var(--font-inter)", fontSize: "13px" }}>
                {lightbox + 1} / {photos.length}
              </span>
              <div className="flex items-center gap-2">
                {/* Like */}
                <button
                  onClick={() => toggleLike(currentPhoto.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all"
                  style={{
                    backgroundColor: likes[currentPhoto.id]?.liked ? "rgba(255,85,119,0.15)" : "rgba(255,255,255,0.07)",
                    border: likes[currentPhoto.id]?.liked ? "1px solid rgba(255,85,119,0.35)" : "1px solid rgba(255,255,255,0.1)",
                    color: likes[currentPhoto.id]?.liked ? "#ff5577" : "rgba(255,255,255,0.6)",
                    fontFamily: "var(--font-inter)",
                    cursor: "pointer",
                  }}
                >
                  <HeartIcon filled={likes[currentPhoto.id]?.liked ?? false} />
                  {likes[currentPhoto.id]?.count > 0 && (
                    <span style={{ fontSize: "13px" }}>{likes[currentPhoto.id].count}</span>
                  )}
                </button>

                {/* Download */}
                <button
                  onClick={() => downloadPhoto(currentPhoto.id, currentPhoto.filename)}
                  disabled={downloading === currentPhoto.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                  style={{
                    backgroundColor: "rgba(255,107,0,0.12)",
                    border: "1px solid rgba(255,107,0,0.25)",
                    color: "#FF8C33",
                    fontFamily: "var(--font-inter)",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  <DownloadIcon />
                  {downloading === currentPhoto.id ? "…" : "Original"}
                </button>

                {/* Close */}
                <button
                  onClick={() => setLightbox(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M1 1l10 10M11 1L1 11"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center px-12 overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}>
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", zIndex: 2, cursor: "pointer", fontSize: "20px" }}
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
                  className="max-h-full max-w-full object-contain"
                  style={{ maxHeight: "calc(100vh - 110px)", borderRadius: "3px" }}
                />
              </AnimatePresence>

              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", zIndex: 2, cursor: "pointer", fontSize: "20px" }}
                onClick={() => setLightbox((i) => (i! + 1) % photos.length)}
              >›</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
