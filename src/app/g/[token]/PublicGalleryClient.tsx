"use client";

import { useState, useEffect } from "react";
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

  function handleKeyDown(e: KeyboardEvent) {
    if (lightbox === null) return;
    if (e.key === "ArrowRight") setLightbox((i) => (i! + 1) % photos.length);
    if (e.key === "ArrowLeft") setLightbox((i) => (i! - 1 + photos.length) % photos.length);
    if (e.key === "Escape") setLightbox(null);
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const currentPhoto = lightbox !== null ? photos[lightbox] : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF7F2" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b backdrop-blur-sm" style={{ backgroundColor: "rgba(250,247,242,0.9)", borderColor: "#E8DCC8" }}>
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-light tracking-wide truncate" style={{ fontFamily: "var(--font-playfair)", color: "#2C1F0E" }}>
            {galleryName}
          </h1>
          <span className="text-xs shrink-0" style={{ color: "#9A7340" }}>{photos.length} Fotos</span>
        </div>
      </header>

      {/* Grid */}
      <div className="max-w-screen-xl mx-auto px-2 py-4">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-1">
          {photos.map((photo, idx) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.02, duration: 0.3 }}
              className="relative aspect-square group overflow-hidden cursor-pointer"
              style={{ borderRadius: "4px" }}
              onClick={() => setLightbox(idx)}
            >
              <img
                src={photo.previewUrl}
                alt={photo.filename}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {/* Like overlay on hover */}
              <div className="absolute inset-0 flex items-end justify-start p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleLike(photo.id); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm text-xs"
                  style={{ backgroundColor: "rgba(0,0,0,0.35)", color: "#fff" }}
                >
                  <span style={{ color: likes[photo.id]?.liked ? "#ff6b8a" : "#fff" }}>♥</span>
                  {likes[photo.id]?.count > 0 && <span>{likes[photo.id].count}</span>}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && currentPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ backgroundColor: "rgba(20,12,4,0.95)" }}
            onClick={() => setLightbox(null)}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={(e) => e.stopPropagation()}>
              <span className="text-sm opacity-50" style={{ color: "#EDE3D4", fontFamily: "var(--font-inter)" }}>
                {lightbox + 1} / {photos.length}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleLike(currentPhoto.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all"
                  style={{
                    backgroundColor: likes[currentPhoto.id]?.liked ? "rgba(255,107,138,0.2)" : "rgba(255,255,255,0.1)",
                    color: likes[currentPhoto.id]?.liked ? "#ff6b8a" : "#EDE3D4",
                  }}
                >
                  ♥ {likes[currentPhoto.id]?.count > 0 ? likes[currentPhoto.id].count : ""}
                </button>
                <button
                  onClick={() => downloadPhoto(currentPhoto.id, currentPhoto.filename)}
                  disabled={downloading === currentPhoto.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#EDE3D4" }}
                  title="Original herunterladen"
                >
                  {downloading === currentPhoto.id ? "..." : "↓ Original"}
                </button>
                <button onClick={() => setLightbox(null)} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#EDE3D4" }}>
                  ✕
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center px-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full text-lg"
                style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#EDE3D4" }}
                onClick={() => setLightbox((i) => (i! - 1 + photos.length) % photos.length)}
              >
                ‹
              </button>
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentPhoto.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  src={currentPhoto.previewUrl}
                  alt={currentPhoto.filename}
                  className="max-h-full max-w-full object-contain"
                  style={{ maxHeight: "calc(100vh - 120px)" }}
                />
              </AnimatePresence>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full text-lg"
                style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#EDE3D4" }}
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
