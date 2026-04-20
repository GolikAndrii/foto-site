"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function NewGalleryPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const res = await fetch("/api/galleries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      const gallery = await res.json();
      router.push(`/admin/galleries/${gallery.id}`);
    } else {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-lg mx-auto mt-16"
    >
      <div className="mb-8">
        <h1
          className="text-3xl font-light text-white mb-2"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Новая галерея
        </h1>
        <p className="text-sm text-neutral-500" style={{ fontFamily: "var(--font-inter)" }}>
          Дайте название — потом сможете изменить
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            className="block text-sm mb-2 text-neutral-400"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Название
          </label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="например: Hochzeit Schmidt / F-Jugend 2026"
            className="w-full px-4 py-3.5 rounded-xl border outline-none transition-all text-base bg-[#141414] text-white placeholder-neutral-600"
            style={{
              borderColor: "#2A2A2A",
              fontFamily: "var(--font-inter)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#FF6B00")}
            onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
          />
        </div>

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="flex-1 py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
            style={{
              background: "linear-gradient(135deg, #FF6B00, #FF8C33)",
              color: "#fff",
              fontFamily: "var(--font-inter)",
              boxShadow: name.trim() ? "0 2px 16px rgba(255,107,0,0.25)" : "none",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Создаём...
              </span>
            ) : "Создать галерею"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3.5 rounded-xl text-sm border transition-all text-neutral-400 hover:text-white hover:border-white/20"
            style={{
              borderColor: "#2A2A2A",
              fontFamily: "var(--font-inter)",
            }}
          >
            Отмена
          </button>
        </div>
      </form>
    </motion.div>
  );
}
