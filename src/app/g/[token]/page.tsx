import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getPublicUrl } from "@/lib/r2";
import PublicGalleryClient from "./PublicGalleryClient";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const gallery = await prisma.gallery.findUnique({
    where: { shareToken: token },
    include: { photos: { take: 1, orderBy: { sortOrder: "asc" } } },
  });
  if (!gallery) return {};

  // Use cover photo if set, otherwise first photo
  let coverPreviewKey: string | null = null;
  if (gallery.coverPhotoId) {
    const cover = await prisma.photo.findUnique({ where: { id: gallery.coverPhotoId } });
    coverPreviewKey = cover?.previewKey ?? null;
  }
  if (!coverPreviewKey && gallery.photos[0]) {
    coverPreviewKey = gallery.photos[0].previewKey;
  }

  const ogImage = coverPreviewKey ? getPublicUrl(coverPreviewKey) : undefined;

  return {
    title: gallery.name,
    description: `Fotogalerie von Andrii Golik`,
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

  const photos = gallery.photos.map((p) => ({
    id: p.id,
    previewUrl: getPublicUrl(p.previewKey),
    filename: p.filename,
  }));

  return <PublicGalleryClient galleryName={gallery.name} photos={photos} />;
}
