"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getPublicUrl } from "@/lib/r2";
import type { Gallery, Photo } from "@prisma/client";

type GalleryWithPhotos = Gallery & { photos: Photo[]; pin?: string | null };

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
  const [pinEdit, setPinEdit] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [savingPin, setSavingPin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/galleries/${id}`);
    if (res.ok) {
      const data = await res.json();
      setGallery(data);
      setPinValue(data.pin ?? "");
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function resizeForPreview(file: File, maxPx = 2000): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.9);
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

      // 1. Get presigned URL + keys for this file
      const { presignedUrl, originalKey, previewKey } = await fetch(
        `/api/galleries/${id}/photos/presign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type || "image/jpeg" }),
        }
      ).then(r => r.json());

      // 2. Resize original to 3000px max, then upload directly to R2
      const original = await resizeForPreview(file, 3000);
      await fetch(presignedUrl, {
        method: "PUT",
        body: original,
        headers: { "Content-Type": "image/jpeg" },
      });

      // 3. Resize for preview on client (keeps server request under Vercel 4.5MB limit)
      const resized = await resizeForPreview(file, 2000);

      // 4. Send resized to API — server generates WebP preview and saves record
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

  async function savePin() {
    if (pinValue.length > 0 && pinValue.length < 3) return;
    setSavingPin(true);
    await fetch(`/api/galleries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: pinValue.length === 3 ? pinValue : null }),
    });
    setSavingPin(false);
    setPinEdit(false);
    load();
  }

  async function deleteGallery() {
    if (!confirm(`Удалить галерею "${gallery?.name}"? Все фото будут удалены.`)) return;
    await fetch(`/api/galleries/${id}`, { method: "DELETE" });
    router.push("/admin");
  }

  function copyShareLink() {
    if (!gallery) return;
    navigator.clipboard.writeText(`${window.location.origin}/g/${gallery.shareToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePinDigit(idx: number, char: string) {
    const clean = char.replace(/\D/g, "").slice(-1);
    const arr = (pinValue.padEnd(3, " ")).split("").slice(0, 3);
    arr[idx] = clean;
    const v = arr.join("").trimEnd();
    setPinValue(v);
    if (clean && idx < 2) {
      (document.getElementById(`gpid-${idx + 1}`) as HTMLInputElement)?.focus();
    }
  }

  if (!gallery) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 0" }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid rgba(124,58,237,0.3)", borderTopColor: "var(--accent)", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/g/${gallery.shareToken}`;
  const currentPin = gallery.pin ?? "";
  const pinDigits = [currentPin[0] ?? "", currentPin[1] ?? "", currentPin[2] ?? ""];
  const editDigits = [pinValue[0] ?? "", pinValue[1] ?? "", pinValue[2] ?? ""];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
        <div>
          {editingName ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                autoFocus value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveName()}
                style={{
                  fontSize: 22, fontWeight: 300, fontFamily: "var(--font-playfair)",
                  background: "transparent", border: "none", borderBottom: "2px solid var(--accent)",
                  outline: "none", color: "var(--text)", padding: "2px 4px", minWidth: 200,
                }}
              />
              <ActionBtn onClick={saveName} label="✓" primary />
              <ActionBtn onClick={() => setEditingName(false)} label="✕" />
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="name-group">
              <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: 26, fontWeight: 300, color: "var(--text)", margin: 0 }}>
                {gallery.name}
              </h1>
              <button
                onClick={() => { setNewName(gallery.name); setEditingName(true); }}
                className="edit-btn"
                style={{ padding: 6, borderRadius: 7, background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", opacity: 0, transition: "opacity 0.15s" }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 2.5l1.5 1.5-6.5 6.5H2.5V9L9 2.5z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
            <span style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "var(--font-inter)" }}>
              {gallery.photos.length} фото
            </span>
            {(gallery as any).viewCount > 0 && (
              <ViewStats gallery={gallery as any} />
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button onClick={copyShareLink} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, fontSize: 13,
            background: copied ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.1)",
            color: "var(--accent-lt)",
            border: `1px solid ${copied ? "rgba(124,58,237,0.45)" : "rgba(124,58,237,0.25)"}`,
            cursor: "pointer", fontFamily: "var(--font-inter)", transition: "all 0.15s",
          }}>
            {copied ? <CheckIcon /> : <LinkIcon />}
            {copied ? "Скопировано!" : "Поделиться"}
          </button>

          <a href={`/g/${gallery.shareToken}`} target="_blank" style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, fontSize: 13,
            border: "1px solid var(--border)", color: "var(--text-2)", textDecoration: "none",
            fontFamily: "var(--font-inter)", transition: "all 0.15s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-2)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-2)"; }}
          >
            <ExternalIcon /> Предпросмотр
          </a>

          <button onClick={deleteGallery} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, fontSize: 13,
            border: "1px solid var(--border)", background: "none", color: "var(--text-3)", cursor: "pointer",
            fontFamily: "var(--font-inter)", transition: "all 0.15s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--red)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(244,63,94,0.25)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; }}
          >
            <TrashIcon /> Удалить
          </button>
        </div>
      </div>

      {/* Share link bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", marginBottom: 14,
        borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)",
      }}>
        <LinkIcon color="var(--accent-lt)" />
        <span style={{ fontSize: 11, color: "var(--text-3)", flexShrink: 0, fontFamily: "var(--font-inter)" }}>Ссылка:</span>
        <span style={{ fontSize: 12, color: "var(--text-2)", fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shareUrl}</span>
        <button onClick={copyShareLink} style={{
          padding: "4px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
          background: "rgba(124,58,237,0.12)", color: "var(--accent-lt)",
          border: "1px solid rgba(124,58,237,0.22)", fontFamily: "var(--font-inter)",
        }}>
          {copied ? "✓" : "Копировать"}
        </button>
      </div>

      {/* PIN protection row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16, padding: "14px 16px", marginBottom: 24,
        borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LockIcon />
          <span style={{ fontSize: 13, color: "var(--text-2)", fontFamily: "var(--font-inter)", fontWeight: 500 }}>PIN-защита</span>
          {currentPin.length === 3 && !pinEdit && (
            <span style={{ display: "flex", gap: 4, marginLeft: 4 }}>
              {pinDigits.map((d, i) => (
                <span key={i} style={{
                  width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 6, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)",
                  fontSize: 14, fontWeight: 700, color: "var(--accent-lt)", fontFamily: "var(--font-inter)",
                }}>{d}</span>
              ))}
            </span>
          )}
          {!currentPin && !pinEdit && (
            <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-inter)" }}>не установлен</span>
          )}
        </div>

        {pinEdit ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {editDigits.map((d, i) => (
              <input key={i} id={`gpid-${i}`}
                type="text" inputMode="numeric" value={d} maxLength={1}
                onChange={e => handlePinDigit(i, e.target.value)}
                onKeyDown={e => { if (e.key === "Backspace" && !editDigits[i] && i > 0) (document.getElementById(`gpid-${i - 1}`) as HTMLInputElement)?.focus(); }}
                style={{
                  width: 42, height: 42, textAlign: "center", fontSize: 18, fontWeight: 700,
                  borderRadius: 9, border: d ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                  background: d ? "rgba(124,58,237,0.12)" : "var(--bg)", color: "var(--text)",
                  outline: "none", fontFamily: "var(--font-inter)", caretColor: "transparent", transition: "all 0.12s",
                }}
                onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                onBlur={e => (e.target.style.borderColor = d ? "var(--accent)" : "var(--border)")}
              />
            ))}
            <ActionBtn onClick={savePin} label={savingPin ? "…" : "Сохранить"} primary />
            <ActionBtn onClick={() => { setPinEdit(false); setPinValue(currentPin); }} label="Отмена" />
            {currentPin && (
              <button onClick={() => {
                setPinValue(""); setSavingPin(true);
                fetch(`/api/galleries/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pin: null }) })
                  .then(() => { setSavingPin(false); setPinEdit(false); load(); });
              }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--red)", fontFamily: "var(--font-inter)" }}>
                Удалить PIN
              </button>
            )}
          </div>
        ) : (
          <ActionBtn onClick={() => setPinEdit(true)} label={currentPin ? "Изменить" : "Установить"} />
        )}
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); uploadFiles(e.dataTransfer.files); }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 16, padding: "32px 24px", textAlign: "center",
          marginBottom: 28, cursor: "pointer",
          background: dragging ? "rgba(124,58,237,0.06)" : "transparent",
          transition: "all 0.15s",
        }}
      >
        <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: "none" }}
          onChange={e => e.target.files && uploadFiles(e.target.files)} />
        {uploading ? (
          <div style={{ maxWidth: 260, margin: "0 auto" }}>
            <div style={{ height: 4, borderRadius: 4, background: "var(--border)", marginBottom: 12 }}>
              <motion.div style={{ height: 4, borderRadius: 4, background: "linear-gradient(90deg, #7C3AED, #6366F1)" }}
                animate={{ width: `${uploadProgress}%` }} transition={{ duration: 0.3 }} />
            </div>
            <p style={{ fontSize: 13, color: "var(--text-2)", fontFamily: "var(--font-inter)" }}>
              Загружаем... <span style={{ color: "var(--accent-lt)", fontWeight: 600 }}>{uploadProgress}%</span>
            </p>
          </div>
        ) : (
          <>
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px",
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--accent-lt)" strokeWidth="1.5" strokeOpacity="0.8">
                <path d="M10 3v11M6 8l4-5 4 5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 17h14" strokeLinecap="round"/>
              </svg>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-2)", fontFamily: "var(--font-inter)", marginBottom: 4 }}>
              Перетащи фото сюда или <span style={{ color: "var(--accent-lt)" }}>выбери файлы</span>
            </p>
            <p style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-inter)" }}>JPG, PNG, WEBP — любое количество</p>
          </>
        )}
      </div>

      {/* Photos Grid */}
      {gallery.photos.length > 0 && (
        <div>
          <p style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 12, fontFamily: "var(--font-inter)" }}>
            Нажми на фото чтобы сделать обложкой · Наведи чтобы удалить
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
            <AnimatePresence>
              {gallery.photos.map((photo) => {
                const isCover = gallery.coverPhotoId === photo.id;
                return (
                  <motion.div key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                    style={{
                      position: "relative", aspectRatio: "1", borderRadius: 10, overflow: "hidden", cursor: "pointer",
                      border: isCover ? "2px solid var(--accent)" : "2px solid transparent",
                      boxShadow: isCover ? "0 0 14px rgba(124,58,237,0.35)" : "none",
                    }}
                    className="photo-thumb"
                    onClick={() => setCover(photo.id)}
                  >
                    <img src={getPublicUrl(photo.previewKey)} alt={photo.filename}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", display: "block" }}
                      className="photo-img"
                    />
                    <div className="photo-overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", opacity: 0, transition: "opacity 0.15s" }} />
                    {isCover && (
                      <div style={{
                        position: "absolute", top: 6, left: 6, fontSize: 9, padding: "2px 7px", borderRadius: 5,
                        background: "var(--accent)", color: "#fff", fontFamily: "var(--font-inter)", fontWeight: 600,
                      }}>обложка</div>
                    )}
                    <button
                      className="photo-del"
                      onClick={e => { e.stopPropagation(); deletePhoto(photo.id); }}
                      style={{
                        position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 6,
                        display: "none", alignItems: "center", justifyContent: "center",
                        background: "rgba(0,0,0,0.75)", border: "1px solid rgba(255,255,255,0.15)",
                        color: "#fff", fontSize: 11, cursor: "pointer",
                      }}
                    >✕</button>

                    {/* Stats bar — always visible */}
                    {((photo as any).lightboxViews > 0 || (photo as any).downloadCount > 0) && (
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "4px 6px",
                        background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)",
                      }}>
                        {(photo as any).lightboxViews > 0 && (
                          <span style={{ display: "flex", alignItems: "center", gap: 3, color: "rgba(255,255,255,0.8)", fontSize: 10, fontFamily: "var(--font-inter)" }}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                              <ellipse cx="5" cy="5" rx="4" ry="2.7"/>
                              <circle cx="5" cy="5" r="1.2" fill="currentColor" stroke="none"/>
                            </svg>
                            {(photo as any).lightboxViews}
                          </span>
                        )}
                        {(photo as any).downloadCount > 0 && (
                          <span style={{ display: "flex", alignItems: "center", gap: 3, color: "rgba(167,139,250,0.9)", fontSize: 10, fontFamily: "var(--font-inter)" }}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 1.5v5M3 4.5l2 2 2-2"/>
                              <path d="M1.5 8.5h7"/>
                            </svg>
                            {(photo as any).downloadCount}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      <style>{`
        .name-group:hover .edit-btn { opacity: 1 !important; }
        .photo-thumb:hover .photo-overlay { opacity: 1 !important; }
        .photo-thumb:hover .photo-img { transform: scale(1.05); }
        .photo-thumb:hover .photo-del { display: flex !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function ActionBtn({ onClick, label, primary }: { onClick: () => void; label: string; primary?: boolean }) {
  return (
    <button onClick={onClick} style={{
      padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: primary ? 500 : 400, cursor: "pointer",
      background: primary ? "linear-gradient(135deg, #7C3AED, #6366F1)" : "none",
      color: primary ? "#fff" : "var(--text-2)",
      border: primary ? "none" : "1px solid var(--border)",
      fontFamily: "var(--font-inter)", transition: "all 0.15s",
      boxShadow: primary ? "0 2px 10px rgba(124,58,237,0.22)" : "none",
    }}>
      {label}
    </button>
  );
}

function ViewStats({ gallery }: { gallery: { viewCount: number; desktopViews: number; tabletViews: number; mobileViews: number } }) {
  const total = gallery.viewCount;
  const desktop = gallery.desktopViews ?? 0;
  const tablet  = gallery.tabletViews  ?? 0;
  const mobile  = gallery.mobileViews  ?? 0;
  const hasDeviceData = (desktop + tablet + mobile) > 0;

  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;

  const devices = [
    { label: "Десктоп", value: desktop, color: "#7C3AED" },
    { label: "Планшет", value: tablet,  color: "#0EA5E9" },
    { label: "Телефон", value: mobile,  color: "#10B981" },
  ].filter(d => d.value > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Total */}
      <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--accent-lt)", fontFamily: "var(--font-inter)" }}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <ellipse cx="6.5" cy="6.5" rx="5.5" ry="3.5"/>
          <circle cx="6.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
        </svg>
        {total} просмотров
      </span>

      {/* Device breakdown */}
      {hasDeviceData && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Stacked bar */}
          <div style={{ display: "flex", height: 5, borderRadius: 3, overflow: "hidden", width: 160, background: "rgba(255,255,255,0.07)" }}>
            {devices.map(d => (
              <div key={d.label} style={{ width: `${pct(d.value)}%`, background: d.color, transition: "width 0.3s" }} />
            ))}
          </div>
          {/* Legend */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {devices.map(d => (
              <span key={d.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontFamily: "var(--font-inter)", color: "var(--text-3)" }}>
                <span style={{ width: 7, height: 7, borderRadius: 2, background: d.color, display: "inline-block", flexShrink: 0 }} />
                {d.label} — <span style={{ color: "var(--text-2)", fontWeight: 500 }}>{pct(d.value)}%</span>
                <span style={{ color: "var(--text-3)", opacity: 0.6 }}>({d.value})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LinkIcon({ color }: { color?: string }) {
  return <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke={color ?? "currentColor"} strokeWidth="1.5"><path d="M5 7a3 3 0 0 0 5.12 2.12l2-2a3 3 0 0 0-4.24-4.24L6.5 4.26" strokeLinecap="round"/><path d="M9 7a3 3 0 0 0-5.12-2.12l-2 2a3 3 0 0 0 4.24 4.24L7.5 9.74" strokeLinecap="round"/></svg>;
}
function CheckIcon() {
  return <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 6.5l3.5 3.5L11 3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function ExternalIcon() {
  return <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 2H2.5A.5.5 0 0 0 2 2.5v8a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5V8" strokeLinecap="round"/><path d="M7.5 2H11v3.5M11 2L6 7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function TrashIcon() {
  return <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3.5h9M4.5 3.5V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v1M5.5 6v3M7.5 6v3M3 3.5l.5 7a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5l.5-7" strokeLinecap="round"/></svg>;
}
function LockIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--accent-lt)" strokeWidth="1.4" strokeLinecap="round"><rect x="2.5" y="6.5" width="9" height="7" rx="1.5"/><path d="M4.5 6.5V4.5a2.5 2.5 0 0 1 5 0v2"/></svg>;
}
