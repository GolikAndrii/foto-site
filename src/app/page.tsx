import { prisma } from "@/lib/prisma";
import { getPublicUrl } from "@/lib/r2";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let photoUrls: string[] = [];
  try {
    // Pull from ALL galleries, shuffle, take 6 random
    const photos = await prisma.photo.findMany({
      take: 60,
      orderBy: { createdAt: "desc" },
      select: { previewSmKey: true, previewMdKey: true, previewKey: true },
    });
    const shuffled = photos.sort(() => Math.random() - 0.5).slice(0, 6);
    photoUrls = shuffled.map(p =>
      p.previewSmKey ? getPublicUrl(p.previewSmKey) :
      p.previewMdKey ? getPublicUrl(p.previewMdKey) :
                       getPublicUrl(p.previewKey)
    );
  } catch {}

  return <HomeClient photoUrls={photoUrls} />;
}
