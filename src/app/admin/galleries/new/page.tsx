"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function NewGalleryPage() {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const res = await fetch("/api/galleries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, pin: pin.length === 3 ? pin : undefined }),
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
      style={{ maxWidth: 480, margin: "0 auto", paddingTop: 48 }}
    >
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: 28, fontWeight: 300, color: "var(--text)", margin: "0 0 6px" }}>
          Новая галерея
        </h1>
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "var(--text-3)" }}>
          Дайте название — потом сможете изменить
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="Название">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="например: Hochzeit Schmidt / F-Jugend 2026"
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10,
              border: "1px solid var(--border)", outline: "none",
              background: "var(--surface)", color: "var(--text)", fontSize: 14,
              fontFamily: "var(--font-inter)", transition: "border-color 0.15s",
            }}
            onFocus={e => (e.target.style.borderColor = "var(--accent)")}
            onBlur={e => (e.target.style.borderColor = "var(--border)")}
          />
        </Field>

        <Field label="PIN-код (необязательно)" hint="3 цифры — для защиты доступа клиента">
          <PinInputRow value={pin} onChange={setPin} />
        </Field>

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button
            type="submit"
            disabled={!name.trim() || loading}
            style={{
              flex: 1, padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 500,
              background: "linear-gradient(135deg, #7C3AED, #6366F1)",
              color: "#fff", border: "none", cursor: name.trim() ? "pointer" : "not-allowed",
              fontFamily: "var(--font-inter)", opacity: !name.trim() || loading ? 0.4 : 1,
              boxShadow: name.trim() ? "0 2px 16px rgba(124,58,237,0.28)" : "none",
              transition: "opacity 0.15s",
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.6s linear infinite", display: "inline-block" }} />
                Создаём...
              </span>
            ) : "Создать галерею"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: "12px 20px", borderRadius: 10, fontSize: 14, cursor: "pointer",
              border: "1px solid var(--border)", background: "none",
              color: "var(--text-2)", fontFamily: "var(--font-inter)",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-2)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-2)"; }}
          >
            Отмена
          </button>
        </div>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: "var(--text-2)", fontFamily: "var(--font-inter)", letterSpacing: "0.03em" }}>
          {label}
        </label>
        {hint && <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-inter)" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function PinInputRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const digits = [value[0] ?? "", value[1] ?? "", value[2] ?? ""];

  function handleDigit(idx: number, char: string) {
    const clean = char.replace(/\D/g, "").slice(-1);
    const arr = [...digits];
    arr[idx] = clean;
    onChange(arr.join(""));
    if (clean && idx < 2) {
      const next = document.getElementById(`pin-${idx + 1}`);
      (next as HTMLInputElement)?.focus();
    }
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      const prev = document.getElementById(`pin-${idx - 1}`);
      (prev as HTMLInputElement)?.focus();
    }
  }

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      {digits.map((d, i) => (
        <input
          key={i}
          id={`pin-${i}`}
          type="text"
          inputMode="numeric"
          value={d}
          onChange={e => handleDigit(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          maxLength={1}
          style={{
            width: 52, height: 52, textAlign: "center", fontSize: 22, fontWeight: 600,
            borderRadius: 12, border: d ? "1.5px solid var(--accent)" : "1px solid var(--border)",
            background: d ? "rgba(124,58,237,0.12)" : "var(--surface)",
            color: "var(--text)", outline: "none",
            fontFamily: "var(--font-inter)", transition: "all 0.15s",
            caretColor: "transparent",
          }}
          onFocus={e => (e.target.style.borderColor = "var(--accent)")}
          onBlur={e => (e.target.style.borderColor = d ? "var(--accent)" : "var(--border)")}
        />
      ))}
      {value.length === 3 && (
        <button
          type="button"
          onClick={() => onChange("")}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 4, fontSize: 18, lineHeight: 1 }}
          title="Удалить PIN"
        >
          ×
        </button>
      )}
      {value.length > 0 && value.length < 3 && (
        <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-inter)" }}>введите 3 цифры</span>
      )}
    </div>
  );
}
