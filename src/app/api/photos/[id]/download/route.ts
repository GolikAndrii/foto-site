import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPresignedDownloadUrl } from "@/lib/r2";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photo = await prisma.photo.findUnique({ where: { id } });
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [url] = await Promise.all([
    getPresignedDownloadUrl(photo.originalKey, photo.filename),
    prisma.photo.update({ where: { id }, data: { downloadCount: { increment: 1 } } }).catch(() => {}),
  ]);
  return NextResponse.json({ url });
}
