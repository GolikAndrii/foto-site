"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Photo = { id: string; previewUrl: string; filename: string };

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
    // Optimistic update — мгновенно, без ожидания сервера
    setLikes((prev) => {
      const cur = prev[photoId] ?? { liked: false, count: 0 };
      return {
        ...prev,
        [photoId]: { liked: !cur.liked, count: cur.liked ? cur.count - 1 : cur.count + 1 },
      };
    });
    // Синхронизируем с сервером в фоне
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
    <div className="min-h-screen" style={{ backgroundColor: "#F5F2ED" }}>

      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2010 100%)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
      }}>
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Aperture icon */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke="#FF6B00" strokeWidth="0.8" strokeOpacity="0.5"/>
              <circle cx="11" cy="11" r="3.5" stroke="#FF6B00" strokeWidth="1.5"/>
              {[0,60,120,180,240,300].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                return <line key={i}
                  x1={11 + 4 * Math.cos(rad)} y1={11 + 4 * Math.sin(rad)}
                  x2={11 + 9.5 * Math.cos(rad + 0.45)} y2={11 + 9.5 * Math.sin(rad + 0.45)}
                  stroke="#FF6B00" strokeWidth="1" strokeOpacity="0.7"/>;
              })}
            </svg>
            <h1 className="text-base font-light tracking-widest uppercase"
              style={{ fontFamily: "var(--font-playfair)", color: "#F0E8D8", letterSpacing: "0.15em" }}>
              {galleryName}
            </h1>
          </div>
          <span className="text-xs font-light"
            style={{ color: "#FF6B00", fontFamily: "var(--font-inter)", letterSpacing: "0.1em" }}>
            {photos.length} {photos.length === 1 ? "Foto" : "Fotos"}
          </span>
        </div>
      </header>

      {/* Subtitle bar */}
      <div style={{ background: "#EEEAE3", borderBottom: "1px solid #DDD8CE" }}>
        <div className="max-w-screen-xl mx-auto px-6 py-2 flex items-center gap-2">
          <span style={{ color: "#9A7340", fontFamily: "var(--font-inter)", fontSize: "11px", letterSpacing: "0.08em" }}>
            ♥ Markiere deine Lieblingsfotos · ↓ Lade Originale herunter
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {photos.map((photo, idx) => {
            const liked = likes[photo.id]?.liked ?? false;
            const count = likes[photo.id]?.count ?? 0;

            return (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.025, duration: 0.35 }}
                className="relative group"
                style={{ borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }}
              >
                {/* Photo */}
                <div
                  className="relative aspect-square cursor-pointer"
                  onClick={() => setLightbox(idx)}
                >
                  <img
                    src={photo.previewUrl}
                    alt={photo.filename}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Gradient overlay — always visible at bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)" }}
                  />
                </div>

                {/* Action buttons — always visible */}
                <div
                  className="absolute bottom-0 inset-x-0 flex items-center justify-between px-2 pb-2"
                  style={{ zIndex: 2 }}
                >
                  {/* Like */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(photo.id); }}
                    className="flex items-center gap-1 transition-transform active:scale-90"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                  >
                    <span style={{
                      fontSize: "18px",
                      lineHeight: 1,
                      filter: liked ? "drop-shadow(0 0 4px rgba(255,100,130,0.7))" : "none",
                      transition: "all 0.2s",
                    }}>
                      {liked ? "❤️" : "🤍"}
                    </span>
                    {count > 0 && (
                      <span style={{
                        color: "#fff",
                        fontSize: "11px",
                        fontFamily: "var(--font-inter)",
                        fontWeight: 500,
                        textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                      }}>
                        {count}
                      </span>
                    )}
                  </button>

                  {/* Download */}
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadPhoto(photo.id, photo.filename); }}
                    disabled={downloading === photo.id}
                    className="flex items-center justify-center transition-transform active:scale-90"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                    title="Original herunterladen"
                  >
                    {downloading === photo.id ? (
                      <span style={{ color: "#fff", fontSize: "12px" }}>…</span>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="9" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8"/>
                        <path d="M10 6v6M7.5 9.5L10 12l2.5-2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 14h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center" style={{ marginTop: "24px", borderTop: "1px solid #DDD8CE" }}>
        <div className="flex items-center justify-center gap-2 mb-1">
          <div style={{ width: "24px", height: "1px", background: "#C4A97A" }} />
          <p className="text-xs" style={{ color: "#9A7340", fontFamily: "var(--font-inter)", letterSpacing: "0.08em" }}>
            Fotografie &amp; Galerie von{" "}
            <a href="https://golikandrii.com" target="_blank" rel="noopener noreferrer"
              style={{ color: "#7A5C2A", textDecoration: "none", fontWeight: 500 }}>
              Andrii Golik
            </a>
          </p>
          <div style={{ width: "24px", height: "1px", background: "#C4A97A" }} />
        </div>
      </footer>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && currentPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ backgroundColor: "rgba(12,8,2,0.97)" }}
            onClick={() => setLightbox(null)}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0"
              onClick={(e) => e.stopPropagation()}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-sm" style={{ color: "rgba(240,232,216,0.45)", fontFamily: "var(--font-inter)" }}>
                {lightbox + 1} / {photos.length}
              </span>
              <div className="flex items-center gap-2">
                {/* Like in lightbox */}
                <button
                  onClick={() => toggleLike(currentPhoto.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all"
                  style={{
                    backgroundColor: likes[currentPhoto.id]?.liked ? "rgba(255,80,110,0.15)" : "rgba(255,255,255,0.08)",
                    color: likes[currentPhoto.id]?.liked ? "#ff6b8a" : "#c8bfb0",
                    border: likes[currentPhoto.id]?.liked ? "1px solid rgba(255,80,110,0.3)" : "1px solid rgba(255,255,255,0.1)",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {likes[currentPhoto.id]?.liked ? "❤️" : "♡"}{" "}
                  {likes[currentPhoto.id]?.count > 0 ? likes[currentPhoto.id].count : ""}
                </button>

                {/* Download in lightbox */}
                <button
                  onClick={() => downloadPhoto(currentPhoto.id, currentPhoto.filename)}
                  disabled={downloading === currentPhoto.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                  style={{
                    backgroundColor: "rgba(255,107,0,0.15)",
                    color: "#FF9033",
                    border: "1px solid rgba(255,107,0,0.25)",
                    fontFamily: "var(--font-inter)",
                    cursor: "pointer",
                  }}
                  title="Original herunterladen"
                >
                  {downloading === currentPhoto.id ? "…" : "↓ Original"}
                </button>

                {/* Close */}
                <button
                  onClick={() => setLightbox(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#c8bfb0", border: "1px solid rgba(255,255,255,0.1)" }}>
                  ✕
                </button>
              </div>
            </div>

            {/* Image area */}
            <div className="flex-1 flex items-center justify-center px-12 overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}>
              {/* Prev */}
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full text-xl"
                style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "#c8bfb0", border: "1px solid rgba(255,255,255,0.1)", zIndex: 2 }}
                onClick={() => setLightbox((i) => (i! - 1 + photos.length) % photos.length)}
              >
                ‹
              </button>

              <AnimatePresence mode="wait">
                <motion.img
                  key={currentPhoto.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  src={currentPhoto.previewUrl}
                  alt={currentPhoto.filename}
                  className="max-h-full max-w-full object-contain"
                  style={{ maxHeight: "calc(100vh - 110px)", borderRadius: "4px" }}
                />
              </AnimatePresence>

              {/* Next */}
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full text-xl"
                style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "#c8bfb0", border: "1px solid rgba(255,255,255,0.1)", zIndex: 2 }}
                onClick={() => setLightbox((i) => (i! + 1) % photos.length)}
              >
                ›
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
