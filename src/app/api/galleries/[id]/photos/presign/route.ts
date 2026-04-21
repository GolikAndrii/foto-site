import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPresignedUploadUrl } from "@/lib/r2";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: galleryId } = await params;
  const { filename, contentType } = await req.json();

  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  const baseName = `${galleryId}/${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const originalKey = `originals/${baseName}.${ext}`;
  const previewKey = `previews/${baseName}.webp`;

  const presignedUrl = await getPresignedUploadUrl(originalKey, contentType || "image/jpeg");

  return NextResponse.json({ presignedUrl, originalKey, previewKey });
}
