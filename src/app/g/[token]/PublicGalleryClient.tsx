"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Photo = {
  id: string;
  previewUrl: string;       // 1400px — desktop / lightbox
  previewMdUrl: string | null; // 900px — tablet
  previewSmUrl: string | null; // 600px — mobile
  filename: string;
};

function HeartIcon({ filled, size = 17 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 17 17"
      fill={filled ? "#C084FC" : "none"}
      stroke={filled ? "#C084FC" : "rgba(255,255,255,0.6)"}
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5S2 10.3 2 5.8a3.8 3.8 0 0 1 6.5-2.7A3.8 3.8 0 0 1 15 5.8c0 4.5-6.5 8.7-6.5 8.7z"/>
    </svg>
  );
}

function DownloadIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none"
      stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v9M5 8l3 3 3-3"/>
      <path d="M2.5 13.5h11"/>
    </svg>
  );
}

export default function PublicGalleryClient({ galleryId, galleryName, photos }: { galleryId: string; galleryName: string; photos: Photo[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [cols, setCols] = useState(2);
  const [likes, setLikes] = useState<Record<string, { liked: boolean; count: number }>>({});
  const [downloading, setDownloading] = useState<string | null>(null);

  // Ping gallery view once on mount
  useEffect(() => {
    fetch(`/api/galleries/${galleryId}/view`, { method: "POST" }).catch(() => {});
  }, [galleryId]);

  useEffect(() => {
    const update = () => setCols(window.innerWidth >= 768 ? 4 : 2);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>

      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        backgroundColor: "var(--surface)",
        backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ApertureIcon />
            <h1 style={{
              fontFamily: "var(--font-playfair)", color: "var(--text)",
              fontSize: 15, fontWeight: 300, letterSpacing: "0.1em",
            }}>
              {galleryName}
            </h1>
          </div>
          <span style={{
            fontFamily: "var(--font-inter)", fontSize: 12, letterSpacing: "0.06em",
            color: "var(--accent-lt)",
            padding: "3px 10px", borderRadius: 20,
            background: "rgba(124,58,237,0.12)",
            border: "1px solid rgba(124,58,237,0.2)",
          }}>
            {photos.length} {photos.length === 1 ? "Foto" : "Fotos"}
          </span>
        </div>
      </header>

      {/* Hint bar */}
      <div style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--bg)" }}>
        <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center gap-2">
          <HeartIcon filled={false} size={12} />
          <span style={{ color: "var(--text-3)", fontFamily: "var(--font-inter)", fontSize: 11, letterSpacing: "0.04em" }}>
            Markiere deine Lieblingsfotos
          </span>
          <span style={{ color: "var(--border-2)", fontSize: 10 }}>·</span>
          <DownloadIcon size={11} />
          <span style={{ color: "var(--text-3)", fontFamily: "var(--font-inter)", fontSize: 11, letterSpacing: "0.04em" }}>
            Lade Originale herunter
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-screen-xl mx-auto px-3 py-4">
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 6 }}>
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
                style={{ borderRadius: 6, overflow: "hidden", backgroundColor: "var(--surface)" }}
              >
                <div className="relative cursor-pointer" onClick={() => {
                  setLightbox(idx);
                  fetch(`/api/photos/${photo.id}/view`, { method: "POST" }).catch(() => {});
                }}>
                  <img
                    src={photo.previewUrl}
                    srcSet={[
                      photo.previewSmUrl && `${photo.previewSmUrl} 600w`,
                      photo.previewMdUrl && `${photo.previewMdUrl} 900w`,
                      `${photo.previewUrl} 1400w`,
                    ].filter(Boolean).join(", ")}
                    sizes="(max-width: 767px) 50vw, 25vw"
                    alt={photo.filename}
                    className="w-full h-auto block"
                    style={{ display: "block", transition: "transform 0.5s" }}
                    loading="lazy"
                  />
                  <div style={{
                    position: "absolute", inset: "0 0 0 0", bottom: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
                  }} />
                </div>

                {/* Actions */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "6px 10px 8px", zIndex: 2,
                }}>
                  <button
                    onClick={e => { e.stopPropagation(); toggleLike(photo.id); }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", gap: 4, transition: "transform 0.1s" }}
                    onMouseDown={e => (e.currentTarget.style.transform = "scale(0.88)")}
                    onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <HeartIcon filled={liked} />
                    {count > 0 && (
                      <span style={{ color: liked ? "#C084FC" : "rgba(255,255,255,0.65)", fontSize: 11, fontFamily: "var(--font-inter)", fontWeight: 500 }}>
                        {count}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); downloadPhoto(photo.id, photo.filename); }}
                    disabled={downloading === photo.id}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4, transition: "transform 0.1s" }}
                    title="Original herunterladen"
                    onMouseDown={e => (e.currentTarget.style.transform = "scale(0.88)")}
                    onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {downloading === photo.id
                      ? <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>…</span>
                      : <DownloadIcon />}
                  </button>
                </div>

                {liked && (
                  <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    boxShadow: "inset 0 0 0 1.5px rgba(192,132,252,0.45)", borderRadius: 6,
                  }} />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", marginTop: 8, padding: "28px 16px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div style={{ width: 32, height: 1, background: "rgba(124,58,237,0.25)" }} />
          <p style={{ color: "var(--text-3)", fontFamily: "var(--font-inter)", fontSize: 11, letterSpacing: "0.06em" }}>
            Fotografie &amp; Galerie von{" "}
            <a href="https://golikandrii.com" target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--accent-lt)", textDecoration: "none", opacity: 0.7 }}>
              Andrii Golik
            </a>
          </p>
          <div style={{ width: 32, height: 1, background: "rgba(124,58,237,0.25)" }} />
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
            style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", flexDirection: "column", backgroundColor: "rgba(5,4,12,0.97)" }}
            onClick={() => setLightbox(null)}
          >
            {/* Top bar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0,
            }} onClick={e => e.stopPropagation()}>
              <span style={{ color: "var(--text-3)", fontFamily: "var(--font-inter)", fontSize: 13 }}>
                {lightbox + 1} / {photos.length}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => toggleLike(currentPhoto.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, cursor: "pointer",
                    background: likes[currentPhoto.id]?.liked ? "rgba(192,132,252,0.15)" : "rgba(255,255,255,0.06)",
                    border: likes[currentPhoto.id]?.liked ? "1px solid rgba(192,132,252,0.35)" : "1px solid var(--border)",
                    transition: "all 0.15s",
                  }}
                >
                  <HeartIcon filled={likes[currentPhoto.id]?.liked ?? false} size={15} />
                  {(likes[currentPhoto.id]?.count ?? 0) > 0 && (
                    <span style={{ fontSize: 13, color: likes[currentPhoto.id]?.liked ? "#C084FC" : "var(--text-2)", fontFamily: "var(--font-inter)" }}>
                      {likes[currentPhoto.id].count}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => downloadPhoto(currentPhoto.id, currentPhoto.filename)}
                  disabled={downloading === currentPhoto.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                    background: "rgba(124,58,237,0.15)",
                    border: "1px solid rgba(124,58,237,0.3)",
                    color: "var(--accent-lt)", fontFamily: "var(--font-inter)", fontSize: 13,
                    transition: "all 0.15s",
                  }}
                >
                  <DownloadIcon size={13} />
                  <span className="hidden sm:inline">{downloading === currentPhoto.id ? "…" : "Herunterladen"}</span>
                </button>

                <button
                  onClick={() => setLightbox(null)}
                  style={{
                    width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: "50%", cursor: "pointer",
                    background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)",
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M1 1l9 9M10 1L1 10"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Image */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}
              onClick={e => e.stopPropagation()}>
              <button
                style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "1px solid var(--border)", color: "rgba(255,255,255,0.7)", zIndex: 2, cursor: "pointer", fontSize: 22 }}
                onClick={() => setLightbox(i => {
                  const next = (i! - 1 + photos.length) % photos.length;
                  fetch(`/api/photos/${photos[next].id}/view`, { method: "POST" }).catch(() => {});
                  return next;
                })}
              >‹</button>

              <AnimatePresence mode="wait">
                <motion.img
                  key={currentPhoto.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.16 }}
                  src={currentPhoto.previewUrl}
                  alt={currentPhoto.filename}
                  onClick={e => e.stopPropagation()}
                  style={{ maxHeight: "calc(100dvh - 110px)", maxWidth: "100%", width: "auto", height: "auto", objectFit: "contain", borderRadius: 3 }}
                />
              </AnimatePresence>

              <button
                style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "1px solid var(--border)", color: "rgba(255,255,255,0.7)", zIndex: 2, cursor: "pointer", fontSize: 22 }}
                onClick={() => setLightbox(i => {
                  const next = (i! + 1) % photos.length;
                  fetch(`/api/photos/${photos[next].id}/view`, { method: "POST" }).catch(() => {});
                  return next;
                })}
              >›</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ApertureIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="#7C3AED" strokeWidth="0.8" strokeOpacity="0.4"/>
      <circle cx="10" cy="10" r="3" stroke="#A78BFA" strokeWidth="1.3"/>
      {[0,60,120,180,240,300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return <line key={i}
          x1={10 + 3.8 * Math.cos(rad)} y1={10 + 3.8 * Math.sin(rad)}
          x2={10 + 8.5 * Math.cos(rad + 0.42)} y2={10 + 8.5 * Math.sin(rad + 0.42)}
          stroke="#7C3AED" strokeWidth="0.9" strokeOpacity="0.65"/>;
      })}
    </svg>
  );
}
