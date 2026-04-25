import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getPublicUrl } from "@/lib/r2";
import { cookies } from "next/headers";
import PublicGalleryClient from "./PublicGalleryClient";
import PinEntry from "./PinEntry";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const gallery = await prisma.gallery.findUnique({
    where: { shareToken: token },
    include: { photos: { take: 1, orderBy: { sortOrder: "asc" } } },
  });
  if (!gallery) return {};

  let coverPreviewKey: string | null = null;
  if (gallery.coverPhotoId) {
    const cover = await prisma.photo.findUnique({ where: { id: gallery.coverPhotoId } });
    coverPreviewKey = cover?.previewKey ?? null;
  }
  if (!coverPreviewKey && gallery.photos[0]) coverPreviewKey = gallery.photos[0].previewKey;

  const ogImage = coverPreviewKey ? getPublicUrl(coverPreviewKey) : undefined;
  return {
    title: gallery.name,
    description: `Fotogalerie von Andrii Golik`,
    robots: { index: false, follow: false },
    openGraph: {
      title: gallery.name,
      description: `Fotogalerie von Andrii Golik`,
      type: "website",
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
    },
  };
}

export default async function PublicGalleryPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const gallery = await prisma.gallery.findUnique({
    where: { shareToken: token },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });

  if (!gallery) notFound();

  // PIN check
  if (gallery.pin) {
    const jar = await cookies();
    const savedPin = jar.get(`folio_pin_${gallery.id}`)?.value;
    if (savedPin !== gallery.pin) {
      return <PinEntry galleryId={gallery.id} galleryName={gallery.name} />;
    }
  }

  const photos = gallery.photos.map((p) => ({
    id: p.id,
    previewUrl: getPublicUrl(p.previewKey),
    previewMdUrl: p.previewMdKey ? getPublicUrl(p.previewMdKey) : null,
    previewSmUrl: p.previewSmKey ? getPublicUrl(p.previewSmKey) : null,
    filename: p.filename,
  }));

  return <PublicGalleryClient galleryId={gallery.id} galleryName={gallery.name} photos={photos} />;
}
