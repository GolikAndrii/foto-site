"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getPublicUrl } from "@/lib/r2";
import type { Gallery, Photo } from "@prisma/client";

type GalleryWithPhotos = Gallery & { photos: Photo[] };

export default function GalleryAdminPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [gallery, setGallery] = useState<GalleryWithPhotos | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/galleries/${id}`);
    if (res.ok) setGallery(await res.json());
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function resizeForServer(file: File, maxWidth = 1800): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.88);
      };
      img.src = url;
    });
  }

  async function uploadFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    if (!arr.length) return;
    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < arr.length; i++) {
      const file = arr[i];

      // 1. Get presigned URL for original + key pair
      const { presignedUrl, originalKey, previewKey } = await fetch(
        `/api/galleries/${id}/photos/presign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        }
      ).then((r) => r.json());

      // 2. Upload original directly to R2 (no Vercel size limit)
      await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "image/jpeg" },
      });

      // 3. Resize client-side for Sharp preview generation (stays under 4.5MB)
      const resized = await resizeForServer(file, 1800);

      // 4. Send resized blob to API → Sharp generates WebP preview
      const form = new FormData();
      form.append("source", resized, file.name);
      form.append("originalKey", originalKey);
      form.append("previewKey", previewKey);
      form.append("filename", file.name);
      form.append("sizeBytes", String(file.size));
      await fetch(`/api/galleries/${id}/photos`, { method: "POST", body: form });

      setUploadProgress(Math.round(((i + 1) / arr.length) * 100));
    }

    setUploading(false);
    setUploadProgress(0);
    load();
  }

  async function setCover(photoId: string) {
    await fetch(`/api/galleries/${id}/cover`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId }),
    });
    load();
  }

  async function deletePhoto(photoId: string) {
    await fetch(`/api/photos/${photoId}`, { method: "DELETE" });
    load();
  }

  async function saveName() {
    if (!newName.trim()) return;
    await fetch(`/api/galleries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    setEditingName(false);
    load();
  }

  async function deleteGallery() {
    if (!confirm(`Удалить галерею "${gallery?.name}"? Все фото будут удалены.`)) return;
    await fetch(`/api/galleries/${id}`, { method: "DELETE" });
    router.push("/admin");
  }

  function copyShareLink() {
    if (!gallery) return;
    const url = `${window.location.origin}/g/${gallery.shareToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!gallery) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
      </div>
    );
  }

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/g/${gallery.shareToken}`;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                className="text-2xl font-light border-b-2 outline-none bg-transparent px-1 text-white"
                style={{ borderColor: "#FF6B00", fontFamily: "var(--font-playfair)", minWidth: "220px" }}
              />
              <button
                onClick={saveName}
                className="text-sm px-3 py-1.5 rounded-lg font-medium"
                style={{ background: "linear-gradient(135deg, #FF6B00, #FF8C33)", color: "#fff" }}
              >
                ✓
              </button>
              <button
                onClick={() => setEditingName(false)}
                className="text-sm px-3 py-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1
                className="text-3xl font-light text-white"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {gallery.name}
              </h1>
              <button
                onClick={() => { setNewName(gallery.name); setEditingName(true); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/5 text-neutral-500 hover:text-neutral-300"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
          <p className="text-sm mt-1 text-neutral-500" style={{ fontFamily: "var(--font-inter)" }}>
            {gallery.photos.length} фото
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={copyShareLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: copied ? "rgba(255,107,0,0.15)" : "rgba(255,107,0,0.1)",
              color: copied ? "#FF8C33" : "#FF6B00",
              border: "1px solid",
              borderColor: copied ? "rgba(255,140,51,0.4)" : "rgba(255,107,0,0.25)",
              fontFamily: "var(--font-inter)",
            }}
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2 7l3.5 3.5L12 3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Скопировано!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 7a3 3 0 0 0 5.12 2.12l2-2a3 3 0 0 0-4.24-4.24L6.5 4.26" strokeLinecap="round"/>
                  <path d="M9 7a3 3 0 0 0-5.12-2.12l-2 2a3 3 0 0 0 4.24 4.24L7.5 9.74" strokeLinecap="round"/>
                </svg>
                Поделиться
              </>
            )}
          </button>

          <a
            href={`/g/${gallery.shareToken}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20 transition-all"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 2H2.5A.5.5 0 0 0 2 2.5v8a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V8" strokeLinecap="round"/>
              <path d="M7.5 2H11v3.5M11 2L6 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Предпросмотр
          </a>

          <button
            onClick={deleteGallery}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border border-white/[0.08] text-neutral-600 hover:text-red-400 hover:border-red-500/20 transition-all"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 3.5h9M4.5 3.5V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v1M5.5 6v3M7.5 6v3M3 3.5l.5 7a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5l.5-7" strokeLinecap="round"/>
            </svg>
            Удалить
          </button>
        </div>
      </div>

      {/* Share link bar */}
      <div className="mb-6 px-4 py-3 rounded-xl flex items-center gap-3 bg-white/[0.03] border border-white/[0.06]">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#FF6B00" strokeWidth="1.5" className="shrink-0">
          <path d="M5 7a3 3 0 0 0 5.12 2.12l2-2a3 3 0 0 0-4.24-4.24L6.5 4.26" strokeLinecap="round"/>
          <path d="M9 7a3 3 0 0 0-5.12-2.12l-2 2a3 3 0 0 0 4.24 4.24L7.5 9.74" strokeLinecap="round"/>
        </svg>
        <span className="text-xs text-neutral-500 shrink-0">Ссылка для клиента:</span>
        <span className="text-sm text-neutral-400 truncate flex-1 font-mono text-xs">{shareUrl}</span>
        <button
          onClick={copyShareLink}
          className="text-xs px-3 py-1.5 rounded-md shrink-0 transition-all font-medium"
          style={{
            background: "rgba(255,107,0,0.1)",
            color: "#FF6B00",
            border: "1px solid rgba(255,107,0,0.2)",
          }}
        >
          {copied ? "✓ Готово" : "Копировать"}
        </button>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); uploadFiles(e.dataTransfer.files); }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className="border-2 border-dashed rounded-2xl p-8 text-center transition-all mb-8 cursor-pointer"
        style={{
          borderColor: dragging ? "#FF6B00" : "rgba(255,255,255,0.08)",
          backgroundColor: dragging ? "rgba(255,107,0,0.05)" : "transparent",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        {uploading ? (
          <div className="max-w-xs mx-auto">
            <div className="w-full h-1.5 rounded-full mb-3 bg-white/10">
              <motion.div
                className="h-1.5 rounded-full"
                style={{ background: "linear-gradient(90deg, #FF6B00, #FF8C33)" }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-sm text-neutral-400" style={{ fontFamily: "var(--font-inter)" }}>
              Загружаем... <span className="text-orange-400 font-medium">{uploadProgress}%</span>
            </p>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#FF6B00" strokeWidth="1.5" strokeOpacity="0.6">
                <path d="M11 3v12M6 8l5-5 5 5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 18h16" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-sm text-neutral-400 mb-1" style={{ fontFamily: "var(--font-inter)" }}>
              Перетащи фото сюда или{" "}
              <span className="text-orange-400">выбери файлы</span>
            </p>
            <p className="text-xs text-neutral-600" style={{ fontFamily: "var(--font-inter)" }}>
              JPG, PNG, WEBP — любое количество
            </p>
          </div>
        )}
      </div>

      {/* Photos Grid */}
      {gallery.photos.length > 0 && (
        <div>
          <p className="text-xs text-neutral-600 mb-4" style={{ fontFamily: "var(--font-inter)" }}>
            Нажми на фото чтобы сделать обложкой · Наведи чтобы удалить
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            <AnimatePresence>
              {gallery.photos.map((photo) => {
                const isCover = gallery.coverPhotoId === photo.id;
                return (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="relative aspect-square group cursor-pointer rounded-xl overflow-hidden"
                    style={{
                      border: isCover ? "2px solid #FF6B00" : "2px solid transparent",
                      boxShadow: isCover ? "0 0 12px rgba(255,107,0,0.3)" : "none",
                    }}
                    onClick={() => setCover(photo.id)}
                  >
                    <img
                      src={getPublicUrl(photo.previewKey)}
                      alt={photo.filename}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Dark overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Cover badge */}
                    {isCover && (
                      <div
                        className="absolute top-1.5 left-1.5 text-[10px] px-2 py-0.5 rounded-md font-medium"
                        style={{ background: "#FF6B00", color: "#fff" }}
                      >
                        обложка
                      </div>
                    )}

                    {/* Delete button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); deletePhoto(photo.id); }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                      style={{ backgroundColor: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}
                    >
                      ✕
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
