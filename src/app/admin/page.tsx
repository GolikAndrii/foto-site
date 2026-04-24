import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPublicUrl } from "@/lib/r2";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/");

  const galleries = await prisma.gallery.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      _count: { select: { photos: true } },
    },
  });

  const totalPhotos = galleries.reduce((sum, g) => sum + g._count.photos, 0);

  return (
    <div>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: 28, fontWeight: 300, color: "var(--text)", margin: 0 }}>
            Галереи
          </h1>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>
            {galleries.length === 0 ? "Пока нет галерей" : `${galleries.length} ${galleries.length === 1 ? "галерея" : galleries.length < 5 ? "галереи" : "галерей"}`}
          </p>
        </div>
        <Link
          href="/admin/galleries/new"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500,
            background: "linear-gradient(135deg, #7C3AED, #6366F1)",
            color: "#fff", textDecoration: "none",
            fontFamily: "var(--font-inter)",
            boxShadow: "0 2px 16px rgba(124,58,237,0.28)",
          }}
        >
          <PlusIcon /> Новая галерея
        </Link>
      </div>

      {/* Stats row */}
      {galleries.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
          <StatCard label="Галерей" value={galleries.length} icon={<GalleryStatIcon />} />
          <StatCard label="Фотографий" value={totalPhotos} icon={<PhotoStatIcon />} />
          <StatCard label="С PIN-защитой" value={galleries.filter((g: { pin: string | null }) => g.pin).length} icon={<LockStatIcon />} />
        </div>
      )}

      {galleries.length === 0 ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "80px 24px", borderRadius: 16,
          border: "1px dashed var(--border-2)",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: "var(--surface-2)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
          }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="var(--accent)" strokeWidth="1.2" strokeOpacity="0.5">
              <rect x="2" y="2" width="10" height="10" rx="2"/><rect x="14" y="2" width="10" height="10" rx="2"/>
              <rect x="2" y="14" width="10" height="10" rx="2"/><rect x="14" y="14" width="10" height="10" rx="2"/>
            </svg>
          </div>
          <p style={{ fontFamily: "var(--font-playfair)", fontSize: 18, color: "var(--text-2)", marginBottom: 6 }}>
            Галерей пока нет
          </p>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "var(--text-3)", marginBottom: 24 }}>
            Создайте первую галерею и загрузите фото
          </p>
          <Link href="/admin/galleries/new" style={{
            padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 500,
            background: "linear-gradient(135deg, #7C3AED, #6366F1)",
            color: "#fff", textDecoration: "none",
            fontFamily: "var(--font-inter)",
            boxShadow: "0 2px 16px rgba(124,58,237,0.25)",
          }}>
            Создать галерею
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {galleries.map((gallery) => {
            const coverPhoto = gallery.photos[0];
            const coverUrl = coverPhoto ? getPublicUrl(coverPhoto.previewKey) : null;
            return (
              <Link key={gallery.id} href={`/admin/galleries/${gallery.id}`} style={{ textDecoration: "none" }}>
                <div className="gallery-card" style={{
                  borderRadius: 14, overflow: "hidden",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}>
                  {/* Cover */}
                  <div style={{ height: 180, position: "relative", overflow: "hidden", background: "#0D0D1A" }}>
                    {coverUrl ? (
                      <img src={coverUrl} alt={gallery.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s", display: "block" }}
                        className="gallery-card-img"
                      />
                    ) : (
                      <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="var(--border-2)" strokeWidth="1.2">
                          <rect x="2" y="6" width="26" height="18" rx="3"/><circle cx="15" cy="15" r="5"/><circle cx="15" cy="15" r="2"/><path d="M7 6V4M23 6V4" strokeLinecap="round"/>
                        </svg>
                        <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-inter)" }}>Нет фото</span>
                      </div>
                    )}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)" }} />
                    <div style={{
                      position: "absolute", top: 10, right: 10,
                      padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 500,
                      background: "rgba(0,0,0,0.6)", color: "var(--text-2)",
                      backdropFilter: "blur(6px)", border: "1px solid var(--border)",
                      fontFamily: "var(--font-inter)",
                    }}>
                      {gallery._count.photos} фото
                    </div>
                    {(gallery as { pin: string | null }).pin && (
                      <div style={{
                        position: "absolute", top: 10, left: 10,
                        padding: "3px 8px", borderRadius: 6, fontSize: 10,
                        background: "rgba(124,58,237,0.3)", color: "var(--accent-lt)",
                        border: "1px solid rgba(124,58,237,0.35)",
                        fontFamily: "var(--font-inter)",
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="5.5" width="8" height="6" rx="1"/><path d="M4 5.5V4a2 2 0 0 1 4 0v1.5"/></svg>
                        PIN
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", fontFamily: "var(--font-inter)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {gallery.name}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--text-3)" strokeWidth="1.5" style={{ flexShrink: 0, marginLeft: 8 }}>
                      <path d="M5 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        .gallery-card:hover { border-color: rgba(124,58,237,0.35) !important; box-shadow: 0 0 28px rgba(124,58,237,0.1); }
        .gallery-card:hover .gallery-card-img { transform: scale(1.04); }
      `}</style>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div style={{
      padding: "16px 18px", borderRadius: 12,
      background: "var(--surface)", border: "1px solid var(--border)",
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.15))",
        border: "1px solid rgba(124,58,237,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--accent-lt)", flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 600, color: "var(--text)", lineHeight: 1, fontFamily: "var(--font-inter)" }}>{value}</div>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2, fontFamily: "var(--font-inter)" }}>{label}</div>
      </div>
    </div>
  );
}

function PlusIcon() {
  return <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 2v10M2 7h10" strokeLinecap="round"/></svg>;
}
function GalleryStatIcon() {
  return <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1.5" y="3.5" width="13" height="10" rx="1.5"/><path d="M1.5 10l3-3 2.5 2.5 3-4 4 4.5"/><circle cx="5" cy="6.5" r="1"/></svg>;
}
function PhotoStatIcon() {
  return <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1.5" y="2.5" width="13" height="11" rx="2"/><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r="1"/><path d="M5.5 2.5V1.5M10.5 2.5V1.5" /></svg>;
}
function LockStatIcon() {
  return <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="7" width="10" height="8" rx="1.5"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/></svg>;
}
