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
      transition={{ duration: 0.4 }}
      className="max-w-lg mx-auto mt-16"
    >
      <h1
        className="text-3xl font-light mb-8"
        style={{ fontFamily: "var(--font-playfair)", color: "#2C1F0E" }}
      >
        Новая галерея
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            className="block text-sm mb-2"
            style={{ color: "#7A5A32", fontFamily: "var(--font-inter)" }}
          >
            Название галереи
          </label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="например: Hochzeit Schmidt / F-Jugend 2026"
            className="w-full px-4 py-3 rounded-xl border outline-none transition-all text-base"
            style={{
              borderColor: "#D9C9AB",
              backgroundColor: "#fff",
              color: "#2C1F0E",
              fontFamily: "var(--font-inter)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#C9A97A")}
            onBlur={(e) => (e.target.style.borderColor = "#D9C9AB")}
          />
        </div>

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="flex-1 py-3 rounded-full text-sm font-medium transition-all disabled:opacity-40"
            style={{
              backgroundColor: "#C9A97A",
              color: "#FAF7F2",
              fontFamily: "var(--font-inter)",
            }}
          >
            {loading ? "Создаём..." : "Создать галерею"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-full text-sm border transition-all"
            style={{
              borderColor: "#D9C9AB",
              color: "#7A5A32",
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
