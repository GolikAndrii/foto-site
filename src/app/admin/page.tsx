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
      <div className="flex items-center justify-between mb-8">
        <h1
          className="text-3xl font-light"
          style={{ fontFamily: "var(--font-playfair)", color: "#2C1F0E" }}
        >
          Галереи
        </h1>
        <span className="text-sm" style={{ color: "#9A7340" }}>
          {galleries.length} {galleries.length === 1 ? "галерея" : galleries.length < 5 ? "галереи" : "галерей"}
        </span>
      </div>

      {galleries.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-32 rounded-2xl border-2 border-dashed"
          style={{ borderColor: "#D9C9AB", color: "#9A7340" }}
        >
          <div className="text-5xl mb-4 opacity-30">◻</div>
          <p className="text-lg mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
            Галерей пока нет
          </p>
          <Link
            href="/admin/galleries/new"
            className="px-6 py-3 rounded-full text-sm"
            style={{ backgroundColor: "#C9A97A", color: "#FAF7F2" }}
          >
            Создать первую галерею
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery) => {
            const coverPhoto = gallery.photos[0];
            const coverUrl = coverPhoto ? getPublicUrl(coverPhoto.previewKey) : null;
            return (
              <Link key={gallery.id} href={`/admin/galleries/${gallery.id}`}>
                <div
                  className="rounded-2xl overflow-hidden border transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                  style={{ borderColor: "#E8DCC8", backgroundColor: "#fff" }}
                >
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{
                      backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
                      backgroundColor: coverUrl ? undefined : "#EDE3D4",
                    }}
                  >
                    {!coverUrl && (
                      <div className="h-full flex items-center justify-center opacity-30 text-4xl">
                        ◻
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2
                      className="font-medium text-base truncate"
                      style={{ color: "#2C1F0E", fontFamily: "var(--font-inter)" }}
                    >
                      {gallery.name}
                    </h2>
                    <p className="text-sm mt-1" style={{ color: "#9A7340" }}>
                      {gallery._count.photos} фото
                    </p>
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
