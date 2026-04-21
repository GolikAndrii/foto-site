import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";
import sharp from "sharp";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: galleryId } = await params;

  const gallery = await prisma.gallery.findUnique({ where: { id: galleryId } });
  if (!gallery) return NextResponse.json({ error: "Gallery not found" }, { status: 404 });

  const formData = await req.formData();

  const lastPhoto = await prisma.photo.findFirst({
    where: { galleryId },
    orderBy: { sortOrder: "desc" },
  });
  let sortOrder = (lastPhoto?.sortOrder ?? -1) + 1;

  const uploaded = [];

  // Support both new flow (source + keys) and legacy multi-file flow
  const source = formData.get("source") as File | null;

  if (source) {
    // New presigned flow: original already in R2, just generate preview
    const originalKey = formData.get("originalKey") as string;
    const previewKey = formData.get("previewKey") as string;
    const filename = formData.get("filename") as string;
    const sizeBytes = Number(formData.get("sizeBytes") ?? 0);

    const buffer = Buffer.from(await source.arrayBuffer());
    const previewBuffer = await sharp(buffer)
      .resize({ width: 1400, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    await uploadToR2(previewKey, previewBuffer, "image/webp");

    const photo = await prisma.photo.create({
      data: { galleryId, originalKey, previewKey, filename, sizeBytes, sortOrder },
    });
    uploaded.push(photo);
  } else {
    // Fallback: single file sent directly (client-resized to fit under 4MB)
    const files = formData.getAll("files") as File[];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const baseName = `${galleryId}/${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const originalKey = `originals/${baseName}.${ext}`;
      const previewKey = `previews/${baseName}.webp`;

      const previewBuffer = await sharp(buffer)
        .resize({ width: 1400, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();

      await uploadToR2(originalKey, buffer, file.type || "image/jpeg");
      await uploadToR2(previewKey, previewBuffer, "image/webp");

      const photo = await prisma.photo.create({
        data: { galleryId, originalKey, previewKey, filename: file.name, sizeBytes: file.size, sortOrder: sortOrder++ },
      });
      uploaded.push(photo);
    }
  }

  return NextResponse.json(uploaded);
}
