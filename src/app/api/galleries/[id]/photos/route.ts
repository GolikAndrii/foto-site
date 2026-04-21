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

  // New flow: source is a client-resized blob, original already uploaded to R2 directly
  const source = formData.get("source") as File | null;
  const originalKey = formData.get("originalKey") as string;
  const previewKey = formData.get("previewKey") as string;
  const filename = formData.get("filename") as string;
  const sizeBytes = Number(formData.get("sizeBytes") ?? 0);

  if (!source || !originalKey || !previewKey) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const lastPhoto = await prisma.photo.findFirst({
    where: { galleryId },
    orderBy: { sortOrder: "desc" },
  });
  const sortOrder = (lastPhoto?.sortOrder ?? -1) + 1;

  const buffer = Buffer.from(await source.arrayBuffer());
  const previewBuffer = await sharp(buffer)
    .resize({ width: 1400, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  await uploadToR2(previewKey, previewBuffer, "image/webp");

  const photo = await prisma.photo.create({
    data: { galleryId, originalKey, previewKey, filename, sizeBytes, sortOrder },
  });

  return NextResponse.json(photo);
}
