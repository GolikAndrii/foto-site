import { prisma } from "@/lib/prisma";
import { getPublicUrl } from "@/lib/r2";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let photoUrls: string[] = [];
  try {
    const gallery = await prisma.gallery.findFirst({
      orderBy: { createdAt: "desc" },
      include: { photos: { orderBy: { sortOrder: "asc" }, take: 6 } },
    });
    if (gallery) {
      photoUrls = gallery.photos.map(p =>
        p.previewSmKey  ? getPublicUrl(p.previewSmKey)  :
        p.previewMdKey  ? getPublicUrl(p.previewMdKey)  :
                          getPublicUrl(p.previewKey)
      );
    }
  } catch {}

  return <HomeClient photoUrls={photoUrls} />;
}
