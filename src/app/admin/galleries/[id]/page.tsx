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

  async function uploadFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    if (!arr.length) return;
    setUploading(true);
    setUploadProgress(0);

    const BATCH = 5;
    for (let i = 0; i < arr.length; i += BATCH) {
      const batch = arr.slice(i, i + BATCH);
      const form = new FormData();
      batch.forEach((f) => form.append("files", f));
      await fetch(`/api/galleries/${id}/photos`, { method: "POST", body: form });
      setUploadProgress(Math.round(((i + batch.length) / arr.length) * 100));
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
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#C9A97A", borderTopColor: "transparent" }} />
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
                className="text-2xl font-light border-b-2 outline-none bg-transparent px-1"
                style={{ borderColor: "#C9A97A", color: "#2C1F0E", fontFamily: "var(--font-playfair)", minWidth: "200px" }}
              />
              <button onClick={saveName} className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: "#C9A97A", color: "#FAF7F2" }}>✓</button>
              <button onClick={() => setEditingName(false)} className="text-sm px-3 py-1 rounded-full border" style={{ borderColor: "#D9C9AB", color: "#7A5A32" }}>✕</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-light" style={{ fontFamily: "var(--font-playfair)", color: "#2C1F0E" }}>{gallery.name}</h1>
              <button onClick={() => { setNewName(gallery.name); setEditingName(true); }} className="opacity-40 hover:opacity-100 transition-opacity text-lg" style={{ color: "#7A5A32" }}>✎</button>
            </div>
          )}
          <p className="text-sm mt-1" style={{ color: "#9A7340" }}>{gallery.photos.length} фото</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={copyShareLink}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
            style={{ backgroundColor: copied ? "#7A5A32" : "#2C1F0E", color: "#FAF7F2", fontFamily: "var(--font-inter)" }}
          >
            {copied ? "✓ Скопировано!" : "🔗 Поделиться"}
          </button>
          <a
            href={`/g/${gallery.shareToken}`}
            target="_blank"
            className="px-4 py-2.5 rounded-full text-sm border transition-all"
            style={{ borderColor: "#D9C9AB", color: "#7A5A32", fontFamily: "var(--font-inter)" }}
          >
            Предпросмотр ↗
          </a>
          <button
            onClick={deleteGallery}
            className="px-4 py-2.5 rounded-full text-sm border transition-all hover:border-red-300 hover:text-red-400"
            style={{ borderColor: "#D9C9AB", color: "#9A7340", fontFamily: "var(--font-inter)" }}
          >
            Удалить
          </button>
        </div>
      </div>

      {/* Share link display */}
      <div className="mb-6 px-4 py-3 rounded-xl flex items-center gap-3" style={{ backgroundColor: "#EDE3D4" }}>
        <span className="text-xs" style={{ color: "#9A7340" }}>Ссылка для клиента:</span>
        <span className="text-sm truncate flex-1" style={{ color: "#5C4124", fontFamily: "var(--font-inter)" }}>{shareUrl}</span>
        <button onClick={copyShareLink} className="text-xs px-3 py-1 rounded-full shrink-0" style={{ backgroundColor: "#C9A97A", color: "#FAF7F2" }}>
          {copied ? "✓" : "Копировать"}
        </button>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); uploadFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all mb-8"
        style={{
          borderColor: dragging ? "#C9A97A" : "#D9C9AB",
          backgroundColor: dragging ? "#F2EBE0" : "transparent",
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
          <div>
            <div className="w-full h-2 rounded-full mb-3" style={{ backgroundColor: "#E8DCC8" }}>
              <div className="h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%`, backgroundColor: "#C9A97A" }} />
            </div>
            <p className="text-sm" style={{ color: "#9A7340" }}>Загружаем... {uploadProgress}%</p>
          </div>
        ) : (
          <div>
            <div className="text-3xl mb-2 opacity-30">↑</div>
            <p className="text-sm" style={{ color: "#9A7340", fontFamily: "var(--font-inter)" }}>
              Перетащи фото сюда или <span style={{ color: "#C9A97A" }}>выбери файлы</span>
            </p>
            <p className="text-xs mt-1 opacity-50" style={{ color: "#9A7340" }}>JPG, PNG, WEBP — любое количество</p>
          </div>
        )}
      </div>

      {/* Photos Grid */}
      {gallery.photos.length > 0 && (
        <div>
          <p className="text-sm mb-4" style={{ color: "#9A7340" }}>
            Нажми на фото чтобы сделать обложкой · Наведи чтобы удалить
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            <AnimatePresence>
              {gallery.photos.map((photo) => {
                const isCover = gallery.coverPhotoId === photo.id;
                return (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative aspect-square group cursor-pointer rounded-lg overflow-hidden"
                    style={{ border: isCover ? "2px solid #C9A97A" : "2px solid transparent" }}
                    onClick={() => setCover(photo.id)}
                  >
                    <img
                      src={getPublicUrl(photo.previewKey)}
                      alt={photo.filename}
                      className="w-full h-full object-cover"
                    />
                    {isCover && (
                      <div className="absolute top-1 left-1 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "#C9A97A", color: "#FAF7F2" }}>
                        обложка
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deletePhoto(photo.id); }}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex"
                      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
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
