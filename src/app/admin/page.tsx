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
      photos: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
      _count: { select: { photos: true } },
    },
  });

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-light text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Галереи
          </h1>
          <p className="text-sm text-neutral-500 mt-1" style={{ fontFamily: "var(--font-inter)" }}>
            {galleries.length === 0
              ? "Пока нет галерей"
              : `${galleries.length} ${galleries.length === 1 ? "галерея" : galleries.length < 5 ? "галереи" : "галерей"}`}
          </p>
        </div>

        <Link
          href="/admin/galleries/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #FF6B00, #FF8C33)",
            color: "#fff",
            fontFamily: "var(--font-inter)",
            boxShadow: "0 2px 16px rgba(255,107,0,0.2)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 2v10M2 7h10" strokeLinecap="round"/>
          </svg>
          Новая галерея
        </Link>
      </div>

      {galleries.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-32 rounded-2xl border border-dashed border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#FF6B00" strokeWidth="1.2" strokeOpacity="0.5">
              <rect x="2" y="2" width="11" height="11" rx="2"/>
              <rect x="15" y="2" width="11" height="11" rx="2"/>
              <rect x="2" y="15" width="11" height="11" rx="2"/>
              <rect x="15" y="15" width="11" height="11" rx="2"/>
            </svg>
          </div>
          <p className="text-lg text-neutral-300 mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
            Галерей пока нет
          </p>
          <p className="text-sm text-neutral-600 mb-8" style={{ fontFamily: "var(--font-inter)" }}>
            Создайте первую галерею и загрузите фото
          </p>
          <Link
            href="/admin/galleries/new"
            className="px-6 py-3 rounded-lg text-sm font-medium transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #FF6B00, #FF8C33)",
              color: "#fff",
              fontFamily: "var(--font-inter)",
              boxShadow: "0 2px 16px rgba(255,107,0,0.2)",
            }}
          >
            Создать галерею
          </Link>
        </div>
      ) : (
        /* Galleries grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {galleries.map((gallery) => {
            const coverPhoto = gallery.photos[0];
            const coverUrl = coverPhoto ? getPublicUrl(coverPhoto.previewKey) : null;
            return (
              <Link key={gallery.id} href={`/admin/galleries/${gallery.id}`}>
                <div className="group rounded-xl overflow-hidden border border-white/[0.06] bg-[#141414] transition-all duration-200 hover:border-orange-500/30 hover:shadow-[0_0_24px_rgba(255,107,0,0.08)] cursor-pointer">
                  {/* Cover */}
                  <div className="h-48 relative overflow-hidden bg-[#1A1A1A]">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={gallery.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-2">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#333" strokeWidth="1.2">
                          <rect x="2" y="6" width="28" height="20" rx="3"/>
                          <circle cx="16" cy="16" r="6"/>
                          <circle cx="16" cy="16" r="2"/>
                          <path d="M8 6V4M24 6V4" strokeLinecap="round"/>
                        </svg>
                        <span className="text-xs text-neutral-600">Нет фото</span>
                      </div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Photo count badge */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs font-medium bg-black/60 text-neutral-300 backdrop-blur-sm border border-white/10">
                      {gallery._count.photos} фото
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="min-w-0">
                      <h2 className="font-medium text-sm truncate text-white" style={{ fontFamily: "var(--font-inter)" }}>
                        {gallery.name}
                      </h2>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#555" strokeWidth="1.5" className="shrink-0 ml-2 group-hover:stroke-orange-500 transition-colors">
                      <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
