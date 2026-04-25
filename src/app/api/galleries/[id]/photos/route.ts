import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadToR2 } from "@/lib/r2";
import sharp from "sharp";

async function generatePreviews(buffer: Buffer, baseName: string) {
  const sizes = [
    { key: `previews/${baseName}_lg.webp`, width: 1400, quality: 82 }, // desktop / lightbox
    { key: `previews/${baseName}_md.webp`, width: 900,  quality: 80 }, // tablet
    { key: `previews/${baseName}_sm.webp`, width: 600,  quality: 78 }, // mobile
  ];

  const results = await Promise.all(
    sizes.map(async ({ key, width, quality }) => {
      const buf = await sharp(buffer)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();
      await uploadToR2(key, buf, "image/webp");
      return key;
    })
  );

  return { previewKey: results[0], previewMdKey: results[1], previewSmKey: results[2] };
}

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
  const source = formData.get("source") as File | null;

  if (source) {
    // Presigned flow: original already in R2, generate 3 preview sizes from resized source
    const originalKey = formData.get("originalKey") as string;
    const filename = formData.get("filename") as string;
    const sizeBytes = Number(formData.get("sizeBytes") ?? 0);
    const baseName = originalKey.replace(/^originals\//, "").replace(/\.[^.]+$/, "");

    const buffer = Buffer.from(await source.arrayBuffer());
    const { previewKey, previewMdKey, previewSmKey } = await generatePreviews(buffer, baseName);

    const photo = await prisma.photo.create({
      data: { galleryId, originalKey, previewKey, previewMdKey, previewSmKey, filename, sizeBytes, sortOrder },
    });
    uploaded.push(photo);
  } else {
    // Fallback: file sent directly (client-resized)
    const files = formData.getAll("files") as File[];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const baseName = `${galleryId}/${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const originalKey = `originals/${baseName}.${ext}`;

      await uploadToR2(originalKey, buffer, file.type || "image/jpeg");
      const { previewKey, previewMdKey, previewSmKey } = await generatePreviews(buffer, baseName);

      const photo = await prisma.photo.create({
        data: { galleryId, originalKey, previewKey, previewMdKey, previewSmKey, filename: file.name, sizeBytes: file.size, sortOrder: sortOrder++ },
      });
      uploaded.push(photo);
    }
  }

  return NextResponse.json(uploaded);
}
